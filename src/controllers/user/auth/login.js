const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const User = require('../../../models/user');
const { ErrorHandler } = require('../../../utils/errorHandler');

exports.postLogin = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const email = req.body.email;

        const user = await User.findOne({ email: email });
        if (!user) {
            throw new ErrorHandler(401, 'User not found.');
        }

        if(user.status !== 'ACTIVE' && user.status !== 'INCOMPLETE') {
            throw new ErrorHandler(401, 'User account is not active.');
        }

        const password = req.body.password;
        if (!password) {
            throw new ErrorHandler(401, 'Password is required.');
        } 

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new ErrorHandler(401, 'Invalid email or password.');
        }

        // Update the lastLogin field
        user.lastLogin = new Date();
        await user.save();

        //// Add OTP verification later 
        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};