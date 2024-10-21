const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const { createProgress, deleteProgress } = require("../controller/progresses");

router
  .route("/:id")
  .post(protect, createProgress)
  .delete(protect, deleteProgress);

module.exports = router;
