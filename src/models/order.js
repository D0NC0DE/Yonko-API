const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const itemSchema = require('./item.js');

const orderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        items: [itemSchema], 
        totalAmount: { 
            type: Number, 
            required: true,
            set: value => parseFloat(value.toFixed(2)) // Ensure totalAmount is always 2 decimal points
        },
        status: {
            type: String,
            enum: [
                'PENDING',           // Order created but not paid
                'PAID',              // Payment completed successfully
                'PROCESSING',        // Mercs hant is preparing the order
                'SHIPPED',           // Order shipped to the user
                'DELIVERED',         // Order delivered to the user
                'CANCELLED',         // Order cancelled
                'RETURN_REQUESTED',  // User requested a return
                'RETURNED',          // Order returned back to the merchant
                'REFUNDED'           // Payment refunded to the user
            ],
            default: 'PENDING'
        },
        totalPurchaseCost: { type: Number }, // Total cost of purchasing the items
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);