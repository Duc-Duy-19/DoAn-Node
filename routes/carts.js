var express = require('express');
var router = express.Router();
let cartSchema = require('../schemas/carts');
let productSchema = require('../schemas/products');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// Lấy giỏ hàng của user hiện tại hoặc tất cả giỏ hàng (ADMIN)
router.get('/', Authentication, async function(req, res, next) {
  try {
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    let query = {isDeleted: false};
    
    // Nếu không phải ADMIN, chỉ hiện giỏ hàng của chính mình
    if (user.role.name !== "ADMIN") {
      query.user = req.userId;
    }
    
    let carts = await cartSchema.find(query)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'items.product',
        select: 'name price imageURLs stock'
      });
    Response(res, 200, true, carts);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Lấy giỏ hàng theo ID user (giỏ hàng của mình hoặc ADMIN)
router.get('/user/:userId', Authentication, async function(req, res, next) {
  try {
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    
    // Kiểm tra quyền
    if (user.role.name !== "ADMIN" && req.params.userId !== req.userId) {
      Response(res, 403, false, "You can only view your own cart");
      return;
    }

    let cart = await cartSchema.findOne({
      user: req.params.userId,
      isDeleted: false
    })
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'items.product',
        select: 'name price imageURLs stock'
      });
    
    if (!cart) {
      Response(res, 404, false, "Cart not found");
      return;
    }
    
    Response(res, 200, true, cart);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// POST - Thêm sản phẩm vào giỏ hàng (tạo giỏ hàng nếu chưa có)
router.post('/add', Authentication, async function(req, res, next) {
  try {
    // Kiểm tra sản phẩm có tồn tại không
    let product = await productSchema.findById(req.body.productId);
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found");
      return;
    }

    // Kiểm tra tồn kho
    if (product.stock < req.body.quantity) {
      Response(res, 400, false, "Not enough stock available");
      return;
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await cartSchema.findOne({
      user: req.userId,
      isDeleted: false
    });

    if (!cart) {
      cart = new cartSchema({
        user: req.userId,
        items: []
      });
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    let existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === req.body.productId
    );

    if (existingItemIndex >= 0) {
      // Cập nhật số lượng
      cart.items[existingItemIndex].quantity += req.body.quantity;
      
      // Kiểm tra lại tồn kho
      if (product.stock < cart.items[existingItemIndex].quantity) {
        Response(res, 400, false, "Not enough stock available");
        return;
      }
    } else {
      // Thêm sản phẩm mới
      cart.items.push({
        product: req.body.productId,
        quantity: req.body.quantity,
        price: product.price
      });
    }

    await cart.save();
    
    let updatedCart = await cartSchema.findById(cart._id)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'items.product',
        select: 'name price imageURLs stock'
      });
    Response(res, 200, true, updatedCart);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// PUT - Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/update/:productId', Authentication, async function(req, res, next) {
  try {
    let cart = await cartSchema.findOne({
      user: req.userId,
      isDeleted: false
    });

    if (!cart) {
      Response(res, 404, false, "Cart not found");
      return;
    }

    let itemIndex = cart.items.findIndex(
      item => item.product.toString() === req.params.productId
    );

    if (itemIndex < 0) {
      Response(res, 404, false, "Product not in cart");
      return;
    }

    // Kiểm tra tồn kho
    let product = await productSchema.findById(req.params.productId);
    if (product.stock < req.body.quantity) {
      Response(res, 400, false, "Not enough stock available");
      return;
    }

    cart.items[itemIndex].quantity = req.body.quantity;
    await cart.save();
    
    let updatedCart = await cartSchema.findById(cart._id)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'items.product',
        select: 'name price imageURLs stock'
      });
    Response(res, 200, true, updatedCart);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// DELETE - Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:productId', Authentication, async function(req, res, next) {
  try {
    let cart = await cartSchema.findOne({
      user: req.userId,
      isDeleted: false
    });

    if (!cart) {
      Response(res, 404, false, "Cart not found");
      return;
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );
    
    await cart.save();
    
    let updatedCart = await cartSchema.findById(cart._id)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'items.product',
        select: 'name price imageURLs stock'
      });
    Response(res, 200, true, updatedCart);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// DELETE - Xóa toàn bộ giỏ hàng
router.delete('/clear', Authentication, async function(req, res, next) {
  try {
    let cart = await cartSchema.findOne({
      user: req.userId,
      isDeleted: false
    });

    if (!cart) {
      Response(res, 404, false, "Cart not found");
      return;
    }

    cart.items = [];
    await cart.save();
    Response(res, 200, true, "Cart cleared successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;

