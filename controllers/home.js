const { Listing } = require('../models/model');


exports.home = (req, res, next) => {
    Listing.findAll({limit: 3, where: {is_published: 1}, order: [['list_date', 'DESC']]})
    .then(listings => {
        res.render('index', {listings: listings});
    })
    .catch(err => next(new Error(err)));
};