const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
} = require("../controller/divisions");

router.route("/").get(getDivisions).post(protect, createDivision);
router
  .route("/:id")
  .put(protect, updateDivision)
  .delete(protect, deleteDivision);

module.exports = router;
