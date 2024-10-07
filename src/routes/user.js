// import packages
const express = require('express');

// initialize packages
const router = express.Router();

const { emailValidationRules, passwordValidationRules, stringValidationRules } = require('../validations/validators');

// Controllers
const registerUserController = require('../controllers/user/auth/register');
const updateProfile = require('../controllers/user/management/updateProfile');
const loginController = require('../controllers/user/auth/login');

// Middleware
const userAuth = require('../middleware/userAuth');

// Routes
//POST /user/
router.post('/register', emailValidationRules(), registerUserController.postRegisterUser);
router.post('/verifyOTP', emailValidationRules(), stringValidationRules('otp'), registerUserController.postVerifyOTP);
router.post('/resendOTP', emailValidationRules(), registerUserController.postResendOTP);
router.post('/setPassword', userAuth, passwordValidationRules(), registerUserController.postSetPassword);
router.post('/updateProfile',userAuth, updateProfile);
router.post('/login', emailValidationRules(), loginController.postLogin);

module.exports = router;