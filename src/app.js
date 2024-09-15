// import packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const corsMiddleware = require('./middleware/cors');

const productRoutes = require('./routes/shop');

// initialize packages
const app = express();

app.use(corsMiddleware); // CORS handling

app.use(bodyParser.json()); // application/json

// Routes
app.use('/shop', productRoutes);

module.exports = app;