const { ErrorHandler } = require('../utils/errorHandler');
const Shop = require('../models/shop'); // Assuming you have a Shop model

const checkShopStatus = async (req, res, next) => {
    try {
        // const shopId = req.shopId;
        // if (!shopId) {
        //     throw new ErrorHandler(403, 'Forbidden');
        // }

        // const shop = await Shop.findById(shopId);
        // if (!shop || shop.subscription !== 'PAID') {
        //     throw new ErrorHandler(403, 'Shop must be paid to perform this action.');
        // }

        next();
    } catch (err) {
        next(err);
    }
};

module.exports = checkShopStatus;
