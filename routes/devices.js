const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
} = require("../controller/devices");

router
  .route("/:id")
  .get(protect, getDevices)
  .post(protect, createDevice)
  .put(protect, updateDevice)
  .delete(protect, deleteDevice);

module.exports = router;
