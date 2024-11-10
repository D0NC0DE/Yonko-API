const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    selectedVariantId: { type: Schema.Types.ObjectId },
    selectedOptionId: { type: Schema.Types.ObjectId },
    selectedAddOns: [
        {
            _id: false,
            addOnId: { type: Schema.Types.ObjectId, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    price: { type: Number, required: true }
});

module.exports = itemSchema;