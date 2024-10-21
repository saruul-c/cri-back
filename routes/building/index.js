const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/protect");

const {
  getBuildings,
  getBuilding,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  supplyWorker,
  addToFavorite,
  addResearchBuilding,
} = require("../../controller/building");

router.route("/").get(protect, getBuildings).post(protect, createBuilding);
router.route("/:id/research").post(protect, addResearchBuilding);
router
  .route("/:id")
  .get(protect, getBuilding)
  .put(protect, updateBuilding)
  .delete(protect, deleteBuilding);
router.route("/worker/:id").put(protect, supplyWorker);
router.route("/favorite/:id").put(protect, addToFavorite);

module.exports = router;
