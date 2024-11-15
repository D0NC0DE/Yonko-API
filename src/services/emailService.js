const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const path = require('path');
const postmark = require("postmark");

const config = require('../config/config');
const rootDir = require('../utils/path');
const shop = require('../models/shop');
const client = new postmark.ServerClient(config.POSTMARK_API_KEY);

// Paths for templates
const TEMPLATES = {
    accountSetup: path.join(rootDir, 'static', 'template.ejs'),
    welcome: path.join(rootDir, 'static', 'template.ejs'),
    order: path.join(rootDir, 'static', 'order.ejs'),
    shopOrder: path.join(rootDir, 'static', 'shopOrder.ejs'),
};

// Email details like subjects and default text
const EMAIL_DETAILS = {
    accountSetup: {
        subject: 'Account Setup',
        text: (otp) => `Please enter the OTP code - ${otp} to complete your account setup.`,
    },
    welcome: {
        subject: 'Welcome to Yonko!',
        text: 'Thank you for signing up with Yonko. We are excited to have you on board!',
    },
    order: {
        subject: 'Order Confirmation - Yonko!',
        text: 'Your order has been confirmed. Please see the details below.',
    },
    shopOrder: {
        subject: 'New Order - Yonko!',
        text: 'You have a new order. Please see the details below.',
    }
};

// Generalized sendEmail function
const sendEmail = async (type, recipientEmail, options = {}) => {
    // Check if type is valid
    if (!TEMPLATES[type] || !EMAIL_DETAILS[type]) {
        throw new ErrorHandler(400, 'Invalid email type');
    }

    // Render the template
    const htmlContent = await ejs.renderFile(TEMPLATES[type], options);
    const subject = EMAIL_DETAILS[type].subject;
    const text = typeof EMAIL_DETAILS[type].text === 'function'
        ? EMAIL_DETAILS[type].text(options.content || '')
        : EMAIL_DETAILS[type].text;
    const msg = {
        "From": "donotreply@yonkomktp.com",
        "To": recipientEmail,
        "Subject": subject,
        "TextBody": text,
        "HtmlBody": htmlContent,
    };

    try {
        await client.sendEmail(msg);
    } catch (err) {
        throw new ErrorHandler(500, 'Failed to send email');
    }
};

// Specific functions to send different types of emails
const sendAccountSetupEmail = async (recipientEmail, otp) => {
    await sendEmail('accountSetup', recipientEmail, {
        title: 'Account Setup',
        description: 'Please enter the OTP code below:',
        content: otp,
    });
};

const sendWelcomeEmail = async (recipientEmail) => {
    await sendEmail('welcome', recipientEmail, {
        title: 'Welcome to Yonko!',
        description: 'Thank you for joining us!',
        content: '',
    });
};

const sendOrderConfirmationEmail = async (recipientEmail, orderDetails) => {
    await sendEmail('order', recipientEmail, {
        userName: orderDetails.userName,
        orderItems: orderDetails.orderItems,
        totalAmount: orderDetails.totalAmount,
        deliveryAddress: orderDetails.deliveryAddress,
        deliveryDate: orderDetails.deliveryDate,
    });
};

const sendNewOrderEmail = async (recipientEmail, orderDetails) => {
    await sendEmail('shopOrder', recipientEmail, {
        shopName: orderDetails.shopName,
        orderItems: orderDetails.orderItems,
        totalAmount: orderDetails.totalAmount,
        deliveryAddress: orderDetails.deliveryAddress,
        deliveryDate: orderDetails.deliveryDate,
    });
}

module.exports = {
    sendAccountSetupEmail,
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendNewOrderEmail
};
