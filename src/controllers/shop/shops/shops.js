const Shop = require('../../../models/shop');
const { ErrorHandler } = require('../../../utils/errorHandler');

const extractShopDetails = (shop) => ({
    id: shop.id,
    name: shop.name,
    email: shop.email,
    phone: shop.phone,
    description: shop.description,
    avatar: shop.avatar,
    subscription: shop.subscription,
    category: shop.category,
    address: shop.address
});

exports.getShops = async (req, res, next) => {
    try {
        const { category, subscription } = req.query;
        const filter = {
            status: 'ACTIVE',
            subscription: { $ne: 'UNPAID' }
        };

        // Filter by category if provided
        if (category) {
            filter.category = category.toUpperCase();
        }

        // Filter by subscription if provided
        if (subscription) {
            filter.subscription = subscription.toUpperCase();
        }

        // Fetch shops based on filters
        const shops = await Shop
            .find(filter)
            .select(
                'id name email phone description avatar subscription category address'
            );;

        const shopDetails = shops.map(extractShopDetails);
        res.status(200).json({ shops: shopDetails });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getShop = async (req, res, next) => {
    try {
        const shopId = req.params.shopId;
        const shop = await Shop
            .findOne({
                _id: shopId, status: 'ACTIVE',
                subscription: { $ne: 'UNPAID' }
            })
            .select(
                'id name email phone description avatar subscription category address'
            );;

        if (!shop) {
            throw new ErrorHandler(404, 'Shop not found');
        }

        const shopDetails = extractShopDetails(shop);
        res.status(200).json({ shop: shopDetails });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};