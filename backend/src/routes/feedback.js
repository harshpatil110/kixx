const express = require('express');
const router = express.Router();
const { submitFeedback } = require('../controllers/feedbackController');

// POST /api/feedback/submit — no auth required (guests can report issues too)
router.post('/submit', submitFeedback);

module.exports = router;
