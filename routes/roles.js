const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} = require("../controller/roles");

router.route("/").get(protect, getRoles).post(protect, createRole);
router.route("/:id").put(protect, updateRole).delete(protect, deleteRole);

module.exports = router;
