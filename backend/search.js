const axios = require("axios");
const config = require("./config");
const { getEmbedding } = require("./services/embeddingService");

/**
 * Search products using hybrid search (vector + semantic + filters)
 * @param {string} query - User's search query
 * @param {Object} options - Search options
 * @param {string} options.color - Filter by color
 * @param {string} options.category - Filter by category
 * @param {number} options.top - Number of results to return
 */
async function searchProducts(query, options = {}) {
  try {
    console.log(`🔍 Searching for: "${query}"`);

    // 🔥 Generate query embedding
    const embedding = await getEmbedding(query);

    // Build filter string
    let filterParts = [];
    if (options.color) filterParts.push(`color eq '${options.color}'`);
    if (options.category) filterParts.push(`category eq '${options.category}'`);
    
    const filter = filterParts.length > 0 ? filterParts.join(' and ') : undefined;

    // Perform hybrid search
    const response = await axios.post(
      `${config.search.endpoint}/indexes/${config.search.indexName}/docs/search?api-version=${config.search.apiVersion}`,
      {
        search: query,
        semanticConfiguration: "mysemantic",
        queryType: "semantic",
        vectorQueries: [
          {
            kind: "vector",
            vector: embedding,
            k: options.top || 10,
            fields: "embedding"
          }
        ],
        filter: filter,
        top: options.top || 10,
        select: "id,name,description,category,color,pattern,price,rating"
      },
      {
        headers: {
          "api-key": config.search.apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`✅ Found ${response.data.value.length} results\n`);
    return response.data.value;

  } catch (error) {
    console.error("Search Error:", error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    console.log("=== Testing Hybrid Search ===\n");

    // Test 1: Simple search
    console.log("Test 1: Searching for 'black shirt'");
    const results1 = await searchProducts("black shirt");
    console.log("Results:", results1.map(r => `${r.name} (${r.color})`));
    console.log();

    // Test 2: Search with color filter
    console.log("Test 2: Searching for 'shirt' with color=white");
    const results2 = await searchProducts("shirt", { color: "white" });
    console.log("Results:", results2.map(r => `${r.name} (${r.color})`));
    console.log();

    // Test 3: Search with category filter
    console.log("Test 3: Searching for 'formal wear' with category=shirt");
    const results3 = await searchProducts("formal wear", { category: "shirt" });
    console.log("Results:", results3.map(r => `${r.name} (${r.category})`));

  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { searchProducts };
