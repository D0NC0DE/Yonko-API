// import packages
const express = require('express');

const bodyParser = require('body-parser');

const corsMiddleware = require('./middleware/cors');
const { handleError } = require('./utils/errorHandler');

const userRoutes = require('./routes/user');
const shopRoutes = require('./routes/shop');

// initialize packages
const app = express();

app.use(corsMiddleware); // CORS handling

app.use(bodyParser.json()); // application/json

// Routes
app.use('/user', userRoutes);
app.use('/shop', shopRoutes);

app.use(handleError);

module.exports = app;