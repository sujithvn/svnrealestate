const express = require("express");

const pagesController = require("../controllers/page");

const router = express.Router();

router.get("/about", pagesController.about);

module.exports = router;
