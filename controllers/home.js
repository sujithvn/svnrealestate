const { Listing, User } = require('../models/model');


exports.home = (req, res, next) => {
    Listing.findAll({limit: 3, where: {is_published: true}, order: [['list_date', 'DESC']], include: User})
    .then(listings => {
        res.render('index', {listings: listings});
    })
    .catch(err => next(new Error(err)));
};