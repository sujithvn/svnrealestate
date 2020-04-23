const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const multer = require('multer');
const flash = require('connect-flash');
const path = require('path');
const moment = require('moment');
const helmet = require('helmet');
const compression = require('compression');
const rfs = require('rotating-file-stream');
const morgan = require('morgan');
require('dotenv').config();


const homeRoutes = require('./routes/home');
const pageRoutes = require('./routes/page');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/list');
const sequelize = require('./util/database');
const errorController = require("./controllers/errors");
const listController = require("./controllers/list");
const is_auth = require("./middlewares/is_auth");


// initalize sequelize with session store
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const app = express();
const csrfProtection = new csrf();
const myStore = new SequelizeStore({ db: sequelize });
const SECRET = process.env.SES_SECRET;
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/imgUploads');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/imgUploads', express.static(path.join(__dirname, 'imgUploads')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('photo_main'));
app.use(
  session({
    secret: SECRET, // used for signing the hash
    store: myStore,
    resave: false,
    saveUninitialized: false // not saved in every req, but only if something changes
  })
);
app.use(flash());
app.use(helmet());
app.use(compression());

// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'logs')
});
app.use(morgan('combined', { stream: accessLogStream }))

app.use((req, res, next) => { 
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.userType = req.session.userType;
  next();
});

var shortDayTimeFormat = "ddd @ h:mmA"; // standard day-time format across the app
var shortDateFormat = "MMM Do YYYY"; // standard date format across the app
app.locals.moment = moment; // makes moment available as a variable in every EJS page
app.locals.shortDayTimeFormat = shortDayTimeFormat;
app.locals.shortDateFormat = shortDateFormat;

// Routes
// Stripe submit is exempted using CSRF, hence moved CSRF below
app.post("/list/book", is_auth, listController.postStripeBook);
// app.post("/list/book", listController.postStripeBook);
app.use(csrfProtection);
app.use((req, res, next) => { 
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use('/auth', authRoutes);
app.use('/page', pageRoutes);
app.use('/list', listRoutes);
app.use('/home', homeRoutes);
app.use('/', homeRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log('******************** vvv Server Error 500 vvv ********************');
  console.log(error);  
  console.log('******************** ^^^ Server Error 500 ^^^ ********************');
  res.redirect('/500');
});

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
