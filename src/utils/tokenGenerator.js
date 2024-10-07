const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Function to generate a JWT token
const generateToken = (payload) => {
    return jwt.sign(
        payload,
        config.JWT_SECRET, // Secret from your config file
        // { expiresIn: expiresIn } // Token expiration
    );
};

module.exports = { generateToken };
