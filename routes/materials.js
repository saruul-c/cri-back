const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");
const { getMaterials } = require("../controller/materials");

router.route("/").get(protect, getMaterials);
module.exports = router;
