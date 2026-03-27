require("dotenv").config();
const axios = require("axios");
const config = require("./config");
const { getEmbedding } = require("./services/embeddingService");

// Sample products for seeding
const products = [
  {
    id: "1",
    name: "Black Shirt",
    description: "Black cotton formal shirt",
    category: "shirt",
    color: "black",
    pattern: "solid",
    price: 999,
    rating: 4.5
  },
  {
    id: "2",
    name: "White Pattern Shirt",
    description: "White printed casual shirt",
    category: "shirt",
    color: "white",
    pattern: "printed",
    price: 1099,
    rating: 4.2
  }
];

/**
 * Upload products to Azure AI Search with auto-generated embeddings
 */
async function uploadProducts() {
  console.log(`📦 Starting upload of ${products.length} products...\n`);

  for (const product of products) {
    try {
      // Create text for embedding (combine all searchable fields)
      const text = `${product.name} ${product.description} ${product.category} ${product.color} ${product.pattern}`;

      // 🔥 Generate embedding
      console.log(`⏳ Generating embedding for: ${product.name}`);
      const embedding = await getEmbedding(text);

      // Prepare document for Azure AI Search
      const doc = {
        "@search.action": "upload",
        ...product,
        embedding: embedding
      };

      // Upload to Azure AI Search
      await axios.post(
        `${config.search.endpoint}/indexes/${config.search.indexName}/docs/index?api-version=${config.search.apiVersion}`,
        { value: [doc] },
        {
          headers: {
            "api-key": config.search.apiKey,
            "Content-Type": "application/json"
          }
        }
      );

      console.log(`✅ Uploaded: ${product.name}\n`);
    } catch (error) {
      console.error(`❌ Failed to upload ${product.name}:`, error.response?.data || error.message);
    }
  }

  console.log("\n🎉 Upload complete!");
  console.log(`   Index: ${config.search.indexName}`);
  console.log(`   Endpoint: ${config.search.endpoint}`);
}

// Run the upload
uploadProducts().catch(console.error);
