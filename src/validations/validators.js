const { body } = require('express-validator');

//TO:DO: Handle empty body rewuest

const emailValidationRules = () => {
    return [
        body('email')
            .isEmail()
            .withMessage('Please use a valid email address')
            .trim()
            .normalizeEmail(),
    ];
};

const passwordValidationRules = () => {
    return [
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .trim()
    ];
}

const stringValidationRules = (field) => {
    return [
        body(field)
            .isString()
            .withMessage('String is required!')
            .trim()
    ];
}

const packageValidationRules = () => {
    return [
        body('package')
            .isIn(['BASIC', 'PREMIUM', 'ELITE'])
            .withMessage('Invalid package type')
            .trim()
    ];
};

module.exports = {
    emailValidationRules,
    passwordValidationRules,
    stringValidationRules,
    packageValidationRules
};
