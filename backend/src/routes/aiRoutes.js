const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');

router.post('/analyze-outfit', verifyToken, aiController.analyzeOutfit);

module.exports = router;
