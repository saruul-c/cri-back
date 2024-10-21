const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controller/departments");

router.route("/").get(getDepartments).post(protect, createDepartment);
router
  .route("/:id")
  .put(protect, updateDepartment)
  .delete(protect, deleteDepartment);

module.exports = router;
