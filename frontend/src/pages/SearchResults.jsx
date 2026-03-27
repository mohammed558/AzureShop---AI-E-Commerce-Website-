import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Filter, SlidersHorizontal, X, RotateCcw, Star, Lightbulb } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { searchProducts } from '../services/api';
import { cn } from '../lib/utils';

const PRICE_RANGES = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
  { label: 'Over ₹10,000', min: 10000, max: Infinity },
];

const RATINGS = [
  { label: '4★ & above', value: 4 },
  { label: '3★ & above', value: 3 },
  { label: '2★ & above', value: 2 },
];

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys'];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const query = searchParams.get('q') || '';

  const [allResults, setAllResults] = useState(location.state?.results || []);
  const [alternatives, setAlternatives] = useState([]);
  const [expansion, setExpansion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    if (!query && !location.state?.results) return;
    
    if (location.state?.results) {
      setAllResults(location.state.results);
      return;
    }

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await searchProducts(query);
        // New API returns: { products, alternatives, expansion }
        setAllResults(response.products || response);
        setAlternatives(response.alternatives || []);
        setExpansion(response.expansion || null);
      } catch {
        setError('Search failed. Please check your Azure AI Search configuration.');
      }
      setLoading(false);
    };
    run();
  }, [query, location.state]);

  const filteredResults = useMemo(() => {
    let results = [...allResults];

    if (selectedPriceRanges.length > 0) {
      results = results.filter(product => {
        return selectedPriceRanges.some(range => {
          const price = product.price;
          return price >= range.min && price < range.max;
        });
      });
    }

    if (selectedRating) {
      results = results.filter(product => (product.rating || 0) >= selectedRating);
    }

    if (selectedCategories.length > 0) {
      results = results.filter(product => 
        selectedCategories.includes(product.category)
      );
    }

    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return results;
  }, [allResults, selectedPriceRanges, selectedRating, selectedCategories, sortBy]);

  const togglePriceRange = (range) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedPriceRanges([]);
    setSelectedRating(null);
    setSelectedCategories([]);
    setSortBy('relevance');
  };

  const hasActiveFilters = selectedPriceRanges.length > 0 || selectedRating || selectedCategories.length > 0;
  const activeFiltersCount = selectedPriceRanges.length + (selectedRating ? 1 : 0) + selectedCategories.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pt-24 lg:pt-32 pb-20 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span>Home</span>
            <span>/</span>
            <span className="text-gray-900">Search</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {query ? (
                  <>
                    Results for &quot;<span className="gradient-text-azure">{query}</span>&quot;
                  </>
                ) : (
                  location.state?.label || 'Search Results'
                )}
              </h1>
              
              {!loading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-gray-600"
                >
                  Found <span className="font-semibold text-gray-900">{filteredResults.length}</span>
                  {filteredResults.length !== allResults.length && ` of ${allResults.length}`} products
                  {query && (
                    <span className="inline-flex items-center gap-1 ml-2 text-sm text-purple-600">
                      <Sparkles className="w-4 h-4" />
                      Powered by Azure AI Semantic Search
                    </span>
                  )}
                </motion.p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-wrap items-center gap-2"
            >
              <span className="text-sm text-gray-500">Active filters:</span>
              
              {selectedPriceRanges.map(range => (
                <span key={range.label} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {range.label}
                  <button onClick={() => togglePriceRange(range)} className="hover:bg-purple-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              
              {selectedRating && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {selectedRating}★ & above
                  <button onClick={() => setSelectedRating(null)} className="hover:bg-purple-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {selectedCategories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                  {cat}
                  <button onClick={() => toggleCategory(cat)} className="hover:bg-purple-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                Clear all
              </button>
            </motion.div>
          )}
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "lg:w-64 shrink-0",
              showFilters ? "block" : "hidden lg:block"
            )}
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-20 lg:top-24 z-30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full mb-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear All Filters
                </button>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range) => (
                    <label key={range.label} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                      <input 
                        type="checkbox" 
                        checked={selectedPriceRanges.includes(range)}
                        onChange={() => togglePriceRange(range)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                      />
                      {range.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Rating</h4>
                <div className="space-y-2">
                  {RATINGS.map((rating) => (
                    <label key={rating.label} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                      <input 
                        type="radio" 
                        name="rating"
                        checked={selectedRating === rating.value}
                        onChange={() => setSelectedRating(rating.value)}
                        className="rounded-full border-gray-300 text-purple-600 focus:ring-purple-500" 
                      />
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {rating.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Categories</h4>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Results Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl h-80 shimmer-bg"
                  />
                ))}
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Search Error</h3>
                <p className="text-red-600">{error}</p>
              </motion.div>
            ) : filteredResults.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? 'No products match your filters' : 'No products found'}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more results.'
                    : 'Try adjusting your search terms. You can also try voice search or image search for better results.'
                  }
                </p>

                {/* AI Query Expansion Insights */}
                {expansion && (expansion.category || expansion.color || expansion.pattern) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                      <h4 className="text-sm font-semibold text-purple-900">AI Search Insights</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expansion.category && (
                        <span className="px-3 py-1 bg-white text-purple-700 text-xs rounded-full border border-purple-200">
                          Category: {expansion.category}
                        </span>
                      )}
                      {expansion.color && (
                        <span className="px-3 py-1 bg-white text-purple-700 text-xs rounded-full border border-purple-200">
                          Color: {expansion.color}
                        </span>
                      )}
                      {expansion.pattern && (
                        <span className="px-3 py-1 bg-white text-purple-700 text-xs rounded-full border border-purple-200">
                          Pattern: {expansion.pattern}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {filteredResults.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        {/* Alternative Suggestions */}
        {alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Alternative Suggestions</h2>
                <p className="text-sm text-gray-500">Based on AI-powered query expansion</p>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {alternatives.slice(0, 6).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}