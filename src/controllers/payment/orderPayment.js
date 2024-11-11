const { validationResult } = require("express-validator");
const mongoose = require('mongoose');
const { initializePayment, getVerifyPayment } = require("../../services/paymentService");
const { ErrorHandler } = require("../../utils/errorHandler");
const Payment = require("../../models/payment");
const Shop = require("../../models/shop");
const Order = require("../../models/order");
const User = require("../../models/user");
const Product = require("../../models/product");
const createShopOrders = require("../../helpers/orderHelper");
const { sendAccountSetupEmail, sendOrderConfirmationEmail } = require("../../services/emailService");
const Cart = require("../../models/cart");

// Initialize purchase payment
exports.initPurchase = async (req, res, next) => {
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

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const email = user.email;
        if (!email) {
            return res.status(400).json({ message: 'User email not found.' });
        }

        const amountInKobo = order.totalPurchaseCost;

        const response = await initializePayment(email, amountInKobo);

        const payment = new Payment({
            email,
            amount: amountInKobo,
            type: 'PURCHASE',
            reference: response.reference,
            userId,
        });
        await payment.save();

        res.status(200).json({
            message: 'Payment initialized successfully',
            accessCode: response.access_code,
            authorizationUrl: response.authorization_url,
            payment,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// Function to verify payment and process order
exports.verifyPurchasePayment = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { reference } = req.body;
        const ref = reference;
        const orderId = req.params.orderId;

        if (!ref || !orderId) {
            throw new ErrorHandler(400, 'Reference and Order ID are required');
        }

        // Step 1: Verify payment with external service
        const paymentStatus = await getVerifyPayment(ref);
        if (!paymentStatus.status) {
            throw new ErrorHandler(400, paymentStatus.message);
        }

        // Step 2: Find and validate payment record
        const payment = await Payment.findOne({ reference: ref }).session(session);
        if (!payment) throw new ErrorHandler(404, 'Payment not found');
        if (payment.amount !== paymentStatus.amount) throw new ErrorHandler(400, 'Amount mismatch');

        // Step 3: Update payment and order status if payment is verified
        payment.status = paymentStatus.status;
        payment.transactionId = paymentStatus.transaction_id;
        await payment.save({ session });

        if (payment.status !== 'VERIFIED') {
            throw new ErrorHandler(400, 'Payment verification failed');
        }

        const order = await Order.findById(orderId)
            .populate('items.productId', 'name')
            .session(session);
        if (!order) throw new ErrorHandler(404, 'Order not found');

        // Fetch the user details
        const user = await User.findById(order.userId).session(session);
        if (!user) throw new ErrorHandler(404, 'User not found');

        // Update order status to 'PAID'
        order.status = 'PAID';
        await order.save({ session });

        // Step 4: Adjust stock for each item in the order
        for (const item of order.items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                throw new ErrorHandler(404, `Product not found for ID: ${item.productId}`);
            }

            // Handle stock reduction based on variant and option selections
            if (item.selectedVariantId && item.selectedOptionId) {
                // Scenario: Both variant and option are selected
                const variant = product.variants.variantValues.find(v => v._id.toString() === item.selectedVariantId.toString());
                if (!variant) throw new ErrorHandler(404, `Variant not found for ID: ${item.selectedVariantId}`);

                const option = variant.options.optionValues.find(o => o._id.toString() === item.selectedOptionId.toString());
                if (!option) throw new ErrorHandler(404, `Option not found for ID: ${item.selectedOptionId}`);

                if (option.quantity < item.quantity) {
                    throw new ErrorHandler(400, `Insufficient stock for option of ${product.name}`);
                }
                option.quantity -= item.quantity;

            } else if (item.selectedVariantId) {
                // Scenario: Only variant is selected
                const variant = product.variants.variantValues.find(v => v._id.toString() === item.selectedVariantId.toString());
                if (!variant) throw new ErrorHandler(404, `Variant not found for ID: ${item.selectedVariantId}`);

                if (variant.quantity < item.quantity) {
                    throw new ErrorHandler(400, `Insufficient stock for variant of ${product.name}`);
                }
                variant.quantity -= item.quantity;

            } else {
                // Scenario: No variant or option selected
                if (product.baseQuantity < item.quantity) {
                    throw new ErrorHandler(400, `Insufficient stock for ${product.name}`);
                }
                product.baseQuantity -= item.quantity;
            }

            // Save the product with updated stock
            await product.save({ session });
        }

        // Commit the transaction
        await session.commitTransaction();

        await Cart.updateOne(
            { userId: order.userId },
            { $pull: { items: { _id: { $in: order.items.map(item => item._id) } } } }
        );

        const email = user.email;
        const orderDetails = {
            username: user.name,
            orderItems: order.items.map(item => ({
                name: item.productId.name,
                quantity: item.quantity,
                price: item.price,
            })),
            totalAmount: order.totalAmount,
            deliveryAddress: "Nigeria",  // TODO: Add delivery address to order
            deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // TODO: Add delivery date to order
        };

        await sendOrderConfirmationEmail(email, orderDetails);
        await createShopOrders(order);
        
        res.status(200).json({
            message: 'Payment verified and order processed successfully',
            paymentStatus,
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        next(error);
    } finally {
        session.endSession();
    }
};
