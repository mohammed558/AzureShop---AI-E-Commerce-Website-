const config = {
  openai: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || "https://starkopenai.openai.azure.com",
    deployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || "embeddingmodel",
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    apiVersion: "2023-05-15"  // Correct API version for your setup
  },
  search: {
    endpoint: process.env.AZURE_SEARCH_ENDPOINT || "https://starkaisearch.search.windows.net",
    apiKey: process.env.AZURE_SEARCH_API_KEY,
    indexName: process.env.AZURE_SEARCH_INDEX_NAME || "products-index",
    apiVersion: "2023-11-01"
  }
};

// Construct OpenAI embeddings URL
config.openai.embeddingsUrl = `${config.openai.endpoint}/openai/deployments/${config.openai.deployment}/embeddings?api-version=${config.openai.apiVersion}`;

module.exports = config;
