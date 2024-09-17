// import packages
const express = require('express');

// initialize packages
const router = express.Router();

const { emailValidationRules, passwordValidationRules, stringValidationRules } = require('../validations/validators');

// Controllers
const shopController = require('../controllers/shop/create');
const shopAuth = require('../middleware/shopAuth');

// Routes
//POST /shop/register
router.post('/createShop', emailValidationRules(), shopController.postCreateShop);
router.post('/verifyOTP', emailValidationRules(), stringValidationRules('otp'), shopController.postVerifyOTP);
router.post('/resendOTP', emailValidationRules(), shopController.postResendOTP);
router.post('/setPassword', shopAuth, passwordValidationRules(), shopController.postSetPassword);
// router.post('/subscription', userController.postSubscription);
// router.post('/updateProfile', userController.postForgotPassword);
// router.post('/login', userController.postLogin);

module.exports = router;