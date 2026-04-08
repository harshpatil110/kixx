const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { saveToCollection, getCollection } = require('../controllers/userController');

// All user routes require a valid Firebase token
router.use(verifyToken);

// Personal Sneaker Archive
router.post('/collection/save', saveToCollection);
router.get('/collection', getCollection);

module.exports = router;
