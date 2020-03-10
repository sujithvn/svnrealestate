const path = require("path");

exports.about = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "about"));
};
