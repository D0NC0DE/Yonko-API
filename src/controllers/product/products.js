const Product = require('../../models/product');
const { ErrorHandler } = require('../../utils/errorHandler');

exports.getProducts = async (req, res, next) => {
    try {
        const { category, minPrice, maxPrice, shopId } = req.query;

        let filter = { status: 'PUBLISHED' }; // Always fetch published products

        if (shopId) {
            filter.shopId = shopId;
        }

        // Filter by category if provided
        if (category) {
            filter.category = category.toUpperCase();
        }

        // Filter by price range if minPrice or maxPrice is provided
        if (minPrice || maxPrice) {
            filter.basePrice = {};
            if (minPrice) filter.basePrice.$gte = parseFloat(minPrice);
            if (maxPrice) filter.basePrice.$lte = parseFloat(maxPrice);
        }

        // Fetch products based on filters
        const products = await Product.find(filter);

        res.status(200).json({ products });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getProduct = async (req, res, next) => {
    try {
        const prodId = req.params.productId;
        const product = await Product.findById(prodId);

        if (!product) {
            throw new ErrorHandler(404, 'Product not found');
        }

        res.status(200).json({ product });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.getShopProducts = async (req, res, next) => {
    try {
        const shopId = req.shopId;
        if (!shopId) {
            throw new ErrorHandler(403, 'Forbidden');
        }

        // Get status from query parameter for filtering (e.g., ?status=PUBLISHED)
        const { status } = req.query;

        let filter = { shopId };
        if (status) {
            filter.status = status.toUpperCase(); 
        }

        // Find products based on shopId and status (if provided)
        const products = await Product.find(filter);

        res.status(200).json({ products });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
