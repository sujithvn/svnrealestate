const { Listing } = require('../models/model');


exports.home = (req, res, next) => {
    Listing.findAll({where: {is_published: 1}})
    .then(listings => {
        res.render('index', {listings: listings});
    })
    .catch(err => console.log(err));
};