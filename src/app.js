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

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Yonko API');
});

// Routes
app.use('/api/v1', baseRouter);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(handleError);

module.exports = app;