const nodemailer = require('nodemailer');
const { db } = require('../db/index');
const { products, brands } = require('../db/schema');
const { sql } = require('drizzle-orm');

// ── Nodemailer Transporter (reusable across requests) ────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ── Helper: Fetch one random product for the recommendation ──────────────────
async function getRandomRecommendation() {
    try {
        const result = await db
            .select({
                name: products.name,
                price: products.basePrice,
                imageUrl: products.imageUrl,
                id: products.id,
                brandName: brands.name,
            })
            .from(products)
            .leftJoin(brands, sql`${products.brandId} = ${brands.id}`)
            .orderBy(sql`RANDOM()`)
            .limit(1);

        return result[0] || null;
    } catch (err) {
        console.error('⚠️  Failed to fetch recommendation for email:', err.message);
        return null;
    }
}

// ── Helper: Build the premium HTML email ─────────────────────────────────────
function buildEmailHtml(analysisText, recommendation) {
    // Convert markdown-style bullet points to clean HTML paragraphs
    const formattedAnalysis = analysisText
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
            // Strip leading markdown symbols like -, *, ##
            const cleaned = line
                .replace(/^#{1,3}\s*/, '')
                .replace(/^\s*[-*]\s*/, '')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            return `<p style="margin: 0 0 12px 0; line-height: 1.7; color: #444444;">${cleaned}</p>`;
        })
        .join('');

    // Recommendation section (only if we fetched a product)
    const recommendationBlock = recommendation ? `
        <tr>
            <td style="padding: 0 40px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f4f0; border-radius: 16px; overflow: hidden;">
                    <tr>
                        <td style="padding: 32px; text-align: center;">
                            <p style="font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #800000; margin: 0 0 16px;">
                                Complete the Look
                            </p>
                            ${recommendation.imageUrl ? `
                            <img 
                                src="${recommendation.imageUrl.startsWith('/') ? (process.env.FRONTEND_URL || 'http://localhost:5173') + recommendation.imageUrl : recommendation.imageUrl}" 
                                alt="${recommendation.name}" 
                                width="200" 
                                style="display: block; margin: 0 auto 20px; max-width: 200px; height: auto;"
                            />
                            ` : ''}
                            <p style="font-size: 18px; font-weight: 800; color: #1a1a1a; margin: 0 0 4px; text-transform: uppercase; letter-spacing: -0.5px;">
                                ${recommendation.name}
                            </p>
                            ${recommendation.brandName ? `
                            <p style="font-size: 12px; color: #999; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
                                ${recommendation.brandName}
                            </p>
                            ` : ''}
                            <p style="font-size: 20px; font-weight: 800; color: #800000; margin: 0 0 20px;">
                                ₹${Number(recommendation.price).toLocaleString('en-IN')}
                            </p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/product/${recommendation.id}" 
                               style="display: inline-block; background: #1a1a1a; color: #ffffff; font-size: 12px; font-weight: 800; 
                                      text-transform: uppercase; letter-spacing: 2px; padding: 14px 32px; border-radius: 50px;
                                      text-decoration: none;">
                                Shop Now →
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    ` : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f0eded; font-family: 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0eded; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background: #1a1a1a; padding: 32px 40px; text-align: center;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff;">
                                    KIXX
                                </h1>
                                <p style="margin: 6px 0 0; font-size: 10px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.4);">
                                    Studios
                                </p>
                            </td>
                        </tr>

                        <!-- Style Verdict Label -->
                        <tr>
                            <td style="padding: 40px 40px 8px;">
                                <p style="font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #800000; margin: 0;">
                                    Your Style Verdict
                                </p>
                            </td>
                        </tr>

                        <!-- AI Analysis -->
                        <tr>
                            <td style="padding: 16px 40px 32px; font-size: 15px; color: #444444;">
                                ${formattedAnalysis}
                            </td>
                        </tr>

                        <!-- Divider -->
                        <tr>
                            <td style="padding: 0 40px;">
                                <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 32px;">
                            </td>
                        </tr>

                        <!-- Recommendation -->
                        ${recommendationBlock}

                        <!-- Footer -->
                        <tr>
                            <td style="background: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #f0f0f0;">
                                <p style="margin: 0; font-size: 11px; color: #999; letter-spacing: 0.5px;">
                                    You received this email because you used the KIXX Outfit Checker.
                                </p>
                                <p style="margin: 8px 0 0; font-size: 11px; color: #ccc;">
                                    © ${new Date().getFullYear()} KIXX Studios. All rights reserved.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

// ── Helper: Fire-and-forget email (completely isolated, never throws) ────────
async function sendStyleVerdictEmail(userEmail, analysisText) {
    try {
        console.log('5. Attempting to send style verdict email to:', userEmail);
        // ── Fail-safe: SMTP credentials check ────────────────────────────────
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — skipping CRM email.');
            return;
        }

        // ── Fetch a random product recommendation (isolated) ─────────────────
        let recommendation = null;
        try {
            recommendation = await getRandomRecommendation();
        } catch (dbErr) {
            console.error('⚠️  DB query for recommendation failed, sending email without product:', dbErr.message);
        }

        const html = buildEmailHtml(analysisText, recommendation);

        // ── Send the email (isolated) ────────────────────────────────────────
        await transporter.sendMail({
            from: `"KIXX Studios" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Your KIXX Style Verdict + A Curated Pick',
            html,
        });

        console.log(`📧 Style verdict email sent to ${userEmail}`);
    } catch (err) {
        // Fire-and-forget: never let an email failure crash the request
        console.error(`❌ Failed to send style verdict email to ${userEmail}:`, err.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Controller
// ═══════════════════════════════════════════════════════════════════════════════

exports.analyzeOutfit = async (req, res) => {
    try {
        console.log('1. Request received at /analyze-outfit');
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
        console.log('2. Sending image to Qwen AI...');
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

        // ── 7. Parse response ────────────────────────────────────────────────
        const data = await nvidiaRes.json();
        console.log('3. AI Response received successfully. Status:', nvidiaRes.status);

        // ── 8. Handle non-2xx responses from NVIDIA ──────────────────────────
        if (!nvidiaRes.ok) {
            const nvidiaErrorMsg =
                data?.detail ||
                data?.message ||
                data?.error?.message ||
                (Array.isArray(data?.detail) && data.detail.map(d => d.msg).join('; ')) ||
                JSON.stringify(data);

            console.error(`❌ NVIDIA API REJECTED (${nvidiaRes.status} ${nvidiaRes.statusText}):`);
            console.error(JSON.stringify(data, null, 2));

            let userMessage = `AI request failed: ${nvidiaErrorMsg}`;
            if (nvidiaRes.status === 429) userMessage = 'AI is currently busy (quota exceeded). Please wait and try again.';
            if (nvidiaRes.status === 401) userMessage = 'Invalid NVIDIA API key. Please check your server configuration.';

            return res.status(nvidiaRes.status).json({ success: false, message: userMessage });
        }

        // ── 9. Extract result ────────────────────────────────────────────────
        const textResponse = data?.choices?.[0]?.message?.content;

        if (!textResponse) {
            console.error('❌ Unexpected NVIDIA response shape:', JSON.stringify(data, null, 2));
            return res.status(502).json({ success: false, message: 'Received an unexpected response from the AI. Please try again.' });
        }

        // ── 10. FIRE AND FORGET: Send CRM email asynchronously ───────────────
        //    This block is completely isolated — it can NEVER crash the response.
        if (!req.user || !req.user.email) {
            console.log('ℹ️  No user email found. Skipping automated email.');
        } else {
            // Do NOT await — respond to the client immediately.
            // The outer .catch() is a safety net for any edge-case unhandled rejection.
            sendStyleVerdictEmail(req.user.email, textResponse).catch((unexpectedErr) => {
                console.error('❌ Unexpected email error (safety net caught):', unexpectedErr.message);
            });
        }

        console.log('4. Sending 200 response to frontend.');
        return res.json({ success: true, analysis: textResponse });


    } catch (error) {
        console.error('🔥 FATAL ROUTE ERROR:', error.message);
        console.error('🔥 FULL STACK:', error.stack);
        if (error.cause) console.error('🔍 UNDERLYING CAUSE:', error.cause);

        return res.status(500).json({
            success: false,
            error: 'Failed to analyze outfit',
            details: error.message || 'Unknown error',
        });
    }
};
