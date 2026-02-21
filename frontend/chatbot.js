// ============================================
// CHATBOT ENGINE - Litra-AI
// Asisten Pak Nandar untuk Informatika
// ============================================

const ChatbotEngine = {
    botName: "Litra-AI",
    greeting: `Halo! 👋 Saya **Litra-AI**, asisten virtualmu. Silakan tanyakan apa saja, saya bebas menjawab semua pertanyaanmu dengan sopan. 😊`,


    // Knowledge base topics (Empty to allow free AI conversation)
    topics: {},

    // Get response for user message
    getResponse(message) {
        const lowerMsg = message.toLowerCase().trim();

        // Check each topic
        for (const [topicKey, topic] of Object.entries(this.topics)) {
            for (const keyword of topic.keywords) {
                if (lowerMsg.includes(keyword)) {
                    const responses = topic.responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        }

        // Default response
        return this.getDefaultResponse(lowerMsg);
    },

    getDefaultResponse(message) {
        const defaults = [
            `Hmm, saya kurang memahami pertanyaanmu. 🤔 Bisa tolong jelaskan lebih detail? Saya siap menjawab pertanyaan apapun dengan sopan. 😊`,
            `Maaf, saya belum bisa menjawab pertanyaan itu dengan tepat. 😅 Ada hal lain yang ingin kamu tanyakan?`,
            `Pertanyaan menarik! Silakan tanyakan hal lain jika ada yang membuatmu bingung. Saya di sini untuk membantumu! 💡`
        ];

        return defaults[Math.floor(Math.random() * defaults.length)];
    },


    // Format message with markdown-like styling
    formatMessage(text) {
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Line breaks
        text = text.replace(/\n/g, '<br>');
        return text;
    },

    // Backend URL - leave blank for relative paths (same origin)
    backendUrl: '',
    useAPI: true, // Set to false to always use local engine

    // Get response from Gemini API via backend
    async getResponseFromAPI(message, username, history) {
        if (!this.useAPI) {
            return this.getResponse(message);
        }

        try {
            const response = await fetch(this.backendUrl + '/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, username, history })
            });

            const data = await response.json();

            if (data.success && data.reply) {
                return data.reply;
            }

            // If API returns fallback flag, use local engine
            if (data.fallback) {
                console.warn('Gemini API fallback, using local engine:', data.error);
                return this.getResponse(message);
            }

            // Other errors
            console.error('API Error:', data.error);
            return this.getResponse(message);

        } catch (error) {
            // Network error or backend not running - fallback to local
            console.warn('Backend unreachable, using local engine:', error.message);
            this.useAPI = false; // Disable API for this session
            return this.getResponse(message);
        }
    },

    // Check if backend is available
    async checkBackend() {
        try {
            const response = await fetch(this.backendUrl + '/api/health', {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            const data = await response.json();
            if (data.status === 'ok') {
                this.useAPI = true;
                console.log('✅ Litra-AI Backend connected | Gemini:', data.geminiConfigured ? 'Active' : 'Not configured');
                return true;
            }
        } catch (e) {
            this.useAPI = false;
            console.log('ℹ️ Backend offline — menggunakan chatbot lokal');
        }
        return false;
    }
};

// Auto-check backend on load
window.addEventListener('DOMContentLoaded', () => {
    ChatbotEngine.checkBackend();
});

