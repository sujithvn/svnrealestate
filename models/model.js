const { Sequelize } = require("sequelize");
const sequelize = require("../util/database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userPass: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userEmail: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userMobile: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userType: {
    type: Sequelize.INTEGER, // 1-Buyer, 2-Seller, 3-Admin
    allowNull: false
  }
});

const Listing = sequelize.define("listing", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: Sequelize.STRING,
  address: Sequelize.STRING,
  city: Sequelize.STRING,
  state: Sequelize.STRING,
  zipcode: Sequelize.STRING,
  description: Sequelize.TEXT,
  price: Sequelize.INTEGER,
  bedrooms: Sequelize.INTEGER,
  bathrooms: Sequelize.INTEGER,
  garage: Sequelize.INTEGER,
  sqft: Sequelize.INTEGER,
  lot_size: Sequelize.FLOAT,
  is_published: Sequelize.BOOLEAN,
  list_date: Sequelize.DATE,
  photo_main: Sequelize.STRING,
  photo_1: Sequelize.STRING,
  photo_2: Sequelize.STRING,
  photo_3: Sequelize.STRING,
  photo_4: Sequelize.STRING,
  photo_5: Sequelize.STRING,
  photo_6: Sequelize.STRING
});

User.hasMany(Listing);
Listing.belongsTo(User);

const Inquiry = sequelize.define("inquiry", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  message: Sequelize.STRING,
  contact_date: Sequelize.DATE
});

User.hasMany(Inquiry);
Listing.hasMany(Inquiry);

exports.User = User;
exports.Listing = Listing;
exports.Inquiry = Inquiry;
