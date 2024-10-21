const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");
const { getAssets } = require("../controller/assets");

router.route("/").get(protect, getAssets);
module.exports = router;
