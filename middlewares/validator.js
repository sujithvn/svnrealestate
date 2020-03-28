const path = require("path");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { User } = require("../models/model");

const validateRulesLogin = () => {
  return [
    body("useremail")
      .isEmail()
      .withMessage("Invalid or empty eMail")
      .normalizeEmail(),
    body("password")
      // .not()
      // .isEmpty()
      // .withMessage("Please provide your password")
      .custom((value, { req }) => {
        return User.findOne({ where: { userEmail: req.body.useremail } })
          .then(userDB => {
            if (!userDB) {
              return Promise.reject("Invalid eMail or password");
            } else {
              return bcrypt
                .compare(value, userDB.userPass)
                .then(isMatch => {
                  if (!isMatch) {
                    return Promise.reject("Invalid eMail or password");
                  }
                })
            }
          })
      })
  ];
};

const validateLogin = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const userrMessages = errors.array();

  return res
    .status(422)
    .render(path.join(__dirname, "..", "views", "login"), {
      userrMessages: userrMessages,
      oldIn: { useremail: req.body.useremail },
      alertType: 'danger'
    });
};

const validateRulesRegister = () => {
  return [
    body("firstname")
      .trim()
      .not()
      .isEmpty()
      .withMessage("First Name is required"),
    body("lastname")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Last Name is required"),
    body("email")
      .isEmail()
      .withMessage("Invalid eMail")
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ where: { userEmail: value } })
          .then(userDB => {
            if (userDB) {
              return Promise.reject("e-Mail id already used");
            }
          });
      }),
    body("password", "Password should be 6+ chars")
      .trim()
      .isLength({ min: 6 }),
    body("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match");
      }
      return true;
    }),
    body("mobile")
      .not()
      .isEmpty()
      .withMessage("Mobile number is required")
      .isMobilePhone('any')
      .withMessage("Invalid Mobile number"),
    body("userType").custom((value, { req }) => {
      if (value !== "1" && value !== "2") {
        throw new Error("Select a user type");
      }
      return true;
    }),
  ];
};

const validateRegister = (req, res, next) => {

  const errors = validationResult(req);
 
  if (errors.isEmpty()) {
        return next();
    }
  
  const userrMessages = errors.array();
    
  return res
    .status(422)
    .render(path.join(__dirname, "..", "views", "register"), {
      userrMessages: userrMessages,
      oldIn: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        mobile: req.body.mobile,
        userType: req.body.userType
      },
      alertType: 'danger'
    });
};

const validateRulesPassReset = () => {
  return [
    body("useremail")
      .trim()
      .isEmail()
      .withMessage("Invalid or empty eMail")
      .normalizeEmail()
  ];
};

const validatePassReset = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const userrMessages = errors.array();

  return res
    .status(422)
    .render(path.join(__dirname, "..", "views", "password_reset"), {
      userrMessages: userrMessages,
      oldIn: { useremail: req.body.useremail },
      alertType: 'danger'
    });
};

const validateRulesPassNew = () => {
  return [
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password should be 6+ chars")
      .trim()
  ];
};

const validatePassNew = (req, res, next) => {
  const errors = validationResult(req);
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  if (errors.isEmpty()) {
    return next();
  }

  const userrMessages = errors.array();

  return res
    .status(422)
    .render(path.join(__dirname, "..", "views", "password_new"), {
      userrMessages: userrMessages,
      oldIn: {},
      alertType: 'danger',
      userId: userId,
      passwordToken: passwordToken
    });
};
module.exports = {
  validateRulesRegister,
  validateRegister,
  validateRulesLogin,
  validateLogin,
  validateRulesPassReset,
  validatePassReset,
  validateRulesPassNew,
  validatePassNew
};