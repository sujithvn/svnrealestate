const path = require("path");

exports.getListingAll = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "listing_all"));
};

exports.getListingDetail = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "listing_detail"));
};

exports.postSearch = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "search"));
};