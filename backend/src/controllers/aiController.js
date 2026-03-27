const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.analyzeOutfit = async (req, res) => {
    try {
        const { image } = req.body;

        // ── 1. Presence check ────────────────────────────────────────────────
        if (!image) {
            return res.status(400).json({ success: false, message: 'Image data is required.' });
        }

        // ── 2. Strict Data URI parse ─────────────────────────────────────────
        // Gemini requires the raw base64 string and an explicit MIME type.
        // A Data URI looks like: data:<mimeType>;base64,<data>
        const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image format. Expected a Base64 Data URI (e.g. data:image/jpeg;base64,...).',
            });
        }

        const mimeType = matches[1];   // e.g. "image/jpeg"
        const base64Data = matches[2]; // raw base64 string, no prefix

        // ── 3. API key guard ─────────────────────────────────────────────────
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set in environment variables.');
            return res.status(500).json({ success: false, message: 'Server configuration error: missing API key.' });
        }

        // ── 4. Build Gemini client + model ───────────────────────────────────
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // ── 5. Construct the exact inlineData payload Gemini expects ─────────
        const imageData = {
            inlineData: {
                data: base64Data,
                mimeType,          // must match the actual image type
            },
        };

        const prompt =
            'You are an expert fashion stylist. Analyze this outfit and provide ' +
            '3 bullet points of constructive feedback and a rating out of 10.';

        // ── 6. Call Gemini ───────────────────────────────────────────────────
        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const textResponse = response.text();

        return res.json({ success: true, analysis: textResponse });

    } catch (error) {
        // Surface the real error message so the frontend (and logs) are useful
        const geminiMessage =
            error?.message ||
            error?.errorDetails?.[0]?.reason ||
            'Unknown Gemini error';

        console.error('Gemini API error:', geminiMessage, error);

        // Pass specific HTTP status through when Gemini provides one
        const status = error?.status || 500;

        return res.status(status).json({
            success: false,
            message: `Failed to analyze outfit: ${geminiMessage}`,
        });
    }
};
