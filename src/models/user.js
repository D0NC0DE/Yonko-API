const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');

const userSchema = new Schema(
    {
        id: { type: String, default: () => randomUUID() },
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        number: { type: String },
        birthDate: { type: Date },
        avatar: { type: String },
        token: { type: String },
        refreshToken: { type: String },
        status: {
            type: String,
            enum: ['PENDING', 'VERIFIED', 'DELETED', 'ACTIVE'],
            default: 'PENDING',
        },
        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHER'],
            default: null,
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

module.exports = mongoose.model('User', userSchema);