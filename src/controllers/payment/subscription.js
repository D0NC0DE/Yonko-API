const { validationResult } = require("express-validator");
const { initializePayment } = require("../../services/paymentService");
const { ErrorHandler } = require("../../utils/errorHandler");
const Payment = require("../../models/payment");

exports.initSubscription = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ErrorHandler(422, 'Validation failed.', errors.array());
        }

        const { email, package } = req.body;
        const shopId = req.shopId;

        let amount;
        switch (package) {
            case 'BASIC':
                amount = 120000;
                break;
            case 'PREMIUM':
                amount = 220000;
                break;
            case 'ELITE':
                amount = 320000;
                break;
            default:
                throw new ErrorHandler(400, 'Invalid package type');
        }

        if (!shopId) {
            throw new ErrorHandler(403, 'Forbidden');
        }

        const type = 'SUBSCRIPTION';
        const response = await initializePayment(email, amount);
        const payment = new Payment({
            email,
            amount,
            type,
            reference: response.reference,
            shopId,
        });
        await payment.save();

        res.status(200)
            .json({
                message: 'Payment initialized successfully',
                accessCode: response.access_code,
                payment
            });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
