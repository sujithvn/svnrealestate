const express = require("express");

const authController = require("../controllers/auth");
const is_auth = require('../middlewares/is_auth');
const vald = require("../middlewares/validator");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", vald.validateRulesLogin(), vald.validateLogin, authController.postLogin);
router.post("/logout", is_auth, authController.postLogout);
router.get("/register", authController.getRegister);
router.post("/register", vald.validateRulesRegister(), vald.validateRegister, authController.postRegister);
router.get("/passwordreset", authController.getPasswordReset);
router.post("/passwordreset", vald.validateRulesPassReset(), vald.validatePassReset, authController.postPasswordReset);
router.post("/passwordnew", vald.validateRulesPassNew(), vald.validatePassNew, authController.postPasswordNew);
router.get("/passwordnew/:token", authController.getPasswordNew);

module.exports = router;
