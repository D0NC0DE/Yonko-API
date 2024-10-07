const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');

const shopSchema = new Schema(
    {
        id: { type: String, default: () => randomUUID() },
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        phone: { type: String },
        description: { type: String },
        avatar: { type: String },
        token: { type: String },
        subscription: { type: String, 
            enum: ['UNPAID', 'PAID', 'TRIAL', 'EXPIRED'],
            default: 'UNPAID',
        },
        category: {
            type: String,
            enum: ['FOOD', 'MEDICINE', 'SUPERMARKET', 'BEAUTY', 'PET', 'TECH', 'CLOTHING', 'PLANT', 'HOUSEHOLD', 'OTHERS'],
            default: 'OTHERS',
        },
        status: {
            type: String,
            enum: ['PENDING', 'VERIFIED', 'INCOMPLETE', 'ACTIVE', 'DELETED'],
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
    { timestamps: true }
);

module.exports = mongoose.model('Shop', shopSchema);