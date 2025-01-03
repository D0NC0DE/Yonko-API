const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { randomUUID } = require('crypto');

const userSchema = new Schema(
    {
        id: { type: String, default: () => randomUUID() },
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        phone: { type: String },
        birthDate: { type: Date },
        avatar: { type: String },
        token: { type: String },
        status: {
            type: String,
            enum: ['PENDING', 'VERIFIED', 'INCOMPLETE', 'ACTIVE', 'DELETED'],
            default: 'PENDING',
        },
        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHERS'],
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

module.exports = mongoose.model('User', userSchema);