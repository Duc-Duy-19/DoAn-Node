const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Response } = require('../utils/responseHandler');
const { Authentication } = require('../utils/authHandler');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

/**
 * POST /upload/single
 * Upload a single image
 * Requires authentication
 */
router.post('/single', Authentication, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return Response(res, 400, false, 'Không có file nào được upload');
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `http://localhost:3000${fileUrl}`;

    Response(res, 200, true, {
      filename: req.file.filename,
      path: fileUrl,
      fullUrl: fullUrl,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    Response(res, 500, false, error.message || 'Lỗi khi upload file');
  }
});

/**
 * POST /upload/multiple
 * Upload multiple images (max 5)
 * Requires authentication
 */
router.post('/multiple', Authentication, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return Response(res, 400, false, 'Không có file nào được upload');
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      fullUrl: `http://localhost:3000/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    Response(res, 200, true, files);
  } catch (error) {
    Response(res, 500, false, error.message || 'Lỗi khi upload files');
  }
});

/**
 * DELETE /upload/:filename
 * Delete an uploaded file
 * Requires authentication
 */
router.delete('/:filename', Authentication, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return Response(res, 404, false, 'File không tồn tại');
    }

    // Delete the file
    fs.unlinkSync(filePath);

    Response(res, 200, true, 'Xóa file thành công');
  } catch (error) {
    Response(res, 500, false, error.message || 'Lỗi khi xóa file');
  }
});

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return Response(res, 400, false, 'File quá lớn. Kích thước tối đa 5MB');
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return Response(res, 400, false, 'Số lượng file vượt quá giới hạn (tối đa 5 files)');
    }
    return Response(res, 400, false, error.message);
  }
  
  if (error) {
    return Response(res, 400, false, error.message);
  }
  
  next();
});

module.exports = router;
