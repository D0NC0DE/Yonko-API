// import packages
const express = require('express');

// initialize packages
const router = express.Router();

// Controllers
const shopsController = require('../../../controllers/shop/shops/shops');


// Routes
//GET /shops/
router.get('/', shopsController.getShops);
router.get('/:shopId', shopsController.getShop);


module.exports = router;