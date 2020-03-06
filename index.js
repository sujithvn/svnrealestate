const express = require('express');
require('dotenv').config();

const app = express();
app.use('/', (req, res) => {
    res.send('<h1>Hello from Sujith</h1>')

})
const PORT = process.env.APP_PORT || 8000;

app.listen(PORT, () => {
    console.log(`NODE Server is running on port ${PORT}`);
});