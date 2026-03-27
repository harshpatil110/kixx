const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.analyzeOutfit = async (req, res) => {
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({ success: false, message: 'Image data is required' });
        }

        // Initialize Gemini securely with process.env
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Setup the model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        // Extract mime type and base64 parts from data URI
        let base64Data = image;
        let mimeType = 'image/jpeg'; // Default
        
        if (image.includes('data:')) {
            const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                mimeType = matches[1];
                base64Data = matches[2];
            }
        }

        const imageData = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        const prompt = 'You are an expert fashion stylist. Analyze this outfit and provide 3 bullet points of constructive feedback and a rating out of 10.';

        const result = await model.generateContent([prompt, imageData]);
        const response = await result.response;
        const textResponse = response.text();

        res.json({ success: true, analysis: textResponse });

    } catch (error) {
        console.error('Gemini error:', error);
        res.status(500).json({ success: false, message: 'Failed to analyze outfit' });
    }
};
