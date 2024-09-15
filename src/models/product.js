const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');

// Add-on schema for optional additional items
const addOnSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { _id: false });

// Option value schema with price and quantity
const optionValueSchema = new Schema({
    value: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { _id: false });

// Option schema for each variant (e.g., color options for size variants)
const optionSchema = new Schema({
    optionName: { type: String, required: true },
    optionValues: [optionValueSchema],
}, { _id: false });

// Variant schema (e.g., Size) containing nested options (e.g., Color)
const variantSchema = new Schema({
    variantName: { type: String, required: true },
    variantValue: { type: String, required: true },
    price: { type: Number },
    quantity: { type: Number },
    options: [optionSchema],
}, { _id: false });

// Product schema containing variants and optional add-ons
const productSchema = new Schema({
    id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    specifications: { type: String },
    variants: [variantSchema],
    addOns: [addOnSchema],
    basePrice: { type: Number, required: true },
    baseQuantity: { type: Number, required: true },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
