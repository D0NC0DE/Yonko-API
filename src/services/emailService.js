const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const path = require('path');
const postmark = require("postmark");

const config = require('../config/config');
const rootDir = require('../utils/path');

const client = new postmark.ServerClient(config.POSTMARK_API_KEY);

const templatePath = path.join(rootDir, 'static', 'template.ejs');

// TODO: Refactor this function to accomade different email types
const sendEmail = async (type, recipientEmail, OTP = null) => {
    let htmlContent, subject, text;

    switch (type) {
        case 'accountSetup':
            htmlContent = await ejs.renderFile(templatePath, {
                title: 'Account Setup',
                description: 'Please enter the OTP code sent to your email below to complete your account setup:',
                content: OTP, // Pass the OTP code to the template
            });
            subject = 'Account Setup';
            text = `Please enter the OTP code - ${OTP} to complete your account setup.`;
            break;

        case 'welcome':
            htmlContent = await ejs.renderFile(templatePath, {
                title: 'Welcome to Yonko!',
                description: 'Thank you for signing up with Yonko. We are excited to have you on board!',
                content: '', // No OTP or special content for welcome email
            });
            subject = 'Welcome to Yonko!';
            text = 'Thank you for signing up with Yonko. We are excited to have you on board!';
            break;

        default:
            throw new ErrorHandler(400, 'Invalid email type');
    }

    const msg = {
        "From": "donotreply@yonkomktp.com",
        "To": recipientEmail, // Recipient's email
        "Subject": subject,
        "TextBody": text, // Plain text version of the email
        "HtmlBody": htmlContent, // HTML version of the email
    };

    try {
        await client.sendEmail(msg);
    } catch (err) {
        throw new ErrorHandler(500, 'Failed to send email');
    }
};

// Specific function to send Account Setup Email with OTP
const sendAccountSetupEmail = async (recipientEmail, otp) => {
    await sendEmail('accountSetup', recipientEmail, otp);
};

// Specific function to send Welcome Email
const sendWelcomeEmail = async (recipientEmail) => {
    await sendEmail('welcome', recipientEmail);
};

module.exports = {
    sendAccountSetupEmail,
    sendWelcomeEmail,
};

