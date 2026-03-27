const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/analyze-outfit', aiController.analyzeOutfit);

module.exports = router;
