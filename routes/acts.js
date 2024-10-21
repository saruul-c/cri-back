const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getBuildingActs,
  createBuildingAct,
  updateBuildingAct,
  deleteBuildingAct,
} = require("../controller/building/acts");

const {
  getRepairActs,
  createRepairAct,
  updateRepairAct,
  deleteRepairAct,
} = require("../controller/repair/acts");

router
  .route("/repair/")
  .get(protect, getRepairActs)
  .post(protect, createRepairAct);
router
  .route("/repair/:id")
  .put(protect, updateRepairAct)
  .delete(protect, deleteRepairAct);

router
  .route("/building/")
  .get(protect, getBuildingActs)
  .post(protect, createBuildingAct);
router
  .route("/building/:id")
  .put(protect, updateBuildingAct)
  .delete(protect, deleteBuildingAct);

module.exports = router;
