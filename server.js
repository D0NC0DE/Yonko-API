const mongoose = require('mongoose');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const config = require('./src/config/config');

// connect to MongoDB
connectDB();
app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});