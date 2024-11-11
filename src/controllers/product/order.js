const { calculateTotalPrice } = require('../../helpers/cartHelper');
const calculateFee = require('../../helpers/paymentHelper');
const Cart = require('../../models/cart');
const Order = require('../../models/order');
const Product = require('../../models/product');
const { ErrorHandler } = require('../../utils/errorHandler');

exports.createOrder = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new ErrorHandler(403, 'User not authenticated');
        }

        const { items } = req.body;
        if (!items || items.length === 0) {
            throw new ErrorHandler(400, 'Items are required.');
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            throw new ErrorHandler(404, `Cart for user with ID ${userId} not found.`);
        }

        const updatedItems = await Promise.all(items.map(async (itemId) => {
            const item = cart.items.find(cartItem => cartItem._id.toString() === itemId);
            if (!item) {
                throw new ErrorHandler(404, `Item with ID ${itemId} not found in cart.`);
            }

            const product = await Product.findById(item.productId);
            if (!product) {
                throw new ErrorHandler(404, `Product with ID ${item.productId} not found.`);
            }
            const recalculatedPrice = await calculateTotalPrice(product, item.quantity, item.selectedVariantId, item.selectedOptionId, item.selectedAddOns);
            return {
                ...item.toObject(),
                price: recalculatedPrice
            };
        }));

        const totalAmount = updatedItems.reduce((acc, item) => acc + item.price, 0);

        // TODO: Add the new price and update totalAmount in the cart
        const orderData = {
            userId,
            items: updatedItems,
            totalAmount
        };

        const order = new Order(orderData);
        await order.save();

        res.status(200).json({
            message: 'Order created successfully',
            order
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.directOrder = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(403).json({ message: 'User not authenticated' });
        }

        const { productId, quantity, selectedVariantId, selectedOptionId, selectedAddOns } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and quantity are required.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.variants && product.variants.variantValues.length > 0) {
            if (!selectedVariantId) {
                throw new ErrorHandler(400, 'Product has variants. Please select a variant.');
            }
    
            const variant = product.variants.variantValues.find(vv => vv._id.toString() === selectedVariantId.toString());
            if (variant && variant.options && variant.options.optionValues.length > 0 && !selectedOptionId) {
                throw new ErrorHandler(400, 'Selected variant has options. Please select an option.');
            }
        }

        // Calculate total price based on quantity and price
        const totalAmount = await calculateTotalPrice(product, quantity, selectedVariantId, selectedOptionId, selectedAddOns);

        const orderData = {
            userId,
            items: [{
                productId,
                quantity,
                price: totalAmount,
                selectedVariantId,
                selectedOptionId,
                selectedAddOns,
            }],
            totalAmount
        };

        // Create and save the order
        const order = await Order.create(orderData);

        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    } catch (err) {
        next(err);
    }
};

exports.checkout = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(403).json({ message: 'User not authenticated' });
        }

        const orderId = req.params.orderId;
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required.' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        if (order.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to this order.' });
        }

        const goodsPrice = order.totalAmount * 100; // Convert to kobo
        //TODO: Add delivery fee calculation
        const deliveryFee = 500 * 100; // Fixed delivery fee in kobo
        const amount = goodsPrice + deliveryFee;
        
        const { serviceFee, finalAmount } = calculateFee(amount);
        const totalPurchaseCost = finalAmount;

        await Order.findByIdAndUpdate(orderId, { totalPurchaseCost });

        res.status(200).json({
            message: 'Checkout summary',
            data: {
                goodsPrice: goodsPrice / 100,
                serviceFee: serviceFee / 100,
                deliveryFee: deliveryFee / 100,
                totalPurchaseCost: totalPurchaseCost / 100
            }
        });
    } catch (err) {
        next(err);
    }
};
