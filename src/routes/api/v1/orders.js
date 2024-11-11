const express = require('express');

const router = express.Router();

const orderController = require('../../../controllers/product/order');
const orderPayment = require('../../../controllers/payment/orderPayment');

const userAuth = require('../../../middleware/userAuth');

// Routes
//POST /orders/
router.post('/from-cart', userAuth, orderController.createOrder);
router.post('/direct', userAuth, orderController.directOrder);
router.post('/:orderId/checkout', userAuth, orderController.checkout);

router.post('/:orderId/pay', userAuth, orderPayment.initPurchase);
router.post('/:orderId/verify-payment', userAuth, orderPayment.verifyPurchasePayment);
// router.get('/shop', shopAuth, cartController.getCart);
// router.get('/user', userAuth, cartController.getCart);


module.exports = router;