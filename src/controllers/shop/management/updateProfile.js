const Shop = require('../../../models/shop');
const { ErrorHandler } = require('../../../utils/errorHandler');
const { isNotEmpty } = require('../../../validations/empty');


module.exports = async (req, res, next) => {
    try {
        const shopId = req.shopId;
        const shop = await Shop.findById(shopId);
        if (!shop) {
            throw new ErrorHandler(404, 'Shop not found.');
        }

        // Use the isNotEmpty function for each field
        if (isNotEmpty(req.body.name)) {
            shop.name = req.body.name;
        }
        if (isNotEmpty(req.body.phone)) {
            shop.phone = req.body.phone;
        }
        if (isNotEmpty(req.body.description)) {
            shop.description = req.body.description;
        }

        if (isNotEmpty(req.body.avatar)) {
            shop.avatar = req.body.avatar;
        }

        const validCategories = [
            'FOOD', 'MEDICINE', 'SUPERMARKET', 'BEAUTY', 
            'PET', 'TECH', 'CLOTHING', 'PLANT', 
            'HOUSEHOLD', 'OTHERS'
        ];
        
        if (isNotEmpty(req.body.category) && validCategories.includes(req.body.category)) {
            shop.category = req.body.category;
        }

        // Handle the address object separately and merge if not empty
        if (isNotEmpty(req.body.address)) {
            shop.address = {
                ...shop.address, // Keep existing address fields
                ...req.body.address, // Update only the provided fields
            };
        }

        shop.status = 'ACTIVE';
        await shop.save();

        res.status(200).json({ message: 'Profile updated successfully', shop });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

