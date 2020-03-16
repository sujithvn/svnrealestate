const express = require("express");

const authController = require("../controllers/auth");
const is_auth = require('../middlewares/is_auth');

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", is_auth, authController.postLogout);
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);
router.get("/passwordreset", authController.getPasswordReset);
router.post("/passwordreset", authController.postPasswordReset);
router.post("/passwordnew", authController.postPasswordNew);
router.get("/passwordnew/:token", authController.getPasswordNew);

module.exports = router;
