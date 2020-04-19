const path = require("path");


const { Listing, User } = require('../models/model');
const { processMessage } = require('../util/misce');
const ITEM_PER_PAGE = 3;

exports.getListingAll = (req, res, next) => {
  let curP = parseInt(req.query.page) || 1;
  const query = { where: {is_published: 1} }
  const limit = ITEM_PER_PAGE;
  
  Listing.findAndCountAll({ query })
  .then(result => {
    totCount = result.count;
    totPages = Math.ceil(totCount / ITEM_PER_PAGE);
    if (curP < 1) { curP = 1; }
    if (curP > totPages) { curP = totPages; }
    offset = (curP - 1) * ITEM_PER_PAGE;

    Listing.findAll({ offset, limit, query, include: User })
    .then(listings => {
      res.render(path.join(__dirname, "..", "views", "listing_all"), {
        listings, curP, totPages
      });
    })
  })
  .catch(err => next(new Error(err)));
};

exports.getListingDetail = (req, res, next) => {
  const currId = req.query.lid || 0;
  Listing.findAll({where: {id: currId}, include: User})
  .then(listing => {
    res.render(path.join(__dirname, "..", "views", "listing_detail"), {listing: listing[0]});
  })
  .catch(err => next(new Error(err)));
};

exports.getSellerManage = (req, res, next) => {
  Listing.findAll({ where: { userId: req.session.user.id } })
    .then(listings => {
      res.render(path.join(__dirname, "..", "views", "listing_seller_manage"), { listings: listings });
    })
    .catch(err => next(new Error(err)));
};

exports.getListingEdit = (req, res, next) => {
  const inMsg = req.flash("msg");
  const [msgs, alertType] = processMessage(inMsg);
  const id = req.query.id || 0;

  Listing.findAll({ where: { id: id, userId: req.session.user.id} })
    .then(listing => {
      res.render(path.join(__dirname, "..", "views", "listing_edit"), { 
        listing: listing[0],
        userrMessages: msgs || [],
        alertType: alertType
      });
    })
    .catch(err => next(new Error(err)));
};


exports.postListingEdit = (req, res, next) => {
  const listing = {
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
    photo_main: '',
    is_published: req.body.ispublished || 0,
    list_date: new Date().toISOString(), // using sys date in EJS, not passing value
    userId: req.session.user.id
  }

  if (!req.body.id) {
    if (!req.file) {
      inMsg = ["danger", "Please select Main image file of type PNG/JPG/JPEG"];
      const [msgs, alertType] = processMessage(inMsg);
      // msgs.param = "imagemain";
      listing.id = req.body.id;

      return res
        .status(422)
        .render(path.join(__dirname, "..", "views", "listing_edit"), {
          userrMessages: msgs,
          listing: listing,
          alertType: alertType
        });
    } else {
      listing.photo_main = req.file.filename;
    }

    const listNew = new Listing(listing);
    return listNew.save()
      .then(result => {
        return res.redirect('/list/seller_manage')
      }).catch(err => next(new Error(err)));
  } else {
    // Listing.findByPk(req.body.id)
    Listing.findOne({ where: { id: req.body.id, userId: req.session.user.id} })
      .then(listOld => {
        listOld.title = listing.title;
        listOld.city = listing.city;
        listOld.state = listing.state;
        listOld.zipcode = listing.zipcode;
        listOld.address = listing.address;
        listOld.description = listing.description;
        listOld.price = listing.price;
        listOld.bedrooms = listing.bedrooms;
        listOld.bathrooms = listing.bathrooms;
        listOld.garage = listing.garage;
        listOld.sqft = listing.sqft;
        listOld.lot_size = listing.lot_size;
        if (req.file) { listOld.photo_main = req.file.filename }
        listOld.list_date = listing.list_date;
        listOld.is_published = listing.is_published;
        // listOld.userId = req.session.user.id;  // this should remain the original

        return listOld.save();
      })
      .then(result => {
        return res.redirect('/list/seller_manage');
      })
      .catch(err => next(new Error(err)));
  }         
};

// TODO postSearch
exports.postSearch = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "search"));
};