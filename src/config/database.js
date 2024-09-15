const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
    const mongoURI = `mongodb+srv://${config.MONGODB_USERNAME}:${config.MONGODB_PASSWORD}` +
        `@${config.MONGODB_HOST}/${config.MONGODB_DB}` +
        `?retryWrites=true&w=majority&appName=${config.MONGODB_APPNAME}`;
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;