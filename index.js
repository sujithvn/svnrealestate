const express = require('express');
require('dotenv').config();

const app = express();

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use('/', (req, res) => {
    res.render('index')

})
const PORT = process.env.APP_PORT || 8000;

app.listen(PORT, () => {
    console.log(`NODE Server is running on port ${PORT}`);
});