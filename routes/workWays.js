const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getWorkWays,
  createWorkWay,
  updateWorkWay,
  deleteWorkWay,
} = require("../controller/workWays");

router.route("/").get(protect, getWorkWays).post(protect, createWorkWay);
router.route("/:id").put(protect, updateWorkWay).delete(protect, deleteWorkWay);

module.exports = router;
