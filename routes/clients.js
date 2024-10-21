const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/protect");

const { getClients } = require("../controller/clients");

router.route("/").get(protect, getClients);

module.exports = router;
