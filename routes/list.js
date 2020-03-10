const express = require("express");

const listController = require("../controllers/list");

const router = express.Router();

router.get("/listing_all", listController.getListingAll);

module.exports = router;
