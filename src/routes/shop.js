// import packages
const express = require('express');

// initialize packages
const router = express.Router();

// Controllers
const productController = require('../controllers/product');

// Routes
//GET /shop/products
router.get('/products', productController.getProducts);

module.exports = router;