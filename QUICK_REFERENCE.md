# Quick Reference Guide - Azure AI Services Updates

## 🎯 What's New (March 27, 2026)

### ✅ TIER 1: Core Features Implemented

| Feature | File | Status | Details |
|---------|------|--------|---------|
| **Vector Embeddings** | `embeddingService.js` | ✅ Complete | 1536-dim vectors, retry logic, 30s timeout |
| **PostgreSQL Integration** | `prisma/schema.prisma` | ✅ Complete | Real-time DB with Prisma ORM |
| **Enhanced Chat** | `chatService.js` | ✅ Complete | GPT-4o with tool calling for product search |
| **3-Tier Search** | `productService.js` | ✅ Complete | Keyword → Vector → PostgreSQL fallback |
| **Vector Recommendations** | `productService.js::getSimilarProducts` | ✅ Complete | Semantic similarity-based suggestions |
| **Query Expansion** | `queryExpansionService.js` | ✅ Complete | AI-powered attribute extraction |
| **Image Search** | `visionService.js` + route | ✅ Complete | Vision-based product discovery |
| **DB Sync** | `productService.js::syncAllToAzure` | ✅ Complete | Keep PostgreSQL ↔ Azure Search in sync |

---

## 🔑 Key Technologies

```
Backend:
├─ Express.js (API framework)
├─ Prisma ORM (PostgreSQL)
├─ Azure OpenAI (Chat + Embeddings)
├─ Azure AI Search (Vector + Keyword search)
├─ Azure Computer Vision (Image analysis)
└─ Azure Speech (Ready for voice input)

Database:
├─ PostgreSQL 13+ (Source of truth)
└─ Azure Search Index (Vector search + full-text)

Frontend: Angular (to be enhanced with UI components)
```

---

## 📍 API Endpoints

### Search
```bash
POST /api/products/search
{
  "query": "black shirt for wedding"
}
Response: { products, alternatives, expansion }
```

### Image Search
```bash
POST /api/products/image-search
Form: image file
Response: [products] sorted by visual similarity
```

### Chat
```bash
POST /api/chat/message
{
  "message": "What black shirts do you have?",
  "history": []
}
Response: { reply: "Here are the black shirts..." }
```

### Recommendations
```bash
POST /api/recommendations
{
  "userId": "user123",
  "interestProductId": "product-uuid"
}
Response: [similar products]
```

---

## 🏗️ Search Architecture (3-Tier)

```
User Query
    ↓
[TIER 1] Full-Text Keyword Search
├─ Search: name, description, category
├─ Simple query (not fuzzy)
└─ Best for exact matches
    ↓ (If good results, return them)
    ↓
[TIER 2] Semantic Vector + Hybrid
├─ Generate embedding
├─ Vector search in Azure
├─ Combine with keyword results
└─ Re-rank by semantic similarity
    ↓ (If good results, return them)
    ↓
[TIER 3] PostgreSQL ILIKE Fallback
├─ Database keyword search
├─ Category strict matching
├─ Order by rating
└─ Ensures results always found
    ↓
Final Results
```

---

## 🤖 Chat Tool System

The chat interface can automatically search for products:

```
User: "What phones are available?"
    ↓
GPT-4o: "I should search for phones"
    ↓
Calls: search_products("phones")
    ↓
Gets: [iPhone 15, Samsung S24, Pixel 8, ...]
    ↓
Formats natural response with details
```

---

## 📊 Vector Recommendations Logic

```
1. User views product: "Nike Running Shoes"
    ↓
2. Get product embedding:
   "Nike Running Shoes | High-performance athletic footwear... | Footwear"
    ↓
3. Find similar products in vector space:
   • Adidas Running Shoes (similarity: 0.92)
   • Puma Running Shoes (similarity: 0.88)
   • Running Socks (similarity: 0.75)
   • Running Insoles (similarity: 0.72)
    ↓
4. Display as "You might also like"
```

---

## 🗄️ Database Schema

```sql
Product (PostgreSQL):
├─ id (UUID) primary key
├─ name, description, price, category
├─ color, pattern
├─ rating, stock
├─ image (Unsplash URL)
├─ createdAt, updatedAt
├─ @@index([category])
└─ @@index([price])
```

---

## 🚀 Usage Examples

### Create a Product with Embedding
```javascript
const product = await productService.createProduct({
  name: "Nike Air Max",
  description: "Comfortable running shoe",
  category: "Footwear",
  color: "Black",
  pattern: "Solid",
  price: 129.99,
  rating: 4.5,
  stock: 50,
  image: "https://unsplash.com/..."
});
// Automatically:
// 1. Saves to PostgreSQL
// 2. Generates embedding
// 3. Syncs to Azure Search
```

### Search with All Features
```javascript
const results = await productService.searchProducts("black comfortable shoes", {
  category: "Footwear",
  color: "Black",
  limit: 20
});
// Returns:
// - Results from vector search + keyword search
// - Or falls back to DB if Azure fails
// - All with similarity scores
```

### Get Similar Products
```javascript
const similar = await productService.getSimilarProducts(
  "product-uuid",
  4  // return 4 similar products
);
// Returns products with highest vector similarity
// Automatically excludes the original product
```

### Chat with Product Search
```javascript
const reply = await getChatReply(
  "What laptops do you have?",
  []  // history
);
// GPT-4o will:
// 1. Recognize need for product search
// 2. Call search_products tool
// 3. Return formatted response with products
```

---

## ⚙️ Configuration (Environment Variables)

```env
# Azure Search
AZURE_SEARCH_ENDPOINT=https://starkaisearch.search.windows.net
AZURE_SEARCH_API_KEY=<api-key>
AZURE_SEARCH_INDEX_NAME=products-index

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=https://starkopenai.openai.azure.com
AZURE_OPENAI_API_KEY=<api-key>
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=embeddingmodel
AZURE_OPENAI_CHAT_DEPLOYMENT=gpt-4o

# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/AzureAIServices

# Optional: Azure Vision, Speech
AZURE_VISION_ENDPOINT=<endpoint>
AZURE_VISION_KEY=<key>
AZURE_SPEECH_ENDPOINT=<endpoint>
AZURE_SPEECH_KEY=<key>
```

---

## 🔍 Debugging Tips

### Vector Search Not Finding Results?
1. Check if product has embedding in Azure Search
2. Run `syncAllToAzure()` to resync
3. Verify Azure Search index exists
4. Test with simpler query first

### Chat Not Using Tools?
1. Check system prompt mentions tools
2. Verify tool definition matches GPT-4o format
3. Check API key has chat deployment access
4. Review tool response format (must be valid JSON)

### Embedding Generation Failing?
1. Check API key and endpoint
2. Verify text is not too long (>8000 tokens)
3. Check rate limiting (implement retry logic)
4. Ensure embedding deployment exists

### Database Sync Issues?
1. Verify PostgreSQL connection string
2. Check product data completeness
3. Run migrations: `npx prisma migrate deploy`
4. Check Azure Search quota/capacity

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Search response | <500ms | TBD |
| Embedding generation | <2s | TBD |
| Chat response | <3s | TBD |
| Recommendation load | <200ms | TBD |

---

## ❌ What's NOT Yet Done (Priority Order)

### 1. Frontend Components (HIGH PRIORITY)
- [ ] Search results UI with filters
- [ ] Image search upload component
- [ ] Chat widget with product inline display
- [ ] Recommendation carousel
- [ ] Product detail with similar items

### 2. Backend Enhancements (MEDIUM)
- [ ] Redis caching for searches
- [ ] Batch product operations
- [ ] Trending products tracking
- [ ] User wishlist/history
- [ ] Search analytics

### 3. Testing & DevOps (MEDIUM)
- [ ] Unit tests for services
- [ ] Integration tests
- [ ] E2E tests
- [ ] CI/CD pipeline
- [ ] Performance testing

### 4. Advanced Features (LOW)
- [ ] Collaborative filtering
- [ ] Multi-language support
- [ ] Voice search
- [ ] ML-based personalization

---

## 🔗 Quick Links

- **Full Documentation:** `IMPLEMENTATION_UPDATES.md` (this repo)
- **Azure OpenAI Docs:** https://learn.microsoft.com/en-us/azure/cognitive-services/openai/
- **Azure AI Search:** https://learn.microsoft.com/en-us/azure/search/
- **Prisma Docs:** https://www.prisma.io/docs/

---

## 🎓 Next Steps

1. **Immediate (This Week):**
   - [ ] Test all search scenarios
   - [ ] Validate vector quality
   - [ ] Performance profile

2. **Short Term (Next 2 Weeks):**
   - [ ] Frontend search component
   - [ ] Chat UI implementation
   - [ ] Unit tests

3. **Medium Term (Next Sprint):**
   - [ ] Caching layer
   - [ ] Analytics dashboard
   - [ ] Performance optimization

4. **Long Term:**
   - [ ] ML personalization
   - [ ] Voice search
   - [ ] Multi-language support

---

**Last Updated:** March 27, 2026  
**Maintained By:** Development Team  
**Status:** Active Development
