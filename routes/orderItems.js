var express = require('express');
var router = express.Router();
let orderItemSchema = require('../schemas/orderItems');
let orderSchema = require('../schemas/orders');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// Lấy tất cả sản phẩm trong đơn hàng (chỉ ADMIN/MOD)
router.get('/', Authentication, Authorization("ADMIN", "MOD"), async function(req, res, next) {
  try {
    let orderItems = await orderItemSchema.find({isDeleted: false})
      .populate({
        path: 'order',
        select: 'orderNumber status totalAmount'
      })
      .populate({
        path: 'product',
        select: 'name price imageURLs'
      });
    Response(res, 200, true, orderItems);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Lấy sản phẩm trong đơn hàng theo ID đơn hàng (đơn của mình hoặc ADMIN/MOD)
router.get('/order/:orderId', Authentication, async function(req, res, next) {
  try {
    let order = await orderSchema.findById(req.params.orderId);
    if (!order || order.isDeleted) {
      Response(res, 404, false, "Order not found");
      return;
    }

    // Check permission
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    if (user.role.name !== "ADMIN" && user.role.name !== "MOD" && order.user.toString() !== req.userId) {
      Response(res, 403, false, "You can only view items from your own orders");
      return;
    }

    let orderItems = await orderItemSchema.find({
      order: req.params.orderId,
      isDeleted: false
    })
      .populate({
        path: 'order',
        select: 'orderNumber status totalAmount'
      })
      .populate({
        path: 'product',
        select: 'name price imageURLs'
      });
    
    Response(res, 200, true, orderItems);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Lấy sản phẩm trong đơn hàng theo ID (ADMIN/MOD hoặc chủ sở hữu)
router.get('/:id', Authentication, async function(req, res, next) {
  try {
    let orderItem = await orderItemSchema.findById(req.params.id)
      .populate({
        path: 'order',
        populate: {
          path: 'user',
          select: 'username email'
        }
      })
      .populate({
        path: 'product',
        select: 'name price imageURLs description'
      });
    
    if (!orderItem || orderItem.isDeleted) {
      Response(res, 404, false, "Order item not found");
      return;
    }

    // Kiểm tra quyền
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    if (user.role.name !== "ADMIN" && user.role.name !== "MOD" && orderItem.order.user._id.toString() !== req.userId) {
      Response(res, 403, false, "Access denied");
      return;
    }

    Response(res, 200, true, orderItem);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;

