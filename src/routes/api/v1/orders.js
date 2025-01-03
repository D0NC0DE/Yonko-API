const express = require('express');

const router = express.Router();

const orderController = require('../../../controllers/product/order');
const orderPayment = require('../../../controllers/payment/orderPayment');

const userAuth = require('../../../middleware/userAuth');
const shopAuth = require('../../../middleware/shopAuth');

// Routes
//POST /orders/
router.post('/from-cart', userAuth, orderController.createOrder);
router.post('/direct', userAuth, orderController.directOrder);
router.post('/:orderId/checkout', userAuth, orderController.checkout);

router.post('/:orderId/pay', userAuth, orderPayment.initPurchase);
router.post('/:orderId/verify-payment', userAuth, orderPayment.verifyPurchasePayment);
router.get('/shop', shopAuth, orderController.getShopOrders);
router.get('/user', userAuth, orderController.getOrders);


module.exports = router;