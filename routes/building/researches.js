const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/protect");

const {
  getResearches,
  createResearch,
  updateResearch,
  deleteResearch,
} = require("../../controller/building/researches");

router.route("/").get(protect, getResearches).post(protect, createResearch);
router
  .route("/:id")
  .put(protect, updateResearch)
  .delete(protect, deleteResearch);

module.exports = router;
