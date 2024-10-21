const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const {
  getMainReportRepair,
  getMainReportBuilding,
  getTimeReportRepair,
  getTimeReportBuilding,
  getMainReportInvestmentData,
  getTimeReportExcelRepair,
  getTimeReportExcelBuilding,
  getMainReportExcelInvestment,
  getPhotoReportRepair,
  getPhotoReportBuilding,
  getMainReportExcelRepair,getMainReportExcelBuilding
} = require("../controller/reports");
//main
router.route("/1").get(protect, getMainReportRepair);
router.route("/2").get(protect, getMainReportBuilding);
router.route("/3").get(protect, getMainReportInvestmentData);
router.route("/excel/1").get(protect, getMainReportExcelRepair);
router.route("/excel/2").get(protect, getMainReportExcelBuilding);
router.route("/excel/3").get(protect, getMainReportExcelInvestment);
//time
router.route("/time/1").get(protect, getTimeReportRepair);
router.route("/time/2").get(protect, getTimeReportBuilding);
router.route("/time/excel/1").get(protect, getTimeReportExcelRepair);
router.route("/time/excel/2").get(protect, getTimeReportExcelBuilding);
// photo
router.route("/photo/1").get(protect, getPhotoReportRepair);
router.route("/photo/2").get(protect, getPhotoReportBuilding);
module.exports = router;
