const express = require('express');
const productService = require('../services/productService');

const router = express.Router();

// POST /api/recommendations
// Body: { userId: "user123", interestProductId: "..." }
router.post('/', async (req, res, next) => {
  try {
    const { userId = 'guest', interestProductId } = req.body;

    let recommendations = [];

    if (interestProductId) {
      // 1. Get similar products based on a specific interest (Vector Similarity)
      recommendations = await productService.getSimilarProducts(interestProductId, 6);
    } else {
      // 2. Fallback: Get top rated products (Smart default)
      recommendations = await productService.getRecommendedProducts(6);
    }

    res.json(recommendations);
  } catch (err) {
    console.error("Recommendation error:", err);
    next(err);
  }
});

// POST /api/recommendations/reward (Legacy/Keep for compatibility)
router.post('/reward', async (req, res, next) => {
  res.json({ success: true, message: 'Reward acknowledged (stub)' });
});

module.exports = router;
