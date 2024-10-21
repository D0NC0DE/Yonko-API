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
//POST /
router.post('/subscription', shopAuth, emailValidationRules(), packageValidationRules(),  subscriptionController.initSubscription);

// GET /
router.get('/verifySubscription', subscriptionController.verifySubscription);

module.exports = router;