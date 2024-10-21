const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  supplyWorker,
  addToFavorite,
  getInvestment,
  getInvestments,
  getInvestmentFavs,
  applyInvestment,
  getSumInvestment,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  updateInvestmentPlan,
  insertInvestmentPlan,
  deleteInvestmentPlan,
} = require("../controller/investments");

router.route("/:year/:division").get(protect, getInvestments);
router
  .route("/")
  .get(protect, getSumInvestment)
  .post(protect, createInvestment);
router
  .route("/:id")
  .get(protect, getInvestment)
  .put(protect, updateInvestment)
  .delete(protect, deleteInvestment);
router.route("/worker/:id").put(protect, supplyWorker);
router.route("/apply/:id").put(protect, applyInvestment);
router.route("/favorite/:id").put(protect, addToFavorite);
router
  .route("/plan/:id")
  .post(protect, insertInvestmentPlan)
  .put(protect, updateInvestmentPlan);
router.route("/plan/delete/:id").put(protect, deleteInvestmentPlan);
router.route("/favorite/monitor/:year").get(protect, getInvestmentFavs);
module.exports = router;
