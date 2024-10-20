const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');

const paymentSchema = new Schema(
    {
        id: { type: String, default: () => randomUUID() },
        email: { type: String, required: true },
        amount: { type: mongoose.Types.Decimal128, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'VERIFIED', 'FAILED', 'REVERSED', 'ABANDONED'],
            default: 'PENDING',
        },
        type: {
            type: String,
            enum: ['SUBSCRIPTION', 'PURCHASE'],
            required: true,
        },
        reference: { type: String, required: true },
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    },
    { timestamps: true }
);

paymentSchema.pre('validate', function (next) {
    if (!this.shopId && !this.userId) {
        next(new Error('Either shopId or userId must be provided.'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Payment', paymentSchema);
