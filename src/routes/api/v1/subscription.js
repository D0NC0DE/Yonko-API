// import packages
const express = require('express');

// initialize packages
const router = express.Router();

const { emailValidationRules, packageValidationRules } = require('../../../validations/validators');

// Controllers
const subscriptionController = require('../../../controllers/payment/subscription');

// Middleware
const shopAuth = require('../../../middleware/shopAuth');

// Routes
//POST /subscriptions
router.post('/initiate', shopAuth, emailValidationRules(), packageValidationRules(),  subscriptionController.initSubscription);

// GET /
router.get('/verify', subscriptionController.verifySubscription);

module.exports = router;