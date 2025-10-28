var express = require('express');
var router = express.Router();
let categorySchema = require('../schemas/categories');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

/**
 * ===========================================
 * GET ROUTES - Công khai (không cần xác thực)
 * ===========================================
 */

// GET - Lấy tất cả danh mục
router.get('/', async function(req, res, next) {
  try {
    let categories = await categorySchema.find({isDeleted: false}).populate({
      path: 'parentCategory',
      select: 'name'
    }).sort({ createdAt: -1 }); // Sắp xếp theo mới nhất
    Response(res, 200, true, categories);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// GET - Lấy danh mục theo ID
router.get('/:id', async function(req, res, next) {
  try {
    // Kiểm tra ID có hợp lệ không
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      Response(res, 400, false, "Invalid category ID");
      return;
    }

    let category = await categorySchema.findById(req.params.id).populate({
      path: 'parentCategory',
      select: 'name'
    });
    
    if (!category || category.isDeleted) {
      Response(res, 404, false, "Category not found");
      return;
    }
    Response(res, 200, true, category);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

/**
 * ===========================================
 * POST/PUT/DELETE - Yêu cầu ADMIN/MOD
 * ===========================================
 */

// POST - Tạo danh mục mới (chỉ ADMIN/MOD)
router.post('/', Authentication, Authorization("ADMIN", "MOD"), async function(req, res, next) {
  try {
    // Validate required fields
    if (!req.body.name) {
      Response(res, 400, false, "Missing required field: name");
      return;
    }

    // Kiểm tra danh mục cha có tồn tại và chưa bị xóa nếu được cung cấp
    if (req.body.parentCategory) {
      let parent = await categorySchema.findById(req.body.parentCategory);
      if (!parent || parent.isDeleted) {
        Response(res, 404, false, "Parent category not found or deleted");
        return;
      }
    }

    let newCategory = new categorySchema({
      name: req.body.name,
      description: req.body.description || '',
      imageURL: req.body.imageURL || '',
      parentCategory: req.body.parentCategory || null
    });
    await newCategory.save();
    Response(res, 201, true, newCategory);
  } catch (error) {
    // Xử lý lỗi duplicate key (tên danh mục trùng)
    if (error.code === 11000) {
      Response(res, 400, false, "Category name already exists");
    } else {
      Response(res, 500, false, error.message);
    }
  }
});

// PUT - Cập nhật danh mục (chỉ ADMIN/MOD)
router.put('/:id', Authentication, Authorization("ADMIN", "MOD"), async function(req, res, next) {
  try {
    // Kiểm tra danh mục có tồn tại không
    let category = await categorySchema.findById(req.params.id);
    if (!category || category.isDeleted) {
      Response(res, 404, false, "Category not found");
      return;
    }

    // Kiểm tra danh mục cha có tồn tại và chưa bị xóa nếu được cung cấp
    if (req.body.parentCategory) {
      let parent = await categorySchema.findById(req.body.parentCategory);
      if (!parent || parent.isDeleted) {
        Response(res, 404, false, "Parent category not found or deleted");
        return;
      }
      // Ngăn không cho đặt chính nó làm danh mục cha
      if (req.body.parentCategory === req.params.id) {
        Response(res, 400, false, "Category cannot be parent of itself");
        return;
      }
    }

    // Cập nhật các trường (giữ nguyên giá trị cũ nếu không được cung cấp)
    category.name = req.body.name !== undefined ? req.body.name : category.name;
    category.description = req.body.description !== undefined ? req.body.description : category.description;
    category.imageURL = req.body.imageURL !== undefined ? req.body.imageURL : category.imageURL;
    category.parentCategory = req.body.parentCategory !== undefined ? req.body.parentCategory : category.parentCategory;
    
    await category.save();
    Response(res, 200, true, category);
  } catch (error) {
    // Xử lý lỗi duplicate key (tên danh mục trùng)
    if (error.code === 11000) {
      Response(res, 400, false, "Category name already exists");
    } else {
      Response(res, 500, false, error.message);
    }
  }
});

// DELETE - Xóa mềm danh mục (chỉ ADMIN/MOD)
router.delete('/:id', Authentication, Authorization("ADMIN", "MOD"), async function(req, res, next) {
  try {
    let category = await categorySchema.findById(req.params.id);
    if (!category || category.isDeleted) {
      Response(res, 404, false, "Category not found");
      return;
    }

    // Soft delete - chỉ đánh dấu isDeleted = true
    category.isDeleted = true;
    await category.save();
    Response(res, 200, true, "Category deleted successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;
