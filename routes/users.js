var express = require("express");
var router = express.Router();
let users = require("../schemas/users");
let roles = require("../schemas/roles");
let { Authentication, Authorization } = require("../utils/authHandler");

/* GET users listing. */
router.get(
  "/",
  Authentication,
  Authorization("ADMIN"),
  async function (req, res, next) {
    // list all users - admin only. exclude password
    let allUsers = await users
      .find({ isDeleted: false })
      .select("-password")
      .populate({
        path: "role",
        select: "name",
      });
    res.send({
      success: true,
      data: allUsers,
    });
  }
);
router.get(
  "/:id",
  Authentication,
  Authorization("ADMIN"),
  async function (req, res, next) {
    try {
      let getUser = await users
        .findById(req.params.id)
        .select("-password")
        .populate({
          path: "role",
          select: "name",
        });
      if (!getUser || getUser.isDeleted) {
        return res.status(404).send({ success: false, data: "User not found" });
      }
      res.send({ success: true, data: getUser });
    } catch (error) {
      res.status(500).send({ success: false, data: error.message || error });
    }
  }
);

// create user: only ADMIN can create via this route. Public registration should use /auth/register
router.post(
  "/",
  Authentication,
  Authorization("ADMIN"),
  async function (req, res, next) {
    try {
      let roleName = req.body.role ? req.body.role : "USER";
      let roleObj = await roles.findOne({ name: roleName });
      if (!roleObj)
        return res.status(400).send({ success: false, data: "Invalid role" });
      let newUser = new users({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: roleObj._id,
      });
      await newUser.save();
      let out = newUser.toObject();
      delete out.password;
      res.send({ success: true, data: out });
    } catch (err) {
      res.status(500).send({ success: false, data: err.message || err });
    }
  }
);
router.put(
  "/:id",
  Authentication,
  Authorization("ADMIN"),
  async function (req, res, next) {
    try {
      let user = await users.findById(req.params.id);
      if (!user || user.isDeleted)
        return res.status(404).send({ success: false, data: "User not found" });
      user.email = req.body.email ? req.body.email : user.email;
      user.fullName = req.body.fullName ? req.body.fullName : user.fullName;
      user.password = req.body.password ? req.body.password : user.password;
      await user.save();
      let out = await users
        .findById(req.params.id)
        .select("-password")
        .populate({ path: "role", select: "name" });
      res.send({ success: true, data: out });
    } catch (err) {
      res.status(500).send({ success: false, data: err.message || err });
    }
  }
);

module.exports = router;
