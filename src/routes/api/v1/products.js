// import packages
const express = require('express');

// initialize packages
const router = express.Router();

// Controllers
const productsController = require('../../../controllers/product/products');

// Middleware
const shopAuth = require('../../../middleware/shopAuth');

// Routes
//GET /products/
const rootRoute = '/products';
router.get('/shopProducts', shopAuth, productsController.getShopProducts);
router.get(`${rootRoute}`, productsController.getProducts);
router.get(`${rootRoute}/:productId`, productsController.getProduct);


module.exports = router;