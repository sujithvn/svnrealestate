const path = require("path");

exports.getListingAll = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "listing_all"));
};