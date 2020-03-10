const express = require('express');
const path = require("path");
require('dotenv').config();

const app = express();

const homeRoutes = require('./routes/home');
const pageRoutes = require('./routes/page');
const authRoutes = require("./routes/auth");
const listRoutes = require("./routes/list");

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

app.listen(PORT, () => {
    console.log(`NODE Server is running on port ${PORT}`);
});