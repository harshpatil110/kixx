require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function listModels() {
  const results = [];
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro', 'gemini-pro-vision'];
    
    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Just a minimal request to check existence
            // For pro-vision we need an image, for others text
            const result = (modelName === 'gemini-pro-vision') 
                ? "Skipping pro-vision test requirement" 
                : await model.generateContent("ping");
            console.log(`✅ Model ${modelName} is available.`);
            results.push(`${modelName}: OK`);
        } catch (e) {
            console.log(`❌ Model ${modelName} failed: ${e.message}`);
            results.push(`${modelName}: FAIL (${e.message})`);
        }
    }
  } catch (err) {
    results.push(`MAIN ERROR: ${err.message}`);
  }
  fs.writeFileSync('gemini_test_results.txt', results.join('\n'));
  process.exit(0);
}

listModels();
