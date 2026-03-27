const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
);

/**
 * Expand user query using AI to extract product attributes
 * @param {string} query - User's search query
 * @returns {Promise<Object>} - Expanded query details with category, color, pattern, and suggestions
 */
async function expandQuery(query) {
  const prompt = `
Extract product search details from this query:

"${query}"

Return JSON ONLY (no markdown, no code blocks):
{
  "category": "",
  "parentCategory": "", // Map to: "Electronics", "Clothing", "Footwear", or "Home"
  "color": "",
  "pattern": "",
  "suggestedColors": [],
  "suggestedPatterns": []
}

Examples:
- "black shirt for wedding" → {"category": "shirt", "parentCategory": "Clothing", "color": "black", ...}
- "red running shoes" → {"category": "shoes", "parentCategory": "Footwear", "color": "red", ...}
- "blue floral dress" → {"category": "dress", "parentCategory": "Clothing", "color": "blue", ...}
- "laptops" → {"category": "laptops", "parentCategory": "Electronics", "color": "", ...}

Return only valid JSON.
`;

  const response = await client.getChatCompletions(
    process.env.AZURE_OPENAI_CHAT_DEPLOYMENT || 'gpt-4',
    [{ role: "user", content: prompt }]
  );

  try {
    const content = response.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Failed to parse query expansion:', err);
    return {
      category: "",
      color: "",
      pattern: "",
      suggestedColors: [],
      suggestedPatterns: []
    };
  }
}

module.exports = { expandQuery };
