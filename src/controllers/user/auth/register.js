const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../../../models/user');

const OTPHandler = require('../../../utils/otpHandler');
const { ErrorHandler } = require('../../../utils/errorHandler'); // import error handler
const { sendWelcomeEmail, sendAccountSetupEmail } = require('../../../services/emailService');
const { generateToken } = require('../../../utils/tokenGenerator');

exports.postRegisterUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const email = req.body.email;
        const user = await User.findOne({ email: email });

        if (!user) {
            const { otp, expiryTime } = OTPHandler();
            const newUser = new User({
                email: email,
                status: 'PENDING',
                OTPCode: otp,
                OTPExpirationTime: expiryTime,
            });
            await newUser.save();
            // Send the OTP via email
            await sendAccountSetupEmail(email, otp);
            return res.status(201).json({ message: 'New user created.' });
        }

        const { otp, expiryTime } = OTPHandler();

        switch (user.status) {
            case 'PENDING':
                user.OTPCode = otp;
                user.OTPExpirationTime = expiryTime;
                await user.save();
                await sendAccountSetupEmail(email, otp);
                return res.status(200).json({ message: 'Success!' });

            case 'VERIFIED':
            case 'DELETED':
                user.status = 'PENDING';
                user.OTPCode = otp;
                user.OTPExpirationTime = expiryTime;
                await user.save();
                await sendAccountSetupEmail(email, otp);
                return res.status(200).json({ message: 'Success!' });

            case 'INCOMPLETE':
            case 'ACTIVE':
                throw new ErrorHandler(409, 'Error: Email already exists.');

            default:
                throw new ErrorHandler(400, 'Invalid user status.');
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
        const user = await User.findOne({ email: email });

        if (!user || user.OTPCode !== otp.toString()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.OTPExpirationTime) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        const token = generateToken({ email: email, userId: user._id.toString() });

        user.status = 'VERIFIED';
        user.OTPCode = null;
        user.OTPExpirationTime = null;
        user.token = token;
        await user.save();

        res.status(200).json({ message: 'User verified successfully', data: { "token": token } });
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
        const user = await User.findOne({ email: email });

        if (!user) {
            throw new ErrorHandler(404, 'User not found.');
        }

        if (user.status !== 'PENDING') {
            throw new ErrorHandler(400, 'Cannot resend OTP, user is not in pending status.');
        }

        // Generate new OTP
        const { otp, expiryTime } = OTPHandler();
        user.OTPCode = otp;
        user.OTPExpirationTime = expiryTime;
        await user.save();
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
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(401, 'Not authenticated!');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const user = await User.findById(userId);
        const password = req.body.password;
        const email = user.email;

        if (!user) {
            throw new ErrorHandler(404, 'User not found.');
        }

        if (user.status !== 'VERIFIED') {
            throw new ErrorHandler(400, 'Cannot send password, user is not verified.');
        }

        user.password = await bcrypt.hash(password, 12);
        user.status = 'INCOMPLETE';
        await user.save();
        await sendWelcomeEmail(email);
        return res.status(200).json({ message: 'Password set successfully.' });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};