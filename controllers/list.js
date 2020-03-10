const path = require("path");


const { Listing } = require('../models/model');

exports.getListingAll = (req, res, next) => {
  Listing.findAll({where: {is_published: 1}})
  .then(listings => {
    res.render(path.join(__dirname, "..", "views", "listing_all"), {listings: listings});
  })
  .catch(err => console.log(err));
};

exports.getListingDetail = (req, res, next) => {
  const currId = req.query.lid || 0;
  Listing.findAll({where: {id: currId, is_published: 1}})
  .then(listing => {
    res.render(path.join(__dirname, "..", "views", "listing_detail"), {listing: listing[0]});
  })
  .catch(err => console.log(err));
};

// TODO postSearch
exports.postSearch = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "search"));
};