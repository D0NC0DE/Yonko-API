const { validationResult } = require("express-validator");
const { initializePayment, getVerifyPayment } = require("../../services/paymentService");
const { ErrorHandler } = require("../../utils/errorHandler");
const Payment = require("../../models/payment");
const Shop = require("../../models/shop");

const SUBSCRIPTION_TIERS = {
    BASIC: { amount: 120000, label: 'BASIC' },
    PREMIUM: { amount: 220000, label: 'PREMIUM' },
    ELITE: { amount: 320000, label: 'ELITE' }
};

// Helper function to determine package amount
const getPackageAmount = (packageName) => {
    const subscription = SUBSCRIPTION_TIERS[packageName];
    if (!subscription) {
        throw new ErrorHandler(400, 'Invalid package type');
    }
    return subscription.amount;
};

// Helper function to update shop subscription
const updateShopSubscription = async (shop, amount) => {
    const normalizedAmount = amount / 100; // Convert amount back to naira

    for (const tier in SUBSCRIPTION_TIERS) {
        if (SUBSCRIPTION_TIERS[tier].amount === normalizedAmount) {
            shop.subscription = SUBSCRIPTION_TIERS[tier].label;
            await shop.save();
            return;
        }
    }
    throw new ErrorHandler(400, 'Invalid amount for subscription package');
};

// Initialize subscription payment
exports.initSubscription = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const { email, package } = req.body;
        const shopId = req.shopId;
        if (!shopId) {
            throw new ErrorHandler(403, 'Forbidden');
        }

        const shop = await Shop.findById(shopId);
        if (!shop) {
            throw new ErrorHandler(404, 'Shop not found');
        }

        if (shop.email !== email) {
            throw new ErrorHandler(403, 'Email does not match the shop owner\'s email');
        }

        const amount = getPackageAmount(package) * 100;
        const response = await initializePayment(email, amount);
        const payment = new Payment({
            email,
            amount: amount, // Ensure the correct conversion factor
            type: 'SUBSCRIPTION',
            reference: response.reference,
            shopId,
        });

        await payment.save();

        res.status(200).json({
            message: 'Payment initialized successfully',
            accessCode: response.access_code,
            payment,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.verifySubscription = async (req, res, next) => {
    try {
        const { ref } = req.query;
        if (!ref) {
            throw new ErrorHandler(400, 'Reference is required');
        }

        const paymentStatus = await getVerifyPayment(ref);
        if (!paymentStatus.status) {
            throw new ErrorHandler(400, paymentStatus.message);
        }

        const payment = await Payment.findOne({ reference: ref });
        if (!payment) {
            throw new ErrorHandler(404, 'Payment not found');
        }

        // Check if the amount matches
        if (payment.amount.toString() !== paymentStatus.amount.toString()) {
            throw new ErrorHandler(400, 'Amount mismatch');
        }

        // Update payment status and transaction ID
        payment.status = paymentStatus.status;
        payment.transactionId = paymentStatus.transaction_id;
        await payment.save();

        // Update shop subscription if payment is VERIFIED
        if (payment.status === 'VERIFIED') {
            const shop = await Shop.findById(payment.shopId);
            if (!shop) {
                throw new ErrorHandler(404, 'Shop not found');
            }

            await updateShopSubscription(shop, payment.amount);
        }

        res.status(200).json({
            message: 'Payment verified successfully',
            paymentStatus,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

