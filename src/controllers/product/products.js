const Product = require('../../models/product');
const { ErrorHandler } = require('../../utils/errorHandler');

exports.getProducts = async (req, res, next) => {
    try {
        // Extract filtering options from query parameters
        const { category, minPrice, maxPrice, shopId } = req.query;

        let filter = { status: 'PUBLISHED' }; // Always fetch published products

        // Filter by shopId (store) if provided
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

        // Respond with the filtered products
        res.status(200).json({ products });
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

        // Define the filter based on shopId and optional status
        let filter = { shopId };
        if (status) {
            filter.status = status.toUpperCase(); // Only filter by status if provided
        }

        // Find products based on shopId and status (if provided)
        const products = await Product.find(filter);

        // Respond with filtered products
        res.status(200).json({ products });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
