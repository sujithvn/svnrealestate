const path = require("path");
require("dotenv").config();

const { Listing, User, Inquiry } = require('../models/model');
const { processMessage } = require('../util/misce');
const ITEM_PER_PAGE = 3;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

exports.postStripeBook = (req, res, next) => {
  const token = req.body.stripeToken;
  const id = req.query.id;
  let newChargeId = '';  
  const charge = stripe.charges.create({
    amount: 9999,
    currency: "inr",
    description: "Booking amount for listing",
    source: token,
    metadata: {order_desc: "Charge for booking token amt"}
  })
  .then(charge => {
    newChargeId = charge.id;
    return Inquiry.findOne({where: {listingId: id, userId: req.session.user.id}})
  })
  .then(result => {
      if (result){
        return result.update({blockID: newChargeId, blocked: true})
      }
      else {
        const inquiry = new Inquiry({
          blockID: newChargeId,
          blocked: true,
          userId: req.session.user.id,
          listingId: id
        });
        return inquiry.save();
      }
    })
  .then(dbResult => {
    return res.redirect(`/list/listing_detail?lid=${id}`);
    })
  .catch(err => next(new Error(err)));
};

exports.postInquire = (req, res, next) => {
  const id = req.query.id;
  const msg = req.body.message || "No message from user";

  Inquiry.findOne({where: {listingId: id, userId: req.session.user.id}})
  .then(result => {
    if (result){
      return result.update({ message: msg, contact_date: new Date().toISOString() })
    } else {
      const inquiry = new Inquiry({
        message: msg,
        contact_date: new Date().toISOString(),
        userId: req.session.user.id,
        listingId: id
      });
      return inquiry.save();
    }
  })
  .then(dbResult => {
    return res.redirect(`/list/listing_detail?lid=${id}`);
  })
  .catch(err => next(new Error(err)));
};

exports.getListingAll = (req, res, next) => {
  let curP = parseInt(req.query.page) || 1;
  const query = { where: {is_published: true} }
  const limit = ITEM_PER_PAGE;
  
  Listing.findAndCountAll(query)
  .then(result => {
    totCount = result.count;
    totPages = Math.ceil(totCount / ITEM_PER_PAGE);
    if (curP < 1) { curP = 1; }
    if (curP > totPages) { curP = totPages; }
    offset = (curP - 1) * ITEM_PER_PAGE;
    if (offset < 0) { offset = 0; }

    Listing.findAll({ offset, limit, ...query, include: User })
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
  const inqDtls = {};
  Inquiry.findOne({where: {listingId: currId, userId: req.session.user.id}})
  .then(result => {
    if(result) {
      inqDtls.inq = result.contact_date ? true : false;
      inqDtls.book = result.blocked;
    }
    else { 
      inqDtls.inq = false;
      inqDtls.book = false;
    }
  })
  .catch(err => next(new Error(err)));

  Listing.findAll({where: {id: currId}, include: User})
  .then(listing => {
    res.render(path.join(__dirname, "..", "views", "listing_detail"), {listing: listing[0], inqDtls});
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

exports.getBuyerManage = (req, res, next) => {
  Inquiry.findAll({ where: { userId: req.session.user.id }, include: Listing })
    .then(inquiries => {
      res.render(path.join(__dirname, "..", "views", "listing_buyer_manage"), { inquiries: inquiries });
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
    is_published: req.body.ispublished || false,
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