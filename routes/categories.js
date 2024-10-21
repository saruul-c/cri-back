const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categories");

router.route("/").post(protect, createCategory).put(protect, updateCategory);
router
  .route("/:id")
  .get(protect, getCategories)
  .delete(protect, deleteCategory);

module.exports = router;
