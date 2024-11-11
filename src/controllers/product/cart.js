const { addItemToCart, findExistingProductIndex } = require('../../helpers/cartHelper');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const { ErrorHandler } = require('../../utils/errorHandler');

exports.addToCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { productId, quantity, selectedVariantId, selectedOptionId, selectedAddOns } = req.body;
        if (!productId || !quantity) {
            throw new ErrorHandler(400, 'Product ID and quantity are required.');
        }

        const cart = await addItemToCart(userId, productId, quantity, selectedVariantId, selectedOptionId, selectedAddOns);

        res.status(200).json({
            message: 'Product added to cart successfully',
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { itemId } = req.body;
        if (!itemId) {
            throw new ErrorHandler(400, 'Cart item ID is required.');
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        const productIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (productIndex < 0) {
            throw new ErrorHandler(404, 'Item not found in cart.');
        }
        const removedItem = cart.items[productIndex];
        cart.totalAmount -= removedItem.price;
        cart.items.splice(productIndex, 1);
        await cart.save();

        res.status(200).json({
            message: 'Product removed from cart successfully',
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.reduceQuantity = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { itemId } = req.body;
        if (!itemId) {
            throw new ErrorHandler(400, 'Product ID is required.');
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        const productIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (productIndex < 0) {
            throw new ErrorHandler(404, 'Item not found in cart.');
        }

        const itemPrice = cart.items[productIndex].price / cart.items[productIndex].quantity;

        // Adjust quantity and price
        if (cart.items[productIndex].quantity > 1) {
            cart.items[productIndex].quantity -= 1;
            cart.items[productIndex].price = Math.max(0, cart.items[productIndex].price - itemPrice);
            cart.totalAmount = Math.max(0, cart.totalAmount - itemPrice);
        } else {
            cart.totalAmount = Math.max(0, cart.totalAmount - cart.items[productIndex].price);
            cart.items.splice(productIndex, 1);
        }

        await cart.save();

        res.status(200).json({
            message: 'Product quantity reduced successfully',
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.clearCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        res.status(200).json({
            message: 'Cart cleared successfully',
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.getCart = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        // const cart = await Cart.findOne({ userId }).populate({
        //     path: 'items.productId',
        //     select: '_id name images'
        // });
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new ErrorHandler(404, 'Cart not found for this user.');
        }

        res.status(200).json({
            cart
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

//TODO: Remove Addon from Cart
// Max quantity of a product in cart
// Populate product details in cart
