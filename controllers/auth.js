const path = require("path");
const bcrypt = require('bcryptjs');

const { User } = require('../models/model');

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
          });
      })
    }
  })
  .catch(err => console.log(err));
  //res.render(path.join(__dirname, "..", "views", "register"));
};
