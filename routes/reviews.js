var express = require('express');
var router = express.Router();
let reviewSchema = require('../schemas/reviews');
let productSchema = require('../schemas/products');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// Lấy tất cả đánh giá (công khai)
router.get('/', async function(req, res, next) {
  try {
    let reviews = await reviewSchema.find({isDeleted: false})
      .populate({
        path: 'user',
        select: 'username'
      })
      .populate({
        path: 'product',
        select: 'name price'
      });
    Response(res, 200, true, reviews);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Lấy đánh giá theo ID sản phẩm (công khai)
router.get('/product/:productId', async function(req, res, next) {
  try {
    let reviews = await reviewSchema.find({
      product: req.params.productId,
      isDeleted: false
    })
      .populate({
        path: 'user',
        select: 'username'
      })
      .populate({
        path: 'product',
        select: 'name price'
      });
    Response(res, 200, true, reviews);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Lấy đánh giá theo ID (công khai)
router.get('/:id', async function(req, res, next) {
  try {
    let review = await reviewSchema.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'username email'
      })
      .populate({
        path: 'product',
        select: 'name price description'
      });
    
    if (!review || review.isDeleted) {
      Response(res, 404, false, "Review not found");
      return;
    }
    Response(res, 200, true, review);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// POST - Tạo đánh giá mới (user đã xác thực)
router.post('/', Authentication, async function(req, res, next) {
  try {
    // Kiểm tra sản phẩm có tồn tại không
    let product = await productSchema.findById(req.body.product);
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found");
      return;
    }

    // Kiểm tra user đã đánh giá sản phẩm này chưa
    let existingReview = await reviewSchema.findOne({
      user: req.userId,
      product: req.body.product,
      isDeleted: false
    });
    
    if (existingReview) {
      Response(res, 400, false, "You have already reviewed this product");
      return;
    }

    let newReview = new reviewSchema({
      user: req.userId,
      product: req.body.product,
      rating: req.body.rating,
      comment: req.body.comment || ''
    });
    await newReview.save();
    
    let review = await reviewSchema.findById(newReview._id)
      .populate({
        path: 'user',
        select: 'username'
      })
      .populate({
        path: 'product',
        select: 'name price'
      });
    Response(res, 201, true, review);
  } catch (error) {
    if (error.code === 11000) {
      Response(res, 400, false, "You have already reviewed this product");
    } else {
      Response(res, 500, false, error.message);
    }
  }
});

// PUT - Cập nhật đánh giá (đánh giá của mình hoặc ADMIN)
router.put('/:id', Authentication, async function(req, res, next) {
  try {
    let review = await reviewSchema.findById(req.params.id);
    if (!review || review.isDeleted) {
      Response(res, 404, false, "Review not found");
      return;
    }

    // Check ownership
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    if (user.role.name !== "ADMIN" && review.user.toString() !== req.userId) {
      Response(res, 403, false, "You can only update your own reviews");
      return;
    }

    review.rating = req.body.rating !== undefined ? req.body.rating : review.rating;
    review.comment = req.body.comment !== undefined ? req.body.comment : review.comment;
    
    await review.save();
    
    let updatedReview = await reviewSchema.findById(review._id)
      .populate({
        path: 'user',
        select: 'username'
      })
      .populate({
        path: 'product',
        select: 'name price'
      });
    Response(res, 200, true, updatedReview);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// DELETE - Xóa mềm đánh giá (đánh giá của mình hoặc ADMIN)
router.delete('/:id', Authentication, async function(req, res, next) {
  try {
    let review = await reviewSchema.findById(req.params.id);
    if (!review || review.isDeleted) {
      Response(res, 404, false, "Review not found");
      return;
    }

    // Check ownership
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    if (user.role.name !== "ADMIN" && review.user.toString() !== req.userId) {
      Response(res, 403, false, "You can only delete your own reviews");
      return;
    }

    review.isDeleted = true;
    await review.save();
    Response(res, 200, true, "Review deleted successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;

