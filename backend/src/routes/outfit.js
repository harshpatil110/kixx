const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db } = require('../db/index');
const { products } = require('../db/schema');
const { eq, or, ilike } = require('drizzle-orm');

// ── Multer: in-memory storage (no disk writes) ───────────────────────────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, WEBP, and GIF images are supported.'));
        }
    },
});

// ── Gemini Client ────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/outfit/analyze
 * Analyzes an outfit image with Gemini Vision and returns:
 *  - style, rating, feedback, suggestions, tags, colorPalette, occasion
 *  - matchedProducts: up to 6 products from the DB whose tags match
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: true, message: 'No image uploaded. Please attach a photo.' });
    }

    try {
        // 1. Prepare the image for Gemini (base64 inline data)
        const imageData = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype,
            },
        };

        // 2. Structured prompt — instruct Gemini to return clean JSON only
        const prompt = `You are a professional fashion stylist and AI outfit analyzer. 
Analyze the outfit visible in this image carefully and respond ONLY with a valid JSON object (no markdown, no code block, no extra text) using this exact structure:

{
  "style": "<one short label like 'Streetwear', 'Casual Chic', 'Athleisure', 'Smart Casual', 'Formal', 'Bohemian', 'Minimalist'>",
  "rating": <integer 1-10>,
  "feedback": "<2-3 sentence overall assessment of the outfit's coordination, fit and aesthetic>",
  "suggestions": [
    "<specific, actionable improvement #1>",
    "<specific improvement #2>",
    "<specific improvement #3>"
  ],
  "colorPalette": ["<dominant color 1>", "<dominant color 2>", "<accent color>"],
  "occasion": "<best occasion for this outfit e.g. 'Weekend Casual', 'Office', 'Party', 'Gym', 'Date Night'>",
  "tags": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"]
}

Requirements:
- tags must be footwear-relevant keywords that match sneaker categories (e.g. "casual", "streetwear", "athletic", "retro", "luxury", "running", "basketball", "formal", "lifestyle")
- rating must be an honest integer between 1 and 10
- Do not include any explanation outside the JSON object`;

        // 3. Call Gemini Model (using gemini-2.0-flash for better quota stability)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const rawText = response.text().trim();

        // 4. Parse the structured JSON from Gemini
        let analysis;
        try {
            // Strip markdown code fences if Gemini added them despite instructions
            const cleaned = rawText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
            analysis = JSON.parse(cleaned);
        } catch (parseErr) {
            console.error('Gemini response could not be parsed as JSON:', rawText);
            return res.status(502).json({
                error: true,
                message: 'AI response was not in the expected format. Please try again.',
                rawResponse: rawText,
            });
        }

        // 5. Match products from the catalog using the extracted tags
        const { tags = [], colorPalette = [] } = analysis;

        // Fetch all products and filter in JS (simple approach)
        const allProducts = await db.query.products.findMany({ with: { brand: true } });

        const scored = allProducts.map(product => {
            const productTags = (product.tags || []).map(t => t.toLowerCase());
            const productColors = (product.colorPalette || []).map(c => c.toLowerCase());
            const normalizedTags = tags.map(t => t.toLowerCase());
            const normalizedColors = colorPalette.map(c => c.toLowerCase());

            const tagMatches = productTags.filter(t => normalizedTags.includes(t)).length;
            const colorMatches = productColors.filter(c => normalizedColors.includes(c)).length;
            const score = (tagMatches * 2) + colorMatches;
            return { ...product, matchScore: score };
        });

        // Sort by match score descending, take top 6
        const matchedProducts = scored
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 6);

        // 6. Return the final response
        return res.status(200).json({
            error: false,
            analysis,
            matchedProducts,
        });

    } catch (err) {
        // Handle Gemini Quota Exceeded (429)
        if (err.status === 429 || (err.message && err.message.includes('429'))) {
            return res.status(429).json({ 
                error: true, 
                message: 'AI is currently busy (Quota Exceeded). Please wait 30 seconds and try again.' 
            });
        }
        // Handle multer file size error
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: true, message: 'Image too large. Maximum size is 5 MB.' });
        }
        console.error('Outfit analysis error:', err);
        return res.status(500).json({ error: true, message: err.message || 'Outfit analysis failed. Please try again.' });
    }
});

module.exports = router;
