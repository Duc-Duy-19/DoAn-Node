var express = require("express");
var router = express.Router();
let roleSchema = require("../schemas/roles");
let { Authentication, Authorization } = require("../utils/authHandler");

/* GET users listing. */
router.get("/", async function (req, res, next) {
  let roles = await roleSchema.find({ isDeleted: false });
  res.send({
    success: true,
    data: roles,
  });
});
router.get("/:id", async function (req, res, next) {
  try {
    let role = await roleSchema.findById(req.params.id);
    res.send({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      data: error,
    });
  }
});

router.post(
  "/",
  // Authentication,
  // Authorization("ADMIN"),
  async function (req, res, next) {
    try {
      let newRole = new roleSchema({ name: req.body.name });
      await newRole.save();
      res.send({ success: true, data: newRole });
    } catch (err) {
      res.status(500).send({ success: false, data: err.message || err });
    }
  }
);

module.exports = router;
