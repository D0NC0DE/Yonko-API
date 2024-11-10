// import packages
const express = require('express');

// initialize packages
const router = express.Router();

// Controllers
const cartController = require('../../../controllers/product/cart');

// Middleware
const userAuth = require('../../../middleware/userAuth');

// Routes
//POST /cart/
router.post('/addToCart', userAuth, cartController.addToCart);
router.post('/removeFromCart', userAuth, cartController.removeFromCart);
router.post('/reduceQuantity', userAuth, cartController.reduceQuantity);
router.post('/clearCart', userAuth, cartController.clearCart);
router.get('/', userAuth, cartController.getCart);


module.exports = router;