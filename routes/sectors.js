const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getSectors,
  createSector,
  updateSector,
  deleteSector,
} = require("../controller/sectors");

router
  .route("/:id")
  .get(protect, getSectors)
  .post(protect, createSector)
  .put(protect, updateSector)
  .delete(protect, deleteSector);

module.exports = router;
