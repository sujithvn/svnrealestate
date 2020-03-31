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

const validateRulesListAddEdit = () => {
  return [
    body("title", "Title not valid")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Title cannot be empty")
      .isAlphanumeric()
      .withMessage("Title should be Alpha-numeric"),
    body("city")
      .trim()
      .not()
      .isEmpty()
      .withMessage("City cannot be empty")
      .isAlpha()
      .withMessage("City should have only characters"),
    body("state", "State not valid")
      .trim()
      .not()
      .isEmpty()
      .withMessage("State cannot be empty")
      .isAlpha()
      .withMessage("State should have only characters"),
    body("zipcode", "Zipcode not valid")
      .trim()
      .isAlphanumeric()
      .withMessage("Zipcode should be Alpha-numeric")
      .not()
      .isEmpty()
      .withMessage("Zipcode cannot be empty"),
    body("address")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Address cannot be empty"),
    body("description")
      // .not()
      // .isEmpty()
      // .withMessage("Description cannot be blank")
      .trim()
      .isAscii()
      .withMessage("Special characters not allowed"),
    body("price", "Price not valid")
      .not()
      .isEmpty()
      .withMessage("Price cannot be empty")
      .isNumeric()
      .withMessage("Price should be numeric")
      .isCurrency(),
    body("bedrooms")
      .not()
      .isEmpty()
      .withMessage("Bedrooms cannot be empty")
      .isInt({ min: 0, max: 10 })
      .withMessage("Bedrooms to be 0 - 10"),
    body("bathrooms")
      .not()
      .isEmpty()
      .withMessage("Bathrooms cannot be empty")
      .isInt({ min: 0, max: 10 })
      .withMessage("Bathrooms to be 0 - 10"),
    body("garage")
      .not()
      .isEmpty()
      .withMessage("Garage cannot be empty")
      .isInt({ min: 0, max: 5 })
      .withMessage("Garage to be 0 - 5"),
    body("sqft", "SqFt should be number")
      .not()
      .isEmpty()
      .isNumeric(),
    body("lotsize", "Lotsize should be decimal value")
      .not()
      .isEmpty()
      .isFloat()
    // body("list_date")  // using system date for list_date, hence no validation
  ];
};

const validateListAddEdit = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const userrMessages = errors.array();

  const listing = {
    id: req.body.id,
    title: req.body.title,
    city: req.body.city,
    state: req.body.state,
    zipcode: req.body.zipcode,
    address: req.body.address,
    description: req.body.description,
    price: req.body.price,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
    garage: req.body.garage,
    sqft: req.body.sqft,
    lot_size: req.body.lotsize,
    ispublished: req.body.ispublished,
    // list_date: req.body.list_date // using sys date in EJS, not passing value
  }
  return res
    .status(422)
    .render(path.join(__dirname, "..", "views", "listing_edit"), {
      userrMessages: userrMessages,
      listing: listing,
      alertType: 'danger'
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
  validatePassNew,
  validateRulesListAddEdit,
  validateListAddEdit
};