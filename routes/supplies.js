const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getAllSupplies,
  getSupplies,
  getSupply,
  createSupply,
  updateSupply,
  deleteSupply,
} = require("../controller/supplies");

router.route("/:year/:user").get(protect, getAllSupplies);
router.route("/").get(protect, getSupplies).post(protect, createSupply);
router
  .route("/:id")
  .get(protect, getSupply)
  .put(protect, updateSupply)
  .delete(protect, deleteSupply);

module.exports = router;
