const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/protect");

const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} = require("../../controller/repair/activities");

router.route("/").get(protect, getActivities).post(protect, createActivity);
router
  .route("/:id")
  .put(protect, updateActivity)
  .delete(protect, deleteActivity);

module.exports = router;
