const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const itemSchema = require('./item.js');

const cartSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        items: [itemSchema], 
        totalAmount: { type: Number, required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
