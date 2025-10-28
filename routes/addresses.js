var express = require('express');
var router = express.Router();
let addressSchema = require('../schemas/addresses');
let { Response } = require('../utils/responseHandler');
let { Authentication, Authorization } = require('../utils/authHandler');

// Lấy tất cả địa chỉ của user hiện tại hoặc tất cả (ADMIN)
router.get('/', Authentication, async function(req, res, next) {
  try {
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    let query = {isDeleted: false};
    
    // Nếu không phải ADMIN, chỉ hiện địa chỉ của chính mình
    if (user.role.name !== "ADMIN") {
      query.user = req.userId;
    }
    
    let addresses = await addressSchema.find(query).populate({
      path: 'user',
      select: 'username email'
    });
    Response(res, 200, true, addresses);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// Lấy địa chỉ theo ID (địa chỉ của mình hoặc ADMIN)
router.get('/:id', Authentication, async function(req, res, next) {
  try {
    let address = await addressSchema.findById(req.params.id).populate({
      path: 'user',
      select: 'username email'
    });
    
    if (!address || address.isDeleted) {
      Response(res, 404, false, "Address not found");
      return;
    }

    // Check ownership
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    if (user.role.name !== "ADMIN" && address.user._id.toString() !== req.userId) {
      Response(res, 403, false, "You can only view your own addresses");
      return;
    }

    Response(res, 200, true, address);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// POST - Tạo địa chỉ mới (user đã xác thực)
router.post('/', Authentication, async function(req, res, next) {
  try {
    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác của user này
    if (req.body.isDefault) {
      await addressSchema.updateMany(
        { user: req.userId, isDeleted: false },
        { isDefault: false }
      );
    }

    let newAddress = new addressSchema({
      user: req.userId,
      fullName: req.body.fullName,
      phone: req.body.phone,
      province: req.body.province,
      district: req.body.district,
      ward: req.body.ward,
      detailAddress: req.body.detailAddress,
      isDefault: req.body.isDefault || false
    });
    await newAddress.save();
    
    let address = await addressSchema.findById(newAddress._id).populate({
      path: 'user',
      select: 'username email'
    });
    Response(res, 201, true, address);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// PUT - Cập nhật địa chỉ (địa chỉ của mình hoặc ADMIN)
router.put('/:id', Authentication, async function(req, res, next) {
  try {
    let address = await addressSchema.findById(req.params.id);
    if (!address || address.isDeleted) {
      Response(res, 404, false, "Address not found");
      return;
    }

    // Check ownership
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    if (user.role.name !== "ADMIN" && address.user.toString() !== req.userId) {
      Response(res, 403, false, "You can only update your own addresses");
      return;
    }

    // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác của user này
    if (req.body.isDefault === true) {
      await addressSchema.updateMany(
        { user: address.user, isDeleted: false, _id: { $ne: address._id } },
        { isDefault: false }
      );
    }

    address.fullName = req.body.fullName ? req.body.fullName : address.fullName;
    address.phone = req.body.phone ? req.body.phone : address.phone;
    address.province = req.body.province ? req.body.province : address.province;
    address.district = req.body.district ? req.body.district : address.district;
    address.ward = req.body.ward ? req.body.ward : address.ward;
    address.detailAddress = req.body.detailAddress ? req.body.detailAddress : address.detailAddress;
    address.isDefault = req.body.isDefault !== undefined ? req.body.isDefault : address.isDefault;
    
    await address.save();
    
    let updatedAddress = await addressSchema.findById(address._id).populate({
      path: 'user',
      select: 'username email'
    });
    Response(res, 200, true, updatedAddress);
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

// DELETE - Xóa mềm địa chỉ (địa chỉ của mình hoặc ADMIN)
router.delete('/:id', Authentication, async function(req, res, next) {
  try {
    let address = await addressSchema.findById(req.params.id);
    if (!address || address.isDeleted) {
      Response(res, 404, false, "Address not found");
      return;
    }

    // Check ownership
    let user = await require('../schemas/users').findById(req.userId).populate('role');
    if (user.role.name !== "ADMIN" && address.user.toString() !== req.userId) {
      Response(res, 403, false, "You can only delete your own addresses");
      return;
    }

    address.isDeleted = true;
    await address.save();
    Response(res, 200, true, "Address deleted successfully");
  } catch (error) {
    Response(res, 500, false, error.message);
  }
});

module.exports = router;

