const express = require("express");
const router = express.Router();
const { protect } = require("../../middlewares/protect");

const {
  getRepairs,
  getRepair,
  createRepair,
  updateRepair,
  deleteRepair,
  supplyWorker,
  addToFavorite,
} = require("../../controller/repair");

router.route("/").get(protect, getRepairs).post(protect, createRepair);
router
  .route("/:id")
  .get(protect, getRepair)
  .put(protect, updateRepair)
  .delete(protect, deleteRepair);
router.route("/worker/:id").put(protect, supplyWorker);
router.route("/favorite/:id").put(protect, addToFavorite);

module.exports = router;
