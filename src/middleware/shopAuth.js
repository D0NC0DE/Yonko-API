const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/errorHandler');
const config = require('../config/config');
const Shop = require('../models/shop');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            throw new ErrorHandler(401, 'Auth header not found');
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, config.JWT_SECRET);
        if (!decodedToken) {
            throw new ErrorHandler(401, 'Not authenticated!');
        }

        const shop = await Shop.findById(decodedToken.shopId);
        if (!shop) {
            throw new ErrorHandler(404, 'Shop not found.');
        }

        const validToken = shop.token === token;
        if (!validToken) {
            throw new ErrorHandler(401, 'Invalid or expired token!');
        }

        req.shopId = decodedToken.shopId;
        next();
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

