// import packages
const express = require('express');

// initialize packages
const router = express.Router();

const { emailValidationRules, passwordValidationRules, stringValidationRules } = require('../validations/validators');

// Controllers
const productController = require('../controllers/product/product');

// Middleware
const shopAuth = require('../middleware/shopAuth');
const checkShopStatus = require('../validations/checkShopStatus');

// Routes
//POST /product/
router.post('/createProduct', shopAuth, checkShopStatus, productController.createProduct);
router.post('/addProduct', shopAuth, checkShopStatus, productController.addProduct);
router.post('/updateProduct', shopAuth, checkShopStatus, productController.updateProduct);
router.post('/removeProduct', shopAuth, checkShopStatus, productController.removeProduct);
router.post('/deleteProduct', shopAuth, checkShopStatus, productController.deleteProduct);

module.exports = router;