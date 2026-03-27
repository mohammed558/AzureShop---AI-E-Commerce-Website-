const axios = require('axios');

/**
 * Analyze image using Azure Vision API and extract tags/description
 * to use as a search query for finding similar products.
 * @param {Buffer} imageBuffer - Raw image data
 */
async function analyzeImage(imageBuffer) {
  const url = `${process.env.AZURE_VISION_ENDPOINT}/vision/v3.2/analyze?visualFeatures=Tags,Description,Objects`;

  const response = await axios.post(url, imageBuffer, {
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_VISION_KEY,
      'Content-Type': 'application/octet-stream',
    },
  });

  const data = response.data;

  // 1. Get description (usually the most specific)
  const description = data.description?.captions?.[0]?.text || '';
  
  // 2. Get high-confidence tags
  const tags = data.tags
    .filter(t => t.confidence > 0.85) // Higher threshold
    .map(t => t.name)
    .slice(0, 3)
    .join(' ');

  // 3. Construct a combined query that works best for Vector Search
  const query = `${description} ${tags}`.trim();

  console.log(`👁️ Vision Analysis: "${query}"`);

  return { tags, description, query };
}

module.exports = { analyzeImage };
