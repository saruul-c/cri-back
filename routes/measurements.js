const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getMeasurements,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} = require("../controller/measurements");

router
  .route("/")
  .get(protect, getMeasurements)
  .post(protect, createMeasurement);
router
  .route("/:id")
  .put(protect, updateMeasurement)
  .delete(protect, deleteMeasurement);

module.exports = router;
