exports.analyzeOutfit = async (req, res) => {
    try {
        const { image } = req.body;

        // ── 1. Presence check ────────────────────────────────────────────────
        if (!image) {
            return res.status(400).json({ success: false, message: 'Image data is required.' });
        }

        // ── 2. API key guard (pre-flight) ────────────────────────────────────
        if (!process.env.NVIDIA_API_KEY) {
            console.error('❌ NVIDIA_API_KEY is not set. Did you restart the server after editing .env?');
            return res.status(500).json({
                success: false,
                message: 'Server misconfiguration: NVIDIA_API_KEY is missing.',
            });
        }

        // ── 3. Strict Data URI parse ─────────────────────────────────────────
        const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image format. Expected a Base64 Data URI (e.g. data:image/jpeg;base64,...).',
            });
        }

        const mimeType = matches[1];   // e.g. "image/jpeg"
        let base64Data = matches[2];   // raw base64 string

        // ── 4. Sanity-strip: ensure no leftover prefix ───────────────────────
        if (base64Data.includes('base64,')) {
            base64Data = base64Data.split('base64,').pop();
            console.warn('⚠️  base64Data still contained "base64," prefix — stripped it.');
        }

        console.log(`📸 Outfit analysis request | mimeType: ${mimeType} | base64 length: ${base64Data.length}`);

        // ── 5. Build OpenAI-compatible vision payload ────────────────────────
        const messages = [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'You are an expert fashion stylist. Analyze this outfit and provide 3 bullet points of constructive feedback and a rating out of 10.',
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:${mimeType};base64,${base64Data}`,
                        },
                    },
                ],
            },
        ];

        // ── 6. Call NVIDIA's OpenAI-compatible endpoint ──────────────────────
        const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'qwen/qwen3.5-397b-a17b',
                messages,
                max_tokens: 1024,
                temperature: 0.7,
                stream: false,
            }),
        });

        // ── 7. Handle non-2xx responses from NVIDIA ──────────────────────────
        if (!nvidiaRes.ok) {
            const errBody = await nvidiaRes.text();
            console.error(`❌ NVIDIA API error ${nvidiaRes.status}:`, errBody);

            let userMessage = 'Failed to analyze outfit. Please try again.';
            if (nvidiaRes.status === 429) userMessage = 'AI is currently busy (quota exceeded). Please wait and try again.';
            if (nvidiaRes.status === 401) userMessage = 'Invalid NVIDIA API key. Please check your configuration.';
            if (nvidiaRes.status === 400) userMessage = 'The image could not be processed. Try a clearer photo.';

            return res.status(nvidiaRes.status).json({ success: false, message: userMessage });
        }

        // ── 8. Parse and return the result ───────────────────────────────────
        const data = await nvidiaRes.json();
        const textResponse = data?.choices?.[0]?.message?.content;

        if (!textResponse) {
            console.error('❌ Unexpected NVIDIA response shape:', JSON.stringify(data));
            return res.status(502).json({ success: false, message: 'Received an unexpected response from the AI. Please try again.' });
        }

        return res.json({ success: true, analysis: textResponse });

    } catch (error) {
        console.error('❌ OUTFIT ANALYSIS CRASH:', error.message);
        if (error.cause)  console.error('🔍 UNDERLYING CAUSE:', error.cause);

        const isNetworkError = error.message?.includes('fetch failed');
        return res.status(500).json({
            success: false,
            message: isNetworkError
                ? 'Network error reaching the AI service. Check your server\'s internet connection.'
                : 'Failed to analyze outfit. Please try again.',
        });
    }
};
