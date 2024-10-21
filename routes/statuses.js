const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
} = require("../controller/statuses");

router.route("/").get(protect, getStatuses).post(protect, createStatus);
router.route("/:id").put(protect, updateStatus).delete(protect, deleteStatus);

module.exports = router;
