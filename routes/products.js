var express = require('express');
var router = express.Router();
let productSchema = require('../schemas/products');
let categorySchema = require('../schemas/categories');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// Lấy tất cả sản phẩm (công khai - không cần xác thực)
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

// Lấy sản phẩm theo ID (công khai - không cần xác thực)
router.get('/:id', async function(req, res, next) {
  try {
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

// Lấy sản phẩm theo danh mục
router.get('/category/:categoryId', async function(req, res, next) {
  try {
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

// POST - Tạo sản phẩm mới (chỉ ADMIN/MOD)
router.post('/', Authentication, Authorization("ADMIN", "MOD"), async function(req, res, next) {
  try {
    // Kiểm tra danh mục có tồn tại không
    let category = await categorySchema.findById(req.body.category);
    if (!category || category.isDeleted) {
      Response(res, 404, false, "Category not found");
      return;
    }

    let newProduct = new productSchema({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock || 0,
      imageURLs: req.body.imageURLs || [],
      category: req.body.category
    });
    await newProduct.save();
    
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
    let product = await productSchema.findById(req.params.id);
    if (!product || product.isDeleted) {
      Response(res, 404, false, "Product not found");
      return;
    }

    // Kiểm tra danh mục có tồn tại không nếu được cung cấp
    if (req.body.category) {
      let category = await categorySchema.findById(req.body.category);
      if (!category || category.isDeleted) {
        Response(res, 404, false, "Category not found");
        return;
      }
    }

    product.name = req.body.name ? req.body.name : product.name;
    product.description = req.body.description !== undefined ? req.body.description : product.description;
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
    product.imageURLs = req.body.imageURLs !== undefined ? req.body.imageURLs : product.imageURLs;
    product.category = req.body.category ? req.body.category : product.category;
    
    await product.save();
    
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

    product.isDeleted = true;
    await product.save();
    Response(res, 200, true, "Product deleted successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;

