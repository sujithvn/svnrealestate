const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();


const homeRoutes = require('./routes/home');
const pageRoutes = require('./routes/page');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/list');
const sequelize = require('./util/database');


// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const csrfProtection = new csrf();
const myStore = new SequelizeStore({ db: sequelize });
const SECRET = process.env.SES_SECRET;

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: SECRET, // used for signing the hash
    store: myStore,
    resave: false,
    saveUninitialized: false // not saved in every req, but only if something changes
  })
);
app.use(csrfProtection);

app.use((req, res, next) => { 
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/page', pageRoutes);
app.use('/list', listRoutes);
app.use('/home', homeRoutes);
app.use('/', homeRoutes);


const PORT = process.env.APP_PORT || 8000;

// sequelize
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

//sequelize
myStore
  .sync() //{ force: true }
  .then(result => {
    app.listen(PORT, () => {
      console.log(`NODE Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
