const { PrismaClient } = require('@prisma/client');
const { SearchClient, AzureKeyCredential } = require("@azure/search-documents");
const { getEmbedding } = require("./embeddingService");

const prisma = new PrismaClient();

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_ENDPOINT,
  process.env.AZURE_SEARCH_INDEX_NAME,
  new AzureKeyCredential(process.env.AZURE_SEARCH_API_KEY)
);

/**
 * ProductService - Orchestrates PostgreSQL (Prisma) and Azure AI Search
 */
class ProductService {
  
  /**
   * Create a new product and sync to Azure AI Search
   */
  async createProduct(data) {
    try {
      // 1. Save to PostgreSQL (Source of Truth)
      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          color: data.color || 'N/A',
          pattern: data.pattern || 'N/A',
          price: parseFloat(data.price),
          rating: parseFloat(data.rating || 0),
          stock: parseInt(data.stock || 0),
          image: data.image
        }
      });

      // 2. Generate Search Document (including vector embedding)
      const embeddingText = `${product.name} ${product.description} ${product.category} ${product.color} ${product.pattern}`;
      const embedding = await getEmbedding(embeddingText);

      // 3. Upload to Azure AI Search
      await searchClient.uploadDocuments([{
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        color: product.color,
        pattern: product.pattern,
        price: product.price,
        rating: product.rating,
        image: product.image, // Ensure this field exists in your Azure Index!
        embedding: embedding
      }]);

      console.log(`✅ Product created and synced: ${product.name}`);
      return product;
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error;
    }
  }

  /**
   * Search products using a 3-tier strategy (similar to Amazon/Flipkart):
   * Tier 1: Full-text keyword match on name + description (most relevant)
   * Tier 2: Semantic + Vector reranking for intelligent matching
   * Tier 3: Prisma DB ILIKE fallback for robustness
   */
  async searchProducts(query, filters = {}) {
    try {
      const isBroadSearch = !query || query === '*';
      
      // For broad searches (home page), use DB directly for performance
      if (isBroadSearch) {
        const filterStr = this._buildFilter(filters);
        const searchOptions = {
          filter: filterStr || undefined,
          select: ['id', 'name', 'description', 'price', 'category', 'color', 'pattern', 'rating', 'image'],
          top: filters.limit || 100,
        };
        const response = await searchClient.search('*', searchOptions);
        const results = [];
        for await (const item of response.results) {
          const doc = item.document;
          doc.imageUrl = doc.image;
          doc.score = item.score;
          results.push(doc);
        }
        return results;
      }

      // --- TIER 1 + 2: Hybrid Full-Text + Vector Search ---
      // Generate vector embedding for semantic similarity
      let vector = null;
      try {
        vector = await getEmbedding(query);
      } catch (e) {
        console.warn('Embedding failed, falling back to keyword-only search:', e.message);
      }

      const filterStr = this._buildFilter(filters);
      const searchOptions = {
        // Use "simple" query type for keyword matching
        queryType: 'simple',
        filter: filterStr || undefined,
        select: ['id', 'name', 'description', 'price', 'category', 'color', 'pattern', 'rating', 'image'],
        top: filters.limit || 20,
        searchFields: ['name', 'description', 'category'],
      };

      // SOFT FILTERING: Add color/pattern to the search query itself instead of hard OData filter
      // This allows for "best match" behavior (Amazon-style) instead of "0 results"
      let enhancedQuery = query;
      if (filters.color && filters.color.toLowerCase() !== 'n/a') {
        enhancedQuery = `${filters.color} ${enhancedQuery}`;
      }
      if (filters.pattern && filters.pattern.toLowerCase() !== 'n/a') {
        enhancedQuery = `${filters.pattern} ${enhancedQuery}`;
      }

      // Add vector search if embedding succeeded
      if (vector) {
        searchOptions.vectorSearchOptions = {
          queries: [{
            kind: 'vector',
            vector,
            kNearestNeighborsCount: filters.limit || 20,
            fields: ['embedding']
          }]
        };
      }

      const response = await searchClient.search(enhancedQuery, searchOptions);
      const results = [];
      for await (const item of response.results) {
        const doc = item.document;
        doc.imageUrl = doc.image;
        doc.score = item.score;
        // For image search only: apply a soft similarity threshold
        if (filters.isImageSearch && item.score < 0.02) continue;
        results.push(doc);
      }

      // --- TIER 3: Prisma DB Fallback ---
      // If Azure Search returns nothing, fall back to a simple DB keyword match
      if (results.length === 0) {
        console.log(`⚠️ Azure Search returned 0 results for "${query}". Falling back to DB search.`);
        return this._dbKeywordSearch(query, filters);
      }

      return results;
    } catch (error) {
      console.error('Search error:', error);
      // On any error, fall back to DB
      return this._dbKeywordSearch(query, filters);
    }
  }

  /**
   * Delete all documents from the Azure Search Index to prevent "Index Pollution"
   */
  async clearSearchIndex() {
    try {
      console.log('🧹 Clearing Azure Search Index...');
      // 1. Get all document IDs (up to 1000 for safety, typical for this scale)
      const response = await searchClient.search('*', { select: ['id'], top: 1000 });
      const idsToDelete = [];
      for await (const item of response.results) {
        idsToDelete.push({ id: item.document.id });
      }

      if (idsToDelete.length > 0) {
        await searchClient.deleteDocuments(idsToDelete);
        console.log(`✅ Deleted ${idsToDelete.length} documents from index.`);
      } else {
        console.log('Index already empty.');
      }
    } catch (error) {
      console.error('Error clearing index:', error);
      // Don't throw, just log so sync can continue even if clear fails
    }
  }

  /** Build OData filter string from filters object */
  _buildFilter(filters) {
    const parts = [];
    if (filters.category) parts.push(`category eq '${filters.category}'`);
    // NOTE: Color and Pattern are now handled as "Soft Matches" in the query string
    // to prevent 0 results when an exact match isn't found.
    return parts.join(' and ');
  }

  /** Tier 3: Prisma DB keyword fallback using ILIKE */
  async _dbKeywordSearch(query, filters = {}) {
    try {
      const where = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      };
      if (filters.category) {
        where.category = { equals: filters.category, mode: 'insensitive' };
        delete where.OR; // Strict category match overrides keyword search
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ];
      }
      const products = await prisma.product.findMany({
        where,
        orderBy: { rating: 'desc' },
        take: filters.limit || 20
      });
      return products.map(p => ({ ...p, imageUrl: p.image, score: 0 }));
    } catch (err) {
      console.error('DB fallback error:', err);
      return [];
    }
  }

  /**
   * Get product detail from PostgreSQL
   */
  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (product) {
      product.imageUrl = product.image;
    }
    
    return product;
  }

  /**
   * Vector-based recommendation: Find products similar to the given ID
   */
  async getSimilarProducts(productId, limit = 4) {
    try {
      // 1. Get the source product to use its features for similarity
      const product = await this.getProductById(productId);
      if (!product) return [];

      // 2. Search using the same text-based logic we use for creation
      const embeddingText = `${product.name} ${product.description} ${product.category}`;
      const vector = await getEmbedding(embeddingText);

      // 3. Find neighbors in Azure AI Search (excluding the product itself)
      const searchOptions = {
        filter: `id ne '${productId}'`,
        select: ['id', 'name', 'description', 'price', 'category', 'color', 'pattern', 'rating', 'image'],
        top: limit,
        vectorSearchOptions: {
          queries: [{
            kind: "vector",
            vector: vector,
            kNearestNeighborsCount: limit + 2,
            fields: ["embedding"]
          }]
        }
      };

      const response = await searchClient.search('*', searchOptions);
      const results = [];
      for await (const item of response.results) {
        const doc = item.document;
        doc.imageUrl = doc.image;
        results.push(doc);
      }
      return results;
    } catch (error) {
      console.error('Error in getSimilarProducts:', error);
      return [];
    }
  }

  /**
   * Get Recommended Products (General fall-back)
   */
  async getRecommendedProducts(limit = 6) {
    const products = await prisma.product.findMany({
      orderBy: { rating: 'desc' },
      take: limit
    });
    return products.map(p => ({ ...p, imageUrl: p.image }));
  }

  /**
   * Initial Sync: Push all DB products to Azure Search
   */
  async syncAllToAzure() {
    // 1. Clear existing index to prevent "Index Pollution" (duplicates)
    await this.clearSearchIndex();

    const products = await prisma.product.findMany();
    console.log(`🚀 Syncing ${products.length} products to Azure...`);
    
    for (const product of products) {
      const embeddingText = `${product.name} ${product.description} ${product.category} ${product.color} ${product.pattern}`;
      const embedding = await getEmbedding(embeddingText);
      
      await searchClient.mergeOrUploadDocuments([{
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        color: product.color,
        pattern: product.pattern,
        price: product.price,
        rating: product.rating,
        image: product.image,
        embedding: embedding
      }]);
    }
    console.log('✅ Sync complete');
  }
}

module.exports = new ProductService();
