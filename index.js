const express = require('express');
require('dotenv').config();

const app = express();

const homeRoutes = require('./routes/home');

app.set('views', 'views');
app.set('view engine', 'ejs');

// Routes
app.use('/home', homeRoutes);
app.use('/', homeRoutes);


const PORT = process.env.APP_PORT || 8000;

app.listen(PORT, () => {
    console.log(`NODE Server is running on port ${PORT}`);
});