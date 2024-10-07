const { validationResult } = require('express-validator');

const Product = require('../../models/product');
const { ErrorHandler } = require('../../utils/errorHandler'); 
const { isNotEmpty } = require('../../validations/empty');

exports.createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const shopId = req.shopId;
        if (!shopId) {
            throw new ErrorHandler(403, 'Forbidden');
        }

        const {
            name,
            description,
            image,
            category,
            specifications,
            variants,
            addOns,
            basePrice,
            baseQuantity
        } = req.body;

        // Create a new product instance
        const product = new Product({
            name,
            description,
            shopId,
            image,
            category,
            specifications,
            variants,
            addOns,
            basePrice,
            baseQuantity
        });

        // Save the product to the database
        await product.save();

        // Respond with the newly created product
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.addProduct = async (req, res, next) => {
    try {
        const shopId = req.shopId;
        if (!shopId) {
            throw new ErrorHandler(403, 'Forbidden');
        }

        const productId = req.body.productId; // Assuming productId is passed in the request body
        if (!productId) {
            throw new ErrorHandler(400, 'Product ID is required.');
        }

        // Find the product by productId and ensure it belongs to the shop
        const product = await Product.findOne({ _id: productId, shopId });

        if (!product) {
            throw new ErrorHandler(404, 'Product not found or does not belong to this shop.');
        }

        // Update the product status to 'PUBLISHED'
        product.status = 'PUBLISHED';
        await product.save();

        // Respond with success message
        res.status(200).json({ message: 'Product published to shop front successfully.', product });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const shopId = req.shopId;
        if (!shopId) {
            throw new ErrorHandler(403, 'Forbidden');
        }

        const productId = req.body.productId;
        if (!productId) {
            throw new ErrorHandler(400, 'Product ID is required.');
        }

        // Find the product by productId and ensure it belongs to the shop
        const product = await Product.findOne({ _id: productId, shopId });

        if (!product) {
            throw new ErrorHandler(404, 'Product not found or does not belong to this shop.');
        }

        // Destructure the fields to update from the request body
        const {
            name,
            description,
            image,
            category,
            specifications,
            variants,
            addOns,
            basePrice,
            baseQuantity
        } = req.body;

        // Only update fields that are provided in the request body
        if (isNotEmpty(name)) product.name = name;
        if (isNotEmpty(description)) product.description = description;
        if (isNotEmpty(image)) product.image = image;
        if (isNotEmpty(category)) product.category = category;
        if (isNotEmpty(specifications)) product.specifications = specifications;
        if (isNotEmpty(variants)) product.variants = variants;
        if (isNotEmpty(addOns)) product.addOns = addOns;
        if (isNotEmpty(basePrice) && basePrice > 0) product.basePrice = basePrice;
        if (isNotEmpty(baseQuantity) && baseQuantity >= 0) product.baseQuantity = baseQuantity;
    

        // Save the updated product to the database
        await product.save();

        // Respond with success message
        res.status(200).json({ message: 'Product updated successfully', product });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.removeProduct = async (req, res, next) => {
    try {
        const shopId = req.shopId;
        if (!shopId) {
            throw new ErrorHandler(403, 'Forbidden');
        }

        const productId = req.body.productId; // Assuming productId is passed in the request body
        if (!productId) {
            throw new ErrorHandler(400, 'Product ID is required.');
        }

        // Find the product by productId and ensure it belongs to the shop
        const product = await Product.findOne({ _id: productId, shopId });

        if (!product) {
            throw new ErrorHandler(404, 'Product not found or does not belong to this shop.');
        }

        // Update the product status to 'PUBLISHED'
        product.status = 'DRAFT';
        await product.save();

        // Respond with success message
        res.status(200).json({ message: 'Product removed successfully', product });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const shopId = req.shopId;
        if (!shopId) {
            throw new ErrorHandler(403, 'Forbidden');
        }

        const productId = req.body.productId; 
        if (!productId) {
            throw new ErrorHandler(400, 'Product ID is required.');
        }

        // Find the product by productId and ensure it belongs to the shop
        const product = await Product.findOne({ _id: productId, shopId });

        if (!product) {
            throw new ErrorHandler(404, 'Product not found or does not belong to this shop.');
        }

        // Update the product status to 'PUBLISHED'
        product.status = 'DELETED';
        await product.save();

        // Respond with success message
        res.status(200).json({ message: 'Product deleted successfully', product });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};