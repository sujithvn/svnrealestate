const path = require("path");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require("sequelize");

const { User } = require('../models/model');
const transporter = require('../util/mailSetup');

const processMessage = inMessage => {
  let outMessage = {};
  if (inMessage.length > 0) {
    outMessage.type = inMessage[0];
    outMessage.msg = inMessage[1];
  } else {
    outMessage = null;
  }
  return outMessage;
};

exports.getLogin = (req, res, next) => {
  const msg = processMessage(req.flash("msg"));
  res.render(path.join(__dirname, "..", "views", "login"), {errMessage: msg});
};

exports.postLogin = (req, res, next) => {
  const userEmail = req.body.useremail;
  const password = req.body.password;

  User.findOne({ where: { userEmail: userEmail } })
    .then(userDB => {
      if (!userDB) {
        req.flash('msg', ['danger','UserEmail or Password incorrect']);
        return req.session.save(err => {
          console.log(err);
          res.redirect("/auth/login");
        });
      }
      bcrypt
        .compare(password, userDB.userPass)
        .then(isMatch => {
          if (isMatch) {
            // update vars to denote user-is-authenticated
            req.session.isLoggedIn = true;
            req.session.user = userDB;
            return req.session.save(err => {
              console.log(err);
              res.redirect("/");
            });
          } else {
            req.flash("msg", ["danger", "UserEmail or Password incorrect"]);
            return req.session.save(err => {
              console.log(err);
              res.redirect("/auth/login");
            });
          }
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/auth/login');
  });
};

exports.getRegister = (req, res, next) => {
  const msg = processMessage(req.flash("msg"));
  res.render(path.join(__dirname, "..", "views", "register"), {
    errMessage: msg
  });
};

exports.postRegister = (req, res, next) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const userEmail = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;
  const userMobile = req.body.mobile;
  const userType = req.body.userType;
  
  // User.findOne({ where: { userEmail: userEmail } })
  User.findOne({where: { userEmail: userEmail }})
  .then(userDB => {
    if (userDB){
      req.flash("msg", ["danger", "Email provided is already in use"]);
      return req.session.save(err => {
        console.log(err);
        res.redirect("/auth/register");
      });
    } else {
      // No user exist with that name, processing registration...
      return bcrypt.hash(password,12)
      .then(hashedPass => {
        const user = new User({
          firstName: firstName,
          lastName: lastName,
          userEmail: userEmail,
          userPass: hashedPass,
          userMobile: userMobile,
          userType: userType
        });
        return user.save();
      })
        .then(result => {
          req.flash("msg", ["success", "User registered, please login with email & password"]);
          return req.session.save(err => {
            console.log(err);
            res.redirect("/auth/login");
            return transporter.sendMail({
              to: userEmail,
              from: 'contact@svnrealestate.com',
              subject: 'Registration at sVn RealEstate successful',
              html: '<h1> Welcome to portal, you have registered successfully. </h1>'
            });
          });
      })
    }
  })
  .catch(err => console.log(err));
  //res.render(path.join(__dirname, "..", "views", "register"));
};


exports.getPasswordReset = (req, res, next) => {
  const msg = processMessage(req.flash("msg"));
  res.render(path.join(__dirname, "..", "views", "password_reset"), { errMessage: msg });
};

exports.postPasswordReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/auth/passwordreset");
    }

    const token = buffer.toString("hex");
    User.findOne({ where: { userEmail: req.body.useremail } })
      .then(userDB => {
        if (!userDB) {
          req.flash("msg", ["danger", "eMail not registered, try another or register as new!"]);
          return req.session.save(err => {
            console.log(err);
            return res.redirect("/auth/passwordreset");
          });
        }
        userDB.resetToken = token;
        userDB.resetExpiry = Date.now() + 1000 * 60 * 1; // 15 mins
        return userDB.save()
          .then(result => {
            req.flash("msg", ["success", "Please check you email for reset link!"]);
            req.session.save(err => {
              console.log(err);
              res.redirect("/auth/login");
            });
            return transporter.sendMail({
              to: req.body.useremail,
              from: "contact@svnrealestate.com",
              subject: "Password Reset for sVn RealEstate acccount",
              html: `
              <p>You requested for a password reset. If NOT, please ignore this email.</p>
              <p><a href="http://localhost:8000/auth/passwordnew/${token}">Click</a> to RESET password</p> `
            });
          });
      })
      .catch(err => { console.log(err); });
  });
};


exports.getPasswordNew = (req, res, next) => {
  const token = req.params.token;
  const msg = processMessage(req.flash("msg"));

  User.findOne({
    where: {
      resetToken: token,
      resetExpiry: { [Op.gte]: Date.now() }
    }
  })
    .then(userDB => {
      if (!userDB) {
        req.flash("msg", [
          "danger",
          "Invalid / Expired token, please reset again."
        ]);
        return req.session.save(err => {
          console.log(err);
          return res.redirect("/auth/passwordreset");
        });
      }
      res.render(path.join(__dirname, "..", "views", "password_new"), {
        errMessage: msg,
        userId: userDB.id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
    });
};


exports.postPasswordNew = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    where: {
      resetToken: passwordToken,
      resetExpiry: { [Op.gte]: Date.now() },
      id: userId
    }
  })
    .then(userDB => {
      if (!userDB) {
        req.flash("msg", [
          "danger",
          "Invalid / Expired token, please reset again."
        ]);
        return req.session.save(err => {
          console.log(err);
          return res.redirect("/auth/passwordreset");
        });
      }

      resetUser = userDB;
      return bcrypt
        .hash(newPassword, 12)
        .then(hashedPass => {
          resetUser.userPass = hashedPass;
          resetUser.resetToken = null;
          resetUser.resetExpiry = null;
          return resetUser.save();
        })
        .then(result => {
          req.flash("msg", [
            "success",
            "Password RESET successsful, use your new password to login."
          ]);
          return req.session.save(err => {
            console.log(err);
            res.redirect("/auth/login");
          });
        });
    })
    .catch(err => console.log(err));
};
