const express = require('express');
const userRoutes = require('./api/v1/user');
const shopRoutes = require('./api/v1/shop');
const shopsRoutes = require('./api/v1/shops');
const productRoutes = require('./api/v1/product');
const productsRoutes = require('./api/v1/products');
const cartRoutes = require('./api/v1/cart');
const orderRoutes = require('./api/v1/orders');
const subscriptionRoutes = require('./api/v1/subscription');
const s3Routes = require('./api/v1/s3');

const router = express.Router();

router.use('/user', userRoutes);
router.use('/shop', shopRoutes);
router.use('/shops', shopsRoutes);
router.use('/product', productRoutes);
router.use('/', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/', subscriptionRoutes);
router.use('/s3', s3Routes);

module.exports = router;