const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const { getCommons } = require("../controller/commons");

router.route("/").get(protect, getCommons);

module.exports = router;
