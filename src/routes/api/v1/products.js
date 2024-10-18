// import packages
const express = require('express');

// initialize packages
const router = express.Router();

const { emailValidationRules, passwordValidationRules, stringValidationRules } = require('../../../validations/validators');

// Controllers
const productsController = require('../../../controllers/product/products');

// Middleware
const shopAuth = require('../../../middleware/shopAuth');

// Routes
//GET /products/
router.get('/shopProducts', shopAuth, productsController.getShopProducts);
router.get('/', productsController.getProducts);


module.exports = router;