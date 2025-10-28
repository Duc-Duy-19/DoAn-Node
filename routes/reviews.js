var express = require('express');
var router = express.Router();
let reviewSchema = require('../schemas/reviews');
let productSchema = require('../schemas/products');
let userSchema = require('../schemas/users');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

/**
 * ===========================================
 * HELPER FUNCTIONS
 * ===========================================
 */

// Helper: Kiểm tra quyền sở hữu hoặc ADMIN
async function isOwnerOrAdmin(userId, reviewOwnerId) {
  try {
    let user = await userSchema.findById(userId).populate('role');
    // Kiểm tra nếu là ADMIN hoặc là chủ sở hữu review
    return (user.role.name === "ADMIN" || reviewOwnerId.toString() === userId.toString());
  } catch (error) {
    return false;
  }
}

// Helper: Validate rating (1-5)
function validateRating(rating) {
  return rating >= 1 && rating <= 5;
}

/**
 * ===========================================
 * GET ROUTES - Công khai (không cần xác thực)
 * ===========================================
 */

// GET - Lấy tất cả đánh giá
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
      })
      .sort({ createdAt: -1 }); // Sắp xếp theo mới nhất
    Response(res, 200, true, reviews);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// GET - Lấy đánh giá theo sản phẩm (QUAN TRỌNG: đặt trước /:id)
router.get('/product/:productId', async function(req, res, next) {
  try {
    // Kiểm tra productId có hợp lệ không
    if (!req.params.productId.match(/^[0-9a-fA-F]{24}$/)) {
      Response(res, 400, false, "Invalid product ID");
      return;
    }

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
      })
      .sort({ createdAt: -1 });
    Response(res, 200, true, reviews);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// GET - Lấy đánh giá theo ID
router.get('/:id', async function(req, res, next) {
  try {
    // Kiểm tra ID có hợp lệ không
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      Response(res, 400, false, "Invalid review ID");
      return;
    }

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

/**
 * ===========================================
 * POST/PUT/DELETE - Yêu cầu xác thực
 * ===========================================
 */

// POST - Tạo đánh giá mới (user đã đăng nhập)
router.post('/', Authentication, async function(req, res, next) {
  try {
    // Validate required fields
    if (!req.body.product || !req.body.rating) {
      Response(res, 400, false, "Missing required fields: product, rating");
      return;
    }

    // Validate rating (1-5)
    if (!validateRating(req.body.rating)) {
      Response(res, 400, false, "Rating must be between 1 and 5");
      return;
    }

    // Kiểm tra sản phẩm có tồn tại và chưa bị xóa không
    let product = await productSchema.findById(req.body.product);
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found or deleted");
      return;
    }

    // Kiểm tra user đã đánh giá sản phẩm này chưa (1 user chỉ đánh giá 1 lần)
    let existingReview = await reviewSchema.findOne({
      user: req.userId,
      product: req.body.product,
      isDeleted: false
    });
    
    if (existingReview) {
      Response(res, 400, false, "You have already reviewed this product");
      return;
    }

    // Tạo đánh giá mới
    let newReview = new reviewSchema({
      user: req.userId,
      product: req.body.product,
      rating: req.body.rating,
      comment: req.body.comment || ''
    });
    await newReview.save();
    
    // Populate để trả về đầy đủ thông tin
    let review = await reviewSchema.findById(newReview._id)
      .populate({
        path: 'user',
        select: 'username'
      })
      .populate({
        path: 'product',
        select: 'name price'
      });

    // Emit socket event for admin
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('new_review', {
        reviewId: review._id,
        productName: review.product.name,
        username: review.user.username,
        rating: review.rating
      });
    }

    Response(res, 201, true, review);
  } catch (error) {
    // Xử lý lỗi duplicate key (unique index)
    if (error.code === 11000) {
      Response(res, 400, false, "You have already reviewed this product");
    } else {
      Response(res, 500, false, error.message);
    }
  }
});

// PUT - Cập nhật đánh giá (chủ sở hữu hoặc ADMIN)
router.put('/:id', Authentication, async function(req, res, next) {
  try {
    // Kiểm tra đánh giá có tồn tại không
    let review = await reviewSchema.findById(req.params.id);
    if (!review || review.isDeleted) {
      Response(res, 404, false, "Review not found");
      return;
    }

    // Validate rating nếu được cung cấp
    if (req.body.rating !== undefined && !validateRating(req.body.rating)) {
      Response(res, 400, false, "Rating must be between 1 and 5");
      return;
    }

    // Kiểm tra quyền: chỉ chủ sở hữu hoặc ADMIN mới được cập nhật
    let hasPermission = await isOwnerOrAdmin(req.userId, review.user);
    if (!hasPermission) {
      Response(res, 403, false, "You can only update your own reviews");
      return;
    }

    // Cập nhật các trường (giữ nguyên giá trị cũ nếu không được cung cấp)
    review.rating = req.body.rating !== undefined ? req.body.rating : review.rating;
    review.comment = req.body.comment !== undefined ? req.body.comment : review.comment;
    
    await review.save();
    
    // Populate để trả về đầy đủ thông tin
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

// DELETE - Xóa mềm đánh giá (chủ sở hữu hoặc ADMIN)
router.delete('/:id', Authentication, async function(req, res, next) {
  try {
    // Kiểm tra đánh giá có tồn tại không
    let review = await reviewSchema.findById(req.params.id);
    if (!review || review.isDeleted) {
      Response(res, 404, false, "Review not found");
      return;
    }

    // Kiểm tra quyền: chỉ chủ sở hữu hoặc ADMIN mới được xóa
    let hasPermission = await isOwnerOrAdmin(req.userId, review.user);
    if (!hasPermission) {
      Response(res, 403, false, "You can only delete your own reviews");
      return;
    }

    // Soft delete - chỉ đánh dấu isDeleted = true
    review.isDeleted = true;
    await review.save();
    Response(res, 200, true, "Review deleted successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;
