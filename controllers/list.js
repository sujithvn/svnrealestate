const path = require("path");


const { Listing } = require('../models/model');

exports.getListingAll = (req, res, next) => {
  Listing.findAll({where: {is_published: 1}})
    .then(listings => {
      res.render(path.join(__dirname, "..", "views", "listing_all"), {
        listings: listings
      });
    })
    .catch(err => console.log(err));
};

exports.getListingDetail = (req, res, next) => {
  const currId = req.query.lid || 0;
  Listing.findAll({where: {id: currId}})
  .then(listing => {
    res.render(path.join(__dirname, "..", "views", "listing_detail"), {listing: listing[0]});
  })
  .catch(err => console.log(err));
};

exports.getSellerManage = (req, res, next) => {
  Listing.findAll({ where: { userId: req.session.user.id } })
    .then(listings => {
      res.render(path.join(__dirname, "..", "views", "listing_seller_manage"), { listings: listings });
    })
    .catch(err => console.log(err));
};

exports.getListingEdit = (req, res, next) => {
  const list_id = req.query.listId || 0;

  Listing.findAll({ where: { id: list_id, userId: req.session.user.id} })
    .then(listing => {
      res.render(path.join(__dirname, "..", "views", "listing_edit"), { listing: listing[0]});
    })
    .catch(err => console.log(err));
};


exports.postListingEdit = (req, res, next) => {
  const n_title = req.body.title;
  const n_city = req.body.city;
  const n_state = req.body.state;
  const n_zipcode = req.body.zipcode;
  const n_address = req.body.address;
  const n_description = req.body.description;
  const n_price = req.body.price;
  const n_bedrooms = req.body.bedrooms;
  const n_bathrooms = req.body.bathrooms;
  const n_garage = req.body.garage;
  const n_sqft = req.body.sqft;
  const n_lot_size = req.body.lotsize;
  const n_list_date = new Date().toISOString(); // list_date will be current date
  const n_is_published = req.body.ispublished || 0;

  if (!req.body.list_idd) {
    const listNew = new Listing({
      title: n_title,
      city: n_city,
      state: n_state,
      zipcode: n_zipcode,
      address: n_address,
      description: n_description,
      price: n_price,
      bedrooms: n_bedrooms,
      bathrooms: n_bathrooms,
      garage: n_garage,
      sqft: n_sqft,
      lot_size: n_lot_size,
      list_date: n_list_date,
      is_published: n_is_published,
      userId: req.session.user.id
    });
    return listNew.save()
      .then(result => {
        return res.redirect('/list/seller_manage')
      }).catch(err => console.log(err));
  } else {
    Listing.findByPk(req.body.list_idd)
      .then(listOld => {
        listOld.title = n_title;
        listOld.city = n_city;
        listOld.state = n_state;
        listOld.zipcode = n_zipcode;
        listOld.address = n_address;
        listOld.description = n_description;
        listOld.price = n_price;
        listOld.bedrooms = n_bedrooms;
        listOld.bathrooms = n_bathrooms;
        listOld.garage = n_garage;
        listOld.sqft = n_sqft;
        listOld.lot_size = n_lot_size;
        listOld.list_date = n_list_date;
        listOld.is_published = n_is_published;
        listOld.userId = req.session.user.id;

        return listOld.save();
      })
      .then(result => {
        return res.redirect('/list/seller_manage');
      })
      .catch(err => console.log(err));
  }         
};

// TODO postSearch
exports.postSearch = (req, res, next) => {
  res.render(path.join(__dirname, "..", "views", "search"));
};