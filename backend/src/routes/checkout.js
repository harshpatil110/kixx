const express = require('express');
const router = express.Router();
const { applyPromo } = require('../controllers/checkoutController');

router.post('/apply-promo', applyPromo);

module.exports = router;
