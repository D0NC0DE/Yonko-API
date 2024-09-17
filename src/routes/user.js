// import packages
const express = require('express');

// initialize packages
const router = express.Router();

const { emailValidationRules, passwordValidationRules, stringValidationRules } = require('../validations/validators');

// Controllers
const userController = require('../controllers/user/register');
const userAuth = require('../middleware/userAuth');

// Routes
//POST /user/register
router.post('/register', emailValidationRules(), userController.postRegisterUser);
router.post('/verifyOTP', emailValidationRules(), stringValidationRules('otp'), userController.postVerifyOTP);
router.post('/resendOTP', emailValidationRules(), userController.postResendOTP);
router.post('/setPassword', userAuth, passwordValidationRules(), userController.postSetPassword);
// router.post('/updateProfile', userController.postForgotPassword);
// router.post('/login', userController.postLogin);

module.exports = router;