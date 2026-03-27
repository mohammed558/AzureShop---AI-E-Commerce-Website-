const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");
const { getEmbedding } = require("./embeddingService");

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY)
);

/**
 * Smart Hybrid Search - combines vector + semantic + filters
 * @param {string} query - User's search query
 * @param {Object} filters - Optional filters (category, color, etc.)
 * @param {Array} selectFields - Fields to return (default: all available fields)
 * @returns {Promise<Array>} - Search results
 */
async function smartSearch(query, filters = {}, selectFields = null) {
  // 1. Convert query → embedding
  const vector = await getEmbedding(query);

  // 2. Build filter string
  let filterStr = "";
  if (filters.category) filterStr += `category eq '${filters.category}'`;
  if (filters.color) filterStr += `${filterStr ? ' and ' : ''}color eq '${filters.color}'`;

  // Default fields that exist in your index
  const defaultSelect = [
    'id', 'name', 'description', 'price', 'category', 
    'color', 'pattern', 'rating'
  ];

  // 3. Hybrid search with vector + semantic
  const results = [];

  const response = await searchClient.search(query, {
    queryType: "semantic",
    semanticSearchOptions: {
      configurationName: "mysemantic"
    },
    vectorSearchOptions: {
      queries: [
        {
          kind: "vector",
          vector: vector,
          kNearestNeighborsCount: 10,
          fields: ["embedding"]
        }
      ]
    },
    filter: filterStr || undefined,
    select: selectFields || defaultSelect,
    top: 20
  });

  for await (const item of response.results) {
    results.push(item.document);
  }

  return results;
}

/**
 * Get all products (no query — full index scan)
 */
async function getAllProducts() {
  const results = [];

  const searchResults = await searchClient.search('*', {
    select: ['id', 'name', 'description', 'price', 'category', 'color', 'pattern', 'rating'],
    top: 50,
  });

  for await (const result of searchResults.results) {
    results.push(result.document);
  }

  return results;
}

/**
 * Get single product by ID
 */
async function getProductById(id) {
  return await searchClient.getDocument(id);
}

module.exports = { smartSearch, getAllProducts, getProductById };
