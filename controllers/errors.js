const path = require("path");

exports.get404 = (req, res, next) => {
  res.status(404).render(path.join(__dirname, "..", "views", "404"));
};

exports.get500 = (req, res, next) => {
  res.status(500).render(path.join(__dirname, "..", "views", "500"));
};
  