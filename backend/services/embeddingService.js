const axios = require("axios");
const config = require("../config");

/**
 * Generate embeddings for text using Azure OpenAI REST API
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - Vector embedding array (1536 dimensions)
 */
async function getEmbedding(text, retries = 3, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.post(
        config.openai.embeddingsUrl,
        { input: text },
        {
          headers: {
            "api-key": config.openai.apiKey,
            "Content-Type": "application/json"
          },
          timeout: 30000 // 30 second timeout
        }
      );

      return response.data.data[0].embedding;
    } catch (error) {
      const isRateLimit = error.response?.status === 429;
      const isConnectionReset = error.code === 'ECONNRESET';
      const isTimeout = error.code === 'ECONNABORTED';
      
      if ((isRateLimit || isConnectionReset || isTimeout) && i < retries) {
        console.warn(`⚠️ Embedding ${isRateLimit ? 'Rate Limited' : (isTimeout ? 'Timeout' : 'Connection Reset')}. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      console.error("Embedding Error:", error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = { getEmbedding };
