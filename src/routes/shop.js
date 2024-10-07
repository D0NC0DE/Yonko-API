// import packages
const express = require('express');

// initialize packages
const router = express.Router();

const { emailValidationRules, passwordValidationRules, stringValidationRules } = require('../validations/validators');

// Controllers
const createShopController = require('../controllers/shop/auth/create');
const updateProfile = require('../controllers/shop/management/updateProfile');
const loginController = require('../controllers/shop/auth/login');

// Middleware
const shopAuth = require('../middleware/shopAuth');

// Routes
//POST /shop/
router.post('/createShop', emailValidationRules(), createShopController.postCreateShop);
router.post('/verifyOTP', emailValidationRules(), stringValidationRules('otp'), createShopController.postVerifyOTP);
router.post('/resendOTP', emailValidationRules(), createShopController.postResendOTP);
router.post('/setPassword', shopAuth, passwordValidationRules(), createShopController.postSetPassword);
// router.post('/subscription', userController.postSubscription);
router.post('/updateProfile', shopAuth, updateProfile);
router.post('/login', loginController.postLogin);

module.exports = router;