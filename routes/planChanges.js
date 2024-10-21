const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");
const { getPlanChanges } = require("../controller/planChanges");

router.route("/").get(protect, getPlanChanges);
module.exports = router;
