const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const Shop = require('../../../models/shop');

const OTPHandler = require('../../../utils/otpHandler');
const { ErrorHandler } = require('../../../utils/errorHandler'); // import error handler
const { sendWelcomeEmail, sendAccountSetupEmail } = require('../../../services/emailService');
const { generateToken } = require('../../../utils/tokenGenerator');

exports.postCreateShop = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const email = req.body.email;
        const shop = await Shop.findOne({ email: email });

        if (!shop) {
            const { otp, expiryTime } = OTPHandler();
            const newShop = new Shop({
                email: email,
                status: 'PENDING',
                OTPCode: otp,
                OTPExpirationTime: expiryTime,
            });
            await newShop.save();
            // Send the OTP via email
            await sendAccountSetupEmail(email, otp);
            return res.status(201).json({ message: 'New Shop created.' });
        }

        const { otp, expiryTime } = OTPHandler();

        switch (shop.status) {
            case 'PENDING':
                shop.OTPCode = otp;
                shop.OTPExpirationTime = expiryTime;
                await shop.save();
                await sendAccountSetupEmail(email, otp);
                return res.status(200).json({ message: 'Success!' });

            case 'VERIFIED':
            case 'DELETED':
                shop.status = 'PENDING';
                shop.OTPCode = otp;
                shop.OTPExpirationTime = expiryTime;
                await shop.save();
                await sendAccountSetupEmail(email, otp);
                return res.status(200).json({ message: 'Success!' });

            case 'INCOMPLETE':
            case 'ACTIVE':
            case 'PAID':
                throw new ErrorHandler(409, 'Error: Email already exists.');

            default:
                throw new ErrorHandler(400, 'Invalid shop status.');
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postVerifyOTP = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const email = req.body.email;
        const otp = req.body.otp;
        const shop = await Shop.findOne({ email: email });

        if (!shop || shop.OTPCode !== otp.toString()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > shop.OTPExpirationTime) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const token = generateToken({ email: email, shopId: shop._id.toString() })

        shop.status = 'VERIFIED';
        shop.OTPCode = null;
        shop.OTPExpirationTime = null;
        shop.token = token;
        await shop.save();

        res.status(200).json({ message: 'shop verified successfully' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postResendOTP = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const email = req.body.email;
        const shop = await Shop.findOne({ email: email });

        if (!shop) {
            throw new ErrorHandler(404, 'shop not found.');
        }

        if (shop.status !== 'PENDING') {
            throw new ErrorHandler(400, 'Cannot resend OTP, shop is not in pending status.');
        }

        // Generate new OTP
        const { otp, expiryTime } = OTPHandler();
        shop.OTPCode = otp;
        shop.OTPExpirationTime = expiryTime;
        await shop.save();
        await sendAccountSetupEmail(email, otp);
        return res.status(200).json({ message: 'OTP resent successfully.' });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.postSetPassword = async (req, res, next) => {
    try {
        const shopId = req.shopId;
        if (!shopId) {
            throw new ErrorHandler(401, 'Not authenticated!');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        // const shop = await Shop.findOne({ _id: shopId });
        const shop = await Shop.findById(shopId);
        const password = req.body.password;
        const email = shop.email;

        if (!shop) {
            throw new ErrorHandler(404, 'shop not found.');
        }

        if (shop.status !== 'VERIFIED') {
            throw new ErrorHandler(400, 'Cannot send password, shop is not verified.');
        }

        shop.password = await bcrypt.hash(password, 12);
        shop.status = 'INCOMPLETE';
        await shop.save();
        await sendWelcomeEmail(email);
        return res.status(200).json({ message: 'Password set successfully.' });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};