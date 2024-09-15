const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');

const shopSchema = new Schema(
    {
        id: { type: String, default: () => randomUUID() },
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        number: { type: String },
        description: { type: String },
        avatar: { type: String },
        token: { type: String },
        category: {
            type: String,
            enum: ['FOOD', 'MEDICINE', 'SUPERMARKET', 'BEAUTY', 'PET', 'TECH', 'CLOTHING', 'PLANT', 'HOUSEHOLD', 'OTHER'],
            default: 'OTHER',
        },
        status: {
            type: String,
            enum: ['PENDING', 'PAID', 'VERIFIED', 'DELETED', 'ACTIVE'],
            default: 'PENDING',
        },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            country: { type: String },
        },
        OTPCode: { type: String },
        OTPExpirationTime: { type: Date },
        lastLogin: { type: Date },

    },
    { timestamp: true }
);

module.exports = mongoose.model('Shop', shopSchema);