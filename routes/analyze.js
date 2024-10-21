const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getRepairsAbstract,getBuildingsAbstract,
  getRepairsOrBuildingsByStatus,
  createExcelReportForAbstract,
  createExcelReportWithStatus
} = require("../controller/analyze");

router.route("/repair/abstract").get(protect, getRepairsAbstract)
router.route("/building/abstract").get(protect, getBuildingsAbstract)
router.route("/detailed/status").get(protect, getRepairsOrBuildingsByStatus)
router.route("/report/abstract").get(protect,createExcelReportForAbstract);
router.route("/report/status").get(protect,createExcelReportWithStatus);
module.exports = router;
