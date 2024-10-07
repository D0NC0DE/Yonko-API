const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');

// Add-on schema for optional additional items
const addOnSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    maxQuantityAllowed: { type: Number, default: 1 },
}, { _id: false });

// Option value schema with price and quantity
const optionValueSchema = new Schema({
    value: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
}, { _id: false });

// Option schema for each variant (e.g., color options for size variants)
const optionSchema = new Schema({
    optionName: { type: String, required: true },
    optionValues: [optionValueSchema],
}, { _id: false });

const variantValueSchema = new Schema({
    value: { type: String, required: true },
    price: { type: Number, min: 0 },
    quantity: { type: Number, min: 0 },
    options: [optionSchema],
}, { _id: false });

// Variant schema (e.g., Size) containing nested options (e.g., Color)
const variantSchema = new Schema({
    variantName: { type: String, required: true },
    variantValues: [variantValueSchema],
}, { _id: false });

// Product schema containing variants and optional add-ons
const productSchema = new Schema({
    id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    image: { type: String, required: true },
    status: {
        type: String,
        enum: ['DRAFT', 'PUBLISHED', 'DELETED'],
        default: 'DRAFT'
    },
    category: {
        type: String,
        required: true,
        enum: ['FOOD', 'MEDICINE', 'SUPERMARKET', 'BEAUTY', 'PET', 'TECH', 'CLOTHING', 'PLANT', 'HOUSEHOLD', 'OTHERS'],
    },
    specifications: { type: Map, of: String },
    variants: [variantSchema],
    addOns: [addOnSchema],
    basePrice: { type: Number, required: true, min: 0 },
    baseQuantity: { type: Number, required: true, min: 0 },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);


//// BREAK THIS DOWN LATER AND HAVE A SEPERATE FILE FOR VARIANTS AND ADDONS