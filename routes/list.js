const express = require("express");

const listController = require("../controllers/list");
const is_auth = require("../middlewares/is_auth");
const vald = require("../middlewares/validator");

const router = express.Router();

router.get("/listing_all", listController.getListingAll);
router.get("/listing_detail", listController.getListingDetail);
router.get("/listing_edit", is_auth, listController.getListingEdit);
router.post("/listing_edit", is_auth, vald.validateRulesListAddEdit(), vald.validateListAddEdit, listController.postListingEdit);
router.post("/inquire", listController.postInquire);
router.get("/seller_manage", is_auth, listController.getSellerManage);
router.post("/search", listController.postSearch);

module.exports = router;
