const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shopOrderSchema = new Schema(
    {
        shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true }
            }
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
            default: 'PENDING'
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ShopOrder', shopOrderSchema);
