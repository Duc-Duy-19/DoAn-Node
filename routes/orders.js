var express = require('express');
var router = express.Router();
let orderSchema = require('../schemas/orders');
let orderItemSchema = require('../schemas/orderItems');
let cartSchema = require('../schemas/carts');
let addressSchema = require('../schemas/addresses');
let productSchema = require('../schemas/products');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// Tạo mã đơn hàng duy nhất
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
}

// Lấy tất cả đơn hàng (đơn của mình hoặc tất cả cho ADMIN/MOD)
router.get('/', Authentication, async function(req, res, next) {
  try {
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    let query = {isDeleted: false};
    
    // Nếu không phải ADMIN/MOD, chỉ hiện đơn hàng của chính mình
    if (user.role.name !== "ADMIN" && user.role.name !== "MOD") {
      query.user = req.userId;
    }
    
    let orders = await orderSchema.find(query)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'shippingAddress'
      })
      .sort({ createdAt: -1 });
    Response(res, 200, true, orders);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Lấy đơn hàng theo ID (đơn của mình hoặc ADMIN/MOD)
router.get('/:id', Authentication, async function(req, res, next) {
  try {
    let order = await orderSchema.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'shippingAddress'
      });
    
    if (!order || order.isDeleted) {
      Response(res, 404, false, "Order not found");
      return;
    }

    // Check permission
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    if (user.role.name !== "ADMIN" && user.role.name !== "MOD" && order.user._id.toString() !== req.userId) {
      Response(res, 403, false, "You can only view your own orders");
      return;
    }

    // Lấy các sản phẩm trong đơn hàng
    let orderItems = await orderItemSchema.find({
      order: order._id,
      isDeleted: false
    }).populate({
      path: 'product',
      select: 'name price imageURLs'
    });

    let orderWithItems = order.toObject();
    orderWithItems.items = orderItems;

    Response(res, 200, true, orderWithItems);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// POST - Tạo đơn hàng từ giỏ hàng
router.post('/', Authentication, async function(req, res, next) {
  try {
    // Kiểm tra địa chỉ có tồn tại và thuộc về user không
    let address = await addressSchema.findById(req.body.shippingAddressId);
    if (!address || address.isDeleted) {
      Response(res, 404, false, "Shipping address not found");
      return;
    }
    if (address.user.toString() !== req.userId) {
      Response(res, 403, false, "Invalid shipping address");
      return;
    }

    // Lấy giỏ hàng của user
    let cart = await cartSchema.findOne({
      user: req.userId,
      isDeleted: false
    }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      Response(res, 400, false, "Cart is empty");
      return;
    }

    // Kiểm tra tồn kho cho tất cả sản phẩm
    for (let item of cart.items) {
      if (item.product.stock < item.quantity) {
        Response(res, 400, false, `Not enough stock for ${item.product.name}`);
        return;
      }
    }

    // Tạo đơn hàng
    let newOrder = new orderSchema({
      user: req.userId,
      orderNumber: generateOrderNumber(),
      totalAmount: cart.totalAmount,
      shippingAddress: req.body.shippingAddressId,
      paymentMethod: req.body.paymentMethod || 'COD'
    });
    await newOrder.save();

    // Tạo các sản phẩm trong đơn hàng và cập nhật tồn kho
    for (let item of cart.items) {
      let orderItem = new orderItemSchema({
        order: newOrder._id,
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      });
      await orderItem.save();

      // Giảm tồn kho sản phẩm
      let product = await productSchema.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();
    }

    // Xóa giỏ hàng
    cart.items = [];
    await cart.save();

    // Lấy chi tiết đầy đủ đơn hàng
    let order = await orderSchema.findById(newOrder._id)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'shippingAddress'
      });

    let orderItems = await orderItemSchema.find({
      order: order._id
    }).populate({
      path: 'product',
      select: 'name price imageURLs'
    });

    let orderWithItems = order.toObject();
    orderWithItems.items = orderItems;

    Response(res, 201, true, orderWithItems);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// PUT - Cập nhật trạng thái đơn hàng (chỉ ADMIN/MOD)
router.put('/:id/status', Authentication, Authorization("ADMIN", "MOD"), async function(req, res, next) {
  try {
    let order = await orderSchema.findById(req.params.id);
    if (!order || order.isDeleted) {
      Response(res, 404, false, "Order not found");
      return;
    }

    order.status = req.body.status;
    await order.save();

    let updatedOrder = await orderSchema.findById(order._id)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'shippingAddress'
      });
    Response(res, 200, true, updatedOrder);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// DELETE - Hủy đơn hàng (đơn của mình nếu đang chờ, hoặc ADMIN)
router.delete('/:id', Authentication, async function(req, res, next) {
  try {
    let order = await orderSchema.findById(req.params.id);
    if (!order || order.isDeleted) {
      Response(res, 404, false, "Order not found");
      return;
    }

    // Check permission
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    if (user.role.name !== "ADMIN") {
      if (order.user.toString() !== req.userId) {
        Response(res, 403, false, "You can only cancel your own orders");
        return;
      }
      if (order.status !== 'pending') {
        Response(res, 400, false, "Can only cancel pending orders");
        return;
      }
    }

    // Hoàn trả tồn kho sản phẩm
    let orderItems = await orderItemSchema.find({
      order: order._id,
      isDeleted: false
    });

    for (let item of orderItems) {
      let product = await productSchema.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    order.isDeleted = true;
    await order.save();

    Response(res, 200, true, "Order cancelled successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;

