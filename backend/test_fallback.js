require('dotenv').config();
const axios = require('axios');

async function testFallback() {
    try {
        console.log("USING KEY:", process.env.AI_API_KEY.substring(0, 10) + "...");
        const payload = {
            models: [
                "stepfun/step-3.5-flash:free",
                "google/gemini-2.0-flash-lite-preview-02-05:free"
            ],
            route: 'fallback',
            messages: [{ role: 'user', content: 'test request for fallback' }]
        };

        const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
            headers: {
                "Authorization": `Bearer ${process.env.AI_API_KEY}`,
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Litra-AI"
            }
        });
        console.log("Success output:", res.data.choices[0].message);
        console.log("Model used:", res.data.model);
    } catch (e) {
        console.error("API Error:");
        if (e.response) {
            console.error(JSON.stringify(e.response.data, null, 2));
        } else {
            console.error(e.message);
        }
    }
}
testFallback();
