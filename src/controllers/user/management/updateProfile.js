const User = require('../../../models/user');
const { ErrorHandler } = require('../../../utils/errorHandler');
const { isNotEmpty } = require('../../../validations/empty');


module.exports = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            throw new ErrorHandler(404, 'User not found.');
        }

        // Use the isNotEmpty function for each field
        if (isNotEmpty(req.body.name)) {
            user.name = req.body.name;
        }
        if (isNotEmpty(req.body.phone)) {
            user.phone = req.body.phone;
        }
        if (isNotEmpty(req.body.birthDate)) {
            user.birthDate = req.body.birthDate;
        }

        // Validate and update gender if provided and valid
        const validGenders = ['MALE', 'FEMALE', 'OTHERS'];

        if (isNotEmpty(req.body.gender) && validGenders.includes(req.body.gender)) {
            user.gender = req.body.gender;
        }

        // Handle the address object separately and merge if not empty
        if (isNotEmpty(req.body.address)) {
            user.address = {
                ...user.address, // Keep existing address fields
                ...req.body.address, // Update only the provided fields
            };
        }

        user.status = 'ACTIVE';
        await user.save();

        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

