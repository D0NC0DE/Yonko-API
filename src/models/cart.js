const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        items: [
            {
                _id: false,
                productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                selectedVariant: { type: String },
                selectedOption: { type: String },
                selectedAddOns: [
                    {
                        _id: false,
                        name: { type: String, required: true },
                        quantity: { type: Number, required: true }
                    }
                ],
                price: { type: Number, required: true }
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
