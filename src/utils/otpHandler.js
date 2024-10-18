const crypto = require('crypto');

const OTPHandler = (length = 4, expiresInMinutes = 5) => {
    // Generate OTP of specified length
    const otp = crypto
        .randomInt(0, Math.pow(10, length))
        .toString()
        .padStart(length, '0');

    // Set expiration time (current time + expiresInMinutes)
    const now = new Date();
    const expiryTime = new Date(now.getTime() + expiresInMinutes * 60000);
    //TO:DO: Make the OTP null after the expiry time
    
    return { otp, expiryTime };
};

module.exports = OTPHandler;
