const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const { createPlan, updatePlan, deletePlan, updatePlanChange } = require("../controller/plans");

router
  .route("/:id")
  .post(protect, createPlan)
  .put(protect, updatePlan)
  .delete(protect, deletePlan);

router
  .route("/change/:id")
  .post(protect, updatePlanChange)

module.exports = router;
