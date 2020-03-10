const express = require("express");

const listController = require("../controllers/list");

const router = express.Router();

router.get("/listing_all", listController.getListingAll);
router.get("/listing_detail", listController.getListingDetail);
router.post("/search", listController.postSearch);

module.exports = router;
