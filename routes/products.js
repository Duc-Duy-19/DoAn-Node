var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/products');
let categorySchema = require('../schemas/categories');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

/**
 * ===========================================
 * GET ROUTES - Công khai (không cần xác thực)
 * ===========================================
 */

// GET - Lấy tất cả sản phẩm
router.get('/', async function(req, res, next) {
  try {
    let products = await productSchema.find({isDeleted: false}).populate({
      path: 'category',
      select: 'name'
    });
    Response(res, 200, true, products);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// GET - Lấy sản phẩm theo danh mục (QUAN TRỌNG: đặt trước /:id để tránh conflict)
router.get('/category/:categoryId', async function(req, res, next) {
  try {
    // Kiểm tra categoryId có hợp lệ không
    if (!req.params.categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      Response(res, 400, false, "Invalid category ID");
      return;
    }

    let products = await productSchema.find({
      category: req.params.categoryId,
      isDeleted: false
    }).populate({
      path: 'category',
      select: 'name'
    });
    Response(res, 200, true, products);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// GET - Lấy sản phẩm theo ID
router.get('/:id', async function(req, res, next) {
  try {
    // Kiểm tra ID có hợp lệ không
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      Response(res, 400, false, "Invalid product ID");
      return;
    }

    let product = await productSchema.findById(req.params.id).populate({
      path: 'category',
      select: 'name description'
    });
    
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found");
      return;
    }
    Response(res, 200, true, product);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

/**
 * ===========================================
 * POST/PUT/DELETE - Yêu cầu ADMIN/MOD
 * ===========================================
 */

// POST - Tạo sản phẩm mới (chỉ ADMIN/MOD)
router.post('/', Authentication, Authorization("ADMIN", "MOD"), async function(req, res, next) {
  try {
    // Validate required fields
    if (!req.body.name || !req.body.price || !req.body.category) {
      Response(res, 400, false, "Missing required fields: name, price, category");
      return;
    }

    // Validate price
    if (req.body.price <= 0) {
      Response(res, 400, false, "Price must be greater than 0");
      return;
    }

    // Kiểm tra danh mục có tồn tại và chưa bị xóa không
    let category = await categorySchema.findById(req.body.category);
    if (!category || category.isDeleted) {
      Response(res, 404, false, "Category not found or deleted");
      return;
    }

    let newProduct = new productSchema({
      name: req.body.name,
      description: req.body.description || '',
      price: req.body.price,
      stock: req.body.stock || 0,
      imageURLs: req.body.imageURLs || [],
      category: req.body.category
    });
    await newProduct.save();
    
    // Populate category để trả về đầy đủ thông tin
    let product = await productSchema.findById(newProduct._id).populate({
      path: 'category',
      select: 'name'
    });
    Response(res, 201, true, product);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// PUT - Cập nhật sản phẩm (chỉ ADMIN/MOD)
router.put('/:id', Authentication, Authorization("ADMIN", "MOD"), async function(req, res, next) {
  try {
    // Kiểm tra sản phẩm có tồn tại không
    let product = await productSchema.findById(req.params.id);
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found");
      return;
    }

    // Validate price nếu được cung cấp
    if (req.body.price !== undefined && req.body.price <= 0) {
      Response(res, 400, false, "Price must be greater than 0");
      return;
    }

    // Kiểm tra danh mục có tồn tại và chưa bị xóa nếu được cung cấp
    if (req.body.category) {
      let category = await categorySchema.findById(req.body.category);
      if (!category || category.isDeleted) {
        Response(res, 404, false, "Category not found or deleted");
        return;
      }
    }

    // Cập nhật các trường (giữ nguyên giá trị cũ nếu không được cung cấp)
    product.name = req.body.name !== undefined ? req.body.name : product.name;
    product.description = req.body.description !== undefined ? req.body.description : product.description;
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
    product.imageURLs = req.body.imageURLs !== undefined ? req.body.imageURLs : product.imageURLs;
    product.category = req.body.category !== undefined ? req.body.category : product.category;
    
    await product.save();
    
    // Populate category để trả về đầy đủ thông tin
    let updatedProduct = await productSchema.findById(product._id).populate({
      path: 'category',
      select: 'name'
    });
    Response(res, 200, true, updatedProduct);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// DELETE - Xóa mềm sản phẩm (chỉ ADMIN/MOD)
router.delete('/:id', Authentication, Authorization("ADMIN", "MOD"), async function(req, res, next) {
  try {
    let product = await productSchema.findById(req.params.id);
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found");
      return;
    }

    // Soft delete - chỉ đánh dấu isDeleted = true
    product.isDeleted = true;
    await product.save();
    Response(res, 200, true, "Product deleted successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;
