const express = require("express");
const multer = require("multer");
const productService = require("../services/productService");
const { analyzeImage } = require("../services/visionService");
const { expandQuery } = require("../services/queryExpansionService");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/products/search
// Body: { query: "black shirt for wedding" }
// Returns: { products, alternatives, expansion }
router.post("/search", async (req, res, next) => {
  try {
    const { query } = req.body;
    const searchTerm = (query && query.trim()) ? query.trim() : '*';

    // 1. For broad searches (Our Collection), skip expansion and return all
    if (searchTerm === '*') {
      const products = await productService.searchProducts('*', { limit: 40 });
      return res.json({ 
        products, 
        alternatives: [], 
        expansion: { label: 'Our Full Collection' } 
      });
    }

    // 2. Expand query using AI to extract attributes for specific searches
    const expansion = await expandQuery(searchTerm);

    // 2. Main hybrid search (keyword + vector)
    // parentCategory maps specific terms (e.g. "laptops" -> "Electronics")
    const activeCategory = expansion.parentCategory || "";
    
    const products = await productService.searchProducts(query.trim(), {
      category: activeCategory,
      color: expansion.color || "",
      limit: 20
    });

    // 3. Smart alternatives: only show if main results are thin (<3 items)
    //    Fetch broader matches from the same category using suggested colors
    let uniqueAlternatives = [];
    if (products.length < 3) {
      const altSets = await Promise.all(
        (expansion.suggestedColors || []).slice(0, 2).map(color =>
          productService.searchProducts(query.trim(), {
            category: activeCategory,
            color,
            limit: 5
          })
        )
      );
      const mainIds = new Set(products.map(p => p.id));
      const seen = new Set();
      for (const alt of altSets.flat()) {
        if (!mainIds.has(alt.id) && !seen.has(alt.id)) {
          seen.add(alt.id);
          uniqueAlternatives.push(alt);
        }
      }
    }

    res.json({
      products,
      alternatives: uniqueAlternatives.slice(0, 10),
      expansion
    });
  } catch (err) {
    console.error("Search error:", err);
    next(err);
  }
});

// POST /api/products/image-search
// Form-data: image file
router.post('/image-search', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });

    // Step 1: Analyze image with Azure Vision
    const { query } = await analyzeImage(req.file.buffer);

    // Step 2: Search for relevant products with strict similarity for photos
    const results = await productService.searchProducts(query, { isImageSearch: true });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    // Note: We search for '*' to get all from search index (includes embeddings)
    const products = await productService.searchProducts('*');
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    // Get detailed info from PostgreSQL (Prisma)
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products/sync
// Clears Azure Search index and re-syncs all products from DB
router.post("/sync", async (req, res, next) => {
  try {
    await productService.syncAllToAzure();
    res.json({ message: "Search index cleared and synced successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
