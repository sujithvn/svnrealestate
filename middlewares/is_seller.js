module.exports = (req, res, next) => {
    if (req.session.userType === 2) {
        next();
    } else {
        req.session.destroy(err => {
            console.log('********* URL Manipulation attempt *********');
            console.log(err);
            return res.redirect("/auth/login");
        });
    }
};
  