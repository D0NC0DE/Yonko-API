// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const { randomUUID } = require('crypto');

// // Add-on schema for optional additional items
// const addOnSchema = new Schema({
//     name: { type: String, required: true },
//     price: { type: Number, required: true, min: 0 },
//     maxQuantityAllowed: { type: Number, default: 1 },
// }, { _id: false });

// // Option value schema with price and quantity
// const optionValueSchema = new Schema({
//     value: { type: String, required: true },
//     price: { type: Number, required: true, min: 0 },
//     quantity: { type: Number, required: true, min: 0 },
// }, { _id: false });

// const variantValueSchema = new Schema({
//     value: { type: String, required: true },
//     price: { type: Number, min: 0 },
//     quantity: { type: Number, min: 0 },
//     options: {
//         optionName: {
//             type: String,
//             required: function () {
//                 return this.optionValues && this.optionValues.length > 0;
//             }
//         },
//         optionValues: [optionValueSchema],
//     },
// }, { _id: false });

// // Product schema containing variants and optional add-ons
// const productSchema = new Schema({
//     id: { type: String, default: () => randomUUID() },
//     name: { type: String, required: true, trim: true },
//     description: { type: String, required: true },
//     shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
//     images: [{ type: String, required: true }],
//     status: {
//         type: String,
//         enum: ['DRAFT', 'PUBLISHED', 'DELETED'],
//         default: 'DRAFT'
//     },
//     category: {
//         type: String,
//         required: true,
//         enum: ['FOOD', 'MEDICINE', 'SUPERMARKET', 'BEAUTY', 'PET', 'TECH', 'CLOTHING', 'PLANT', 'HOUSEHOLD', 'OTHERS'],
//     },
//     specifications: { type: Map, of: String },
//     variants: {
//         variantName: {
//             type: String,
//             required: function () {
//                 return this.variantValues && this.variantValues.length > 0;
//             }
//         },
//         variantValues: [variantValueSchema],
//     },
//     addOns: [addOnSchema],
//     basePrice: { type: Number, required: true, min: 0 },
//     baseQuantity: { type: Number, required: true, min: 0 },
// }, {
//     timestamps: true,
// });

// productSchema.index({ _id: 1, shopId: 1 });

// module.exports = mongoose.model('Product', productSchema);


// //// TODO: BREAK THIS DOWN LATER AND HAVE A SEPERATE FILE FOR VARIANTS AND ADDONS
// //// Handle performance later
