const dotenv = require('dotenv');

dotenv.config();

// export the configuration object
module.exports = {
    MONGODB_USERNAME: process.env.MONGODB_USERNAME,
    MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,
    MONGODB_HOST: process.env.MONGODB_HOST,
    MONGODB_DB: process.env.MONGODB_DB,
    MONGODB_APPNAME: process.env.MONGODB_APPNAME,
    PORT: process.env.PORT,

    POSTMARK_API_KEY: process.env.POSTMARK_API_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,

    SPACE_ACCESS_ID: process.env.SPACE_ACCESS_ID,
    SPACE_ACCESS_KEY: process.env.SPACE_ACCESS_KEY,
};
