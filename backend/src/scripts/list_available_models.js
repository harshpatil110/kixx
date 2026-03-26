require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function debugModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await axios.get(url);
        const models = response.data.models || [];
        const result = models.map(m => m.name.replace('models/', ''));
        fs.writeFileSync('available_names.json', JSON.stringify(result, null, 2));
        console.log(`Found ${result.length} models.`);
    } catch (err) {
        console.error('Error listing models:', err.response?.data || err.message);
    }
}

debugModels();
