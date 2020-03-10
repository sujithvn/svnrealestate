const path = require("path");

exports.login = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "login"));
};

exports.register = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "register"));
};
