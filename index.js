const express = require('express');
const path = require("path");
require('dotenv').config();


const homeRoutes = require('./routes/home');
const pageRoutes = require('./routes/page');
const authRoutes = require("./routes/auth");
const listRoutes = require("./routes/list");
const sequelize = require("./util/database");

const app = express();

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/auth", authRoutes);
app.use("/page", pageRoutes);
app.use("/list", listRoutes);
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

sequelize
  .sync() //{ force: true }
  .then(result => {
    app.listen(PORT, () => {
        console.log(`NODE Server is running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));
