const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getBenefit,
  getBenefits,
  createBenefit,
  updateBenefit,
  insertArchive,
  removeArchive,
} = require("../controller/benefits");

router.route("/").get(protect, getBenefits).post(protect, createBenefit);
router.route("/:id").put(protect, updateBenefit);
router
  .route("/:type/:id")
  .get(protect, getBenefit)
  .put(protect, insertArchive)
  .delete(protect, removeArchive);

module.exports = router;
