const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { saveToCollection, getCollection, updateProfile } = require('../controllers/userController');
const { db } = require('../db/index');
const { users } = require('../db/schema');
const { sql } = require('drizzle-orm');

router.get('/count', async (req, res) => {
    try {
        const [result] = await db.select({ count: sql`count(*)` }).from(users);
        return res.status(200).json({ count: parseInt(result.count, 10) });
    } catch (err) {
        return res.status(500).json({ error: true });
    }
});

// All user routes require a valid Firebase token
router.use(verifyToken);

// Personal Sneaker Archive
router.post('/collection/save', saveToCollection);
router.get('/collection', getCollection);

// Profile Settings
router.put('/profile', updateProfile);


module.exports = router;
