const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const Shop = require('../../../models/shop');
const { ErrorHandler } = require('../../../utils/errorHandler');

exports.postLogin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const email = req.body.email;

        const shop = await Shop.findOne({ email: email });
        if (!shop) {
            throw new ErrorHandler(401, 'Shop not found.');
        }

        if(shop.status !== 'ACTIVE' && shop.status !== 'INCOMPLETE') {
            throw new ErrorHandler(401, 'Shop account is not active.');
        }

        if(shop.subscription !== 'PAID') {
            throw new ErrorHandler(401, 'Shop subscription is not active.');
        }

        const password = req.body.password;
        if (!password) {
            throw new ErrorHandler(401, 'Password is required.');
        } 

        console.log('password', password);
        const isPasswordMatch = await bcrypt.compare(password, shop.password);
        console.log('isPasswordMatch', isPasswordMatch);
        if (!isPasswordMatch) {
            throw new ErrorHandler(401, 'Invalid email or password.');
        }

        // Update the lastLogin field
        shop.lastLogin = new Date();
        await shop.save();

        //// Add OTP verification later 
        res.status(200).json({ message: 'Login successful', shop });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};