const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  fromCoss,
  getCompletion,
  getCompletionAct,
  createCompletion,
  updateCompletion,
  deleteCompletion,
} = require("../controller/completions");

router.route("").get(protect, fromCoss);
router.route("/act").get(protect, getCompletionAct);
router.route("/:id/:year/:repair/:month").post(protect, createCompletion);
router.route("/:id").get(protect, getCompletion).put(protect, updateCompletion);
router
  .route("/:repair/:id/:year/:month/:client/:agent")
  .delete(protect, deleteCompletion);

module.exports = router;
