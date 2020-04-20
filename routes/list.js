const express = require("express");

const listController = require("../controllers/list");
const is_auth = require("../middlewares/is_auth");
const is_buyer = require("../middlewares/is_buyer");
const is_seller = require("../middlewares/is_seller");
const vald = require("../middlewares/validator");

const router = express.Router();

router.get("/listing_all", listController.getListingAll);
router.get("/listing_detail", is_auth, listController.getListingDetail);
router.get("/listing_edit", is_auth, listController.getListingEdit);
router.post("/listing_edit", is_auth, vald.validateRulesListAddEdit(), vald.validateListAddEdit, listController.postListingEdit);
router.post("/inquire", listController.postInquire);
router.get("/seller_manage", is_auth, is_seller, listController.getSellerManage);
router.get("/buyer_manage", is_auth, is_buyer, listController.getBuyerManage);
router.post("/search", listController.postSearch);

module.exports = router;
