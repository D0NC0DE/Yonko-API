// import packages
const express = require('express');

const bodyParser = require('body-parser');

const corsMiddleware = require('./middleware/cors');
const { handleError } = require('./utils/errorHandler');

const baseRouter = require('./routes/baseRouter');

// initialize packages
const app = express();

app.use(corsMiddleware); // CORS handling

app.use(bodyParser.json()); // application/json

// Routes
app.use('/api/v1', baseRouter);

app.use(handleError);

module.exports = app;