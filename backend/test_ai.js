require('dotenv').config();
const axios = require('axios');

async function test() {
    try {
        const payload = {
            models: [
                "stepfun/step-3.5-flash:free",
                "google/gemini-2.0-flash-lite-preview-02-05:free"
            ],
            messages: [{ role: 'user', content: 'test' }]
        };

        const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
            headers: {
                "Authorization": `Bearer ${process.env.AI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("Error:", e.response ? JSON.stringify(e.response.data, null, 2) : e.message);
    }
}
test();
