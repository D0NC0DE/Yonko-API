// import packages
const express = require('express');

// initialize packages
const router = express.Router();

// Controllers
const s3Controller = require('../../../controllers/s3/upload');

// Middleware
const shopAuth = require('../../../middleware/shopAuth');

// Routes
//POST /s3/
router.post('/upload', shopAuth, s3Controller.upload);
router.post('/updateLogo', shopAuth, s3Controller.updateLogo);

module.exports = router;