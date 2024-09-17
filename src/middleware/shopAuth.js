const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/errorHandler');
const config = require('../config/config');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        console.log('Auth header not found');
        throw new ErrorHandler(401, 'Auth header not found');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = jwt.verify(token, config.JWT_SECRET);
        if (!decodedToken) {
            throw new ErrorHandler(401, 'Not authenticated!');
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
