import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Filter, SlidersHorizontal, X, RotateCcw, Star, Lightbulb, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { searchProducts } from '../services/api';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

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
  const navigate = useNavigate();
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
        setAllResults(response.products || response);
        setAlternatives(response.alternatives || []);
        setExpansion(response.expansion || null);
      } catch {
        toast.error('Search evaluation failed.', {
           style: { borderRadius: '0', background: '#111', color: '#fff' },
        });
        setError('Connection to Azure Intelligence interrupted.');
      }
      setLoading(false);
    };
    run();
  }, [query, location.state]);

  const filteredResults = useMemo(() => {
    let results = [...allResults];
    if (selectedPriceRanges.length > 0) {
      results = results.filter(p => selectedPriceRanges.some(r => p.price >= r.min && p.price < r.max));
    }
    if (selectedRating) {
      results = results.filter(p => (p.rating || 0) >= selectedRating);
    }
    if (selectedCategories.length > 0) {
      results = results.filter(p => selectedCategories.includes(p.category));
    }
    switch (sortBy) {
      case 'price-low': results.sort((a, b) => a.price - b.price); break;
      case 'price-high': results.sort((a, b) => b.price - a.price); break;
      case 'rating': results.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }
    return results;
  }, [allResults, selectedPriceRanges, selectedRating, selectedCategories, sortBy]);

  const togglePriceRange = (range) => {
    setSelectedPriceRanges(prev => prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]);
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const clearFilters = () => {
    setSelectedPriceRanges([]);
    setSelectedRating(null);
    setSelectedCategories([]);
    setSortBy('relevance');
  };

  const hasActiveFilters = selectedPriceRanges.length > 0 || selectedRating || selectedCategories.length > 0;
  const activeFiltersCount = selectedPriceRanges.length + (selectedRating ? 1 : 0) + selectedCategories.length;

  return (
    <div className="min-h-screen bg-white pt-10 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Header Section */}
        <section className="mb-20">
          <nav className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-ink-400 mb-8">
            <button onClick={() => navigate('/')} className="hover:text-ink-950 transition-colors">Home</button>
            <span>/</span>
            <span className="text-ink-950 font-semibold italic">Curated Search</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="section-eyebrow !mb-2">Discovery Results</span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-ink-950 leading-tight">
                {query ? (
                  <>Findings for <span className="italic">"{query}"</span></>
                ) : (
                  location.state?.label || 'Our Collection'
                )}
              </h1>
              <p className="text-ink-500 text-[11px] tracking-widest uppercase font-bold mt-4 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                Azure AI Evaluated ({filteredResults.length} Pieces)
              </p>
            </div>

            <div className="flex items-center gap-4">
               <div className="relative group">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent border-b border-ink-200 py-2 pr-8 text-[11px] tracking-widest uppercase font-bold text-ink-950 focus:border-ink-950 outline-none cursor-pointer"
                >
                  <option value="relevance">By Relevance</option>
                  <option value="price-low">Price: Ascending</option>
                  <option value="price-high">Price: Descending</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-ink-400" />
              </div>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-5 py-2.5 border border-ink-950 text-[10px] tracking-widest font-bold uppercase transition-all hover:bg-ink-950 hover:text-white"
              >
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-20">
          {/* Sidebar Filters */}
          <aside className={cn(
            "lg:w-64 shrink-0 transition-all duration-300",
            showFilters ? "block" : "hidden lg:block"
          )}>
            <div className="sticky top-10 space-y-12">
               <div className="flex items-center justify-between pb-4 border-b border-ink-950">
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-ink-950">Refine Collection</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[9px] font-bold text-gold-500 hover:text-gold-600 uppercase tracking-widest">Reset</button>
                )}
              </div>

              <div className="space-y-10">
                {/* Categories */}
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6 py-2 border-b border-cream-200">Category</h4>
                  <div className="space-y-4">
                    {CATEGORIES.map(cat => (
                      <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                          "w-4 h-4 border border-ink-200 flex items-center justify-center transition-all",
                          selectedCategories.includes(cat) ? "bg-ink-950 border-ink-950" : "group-hover:border-ink-950"
                        )}>
                          {selectedCategories.includes(cat) && <X className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                        <span className={cn("text-[11px] font-medium tracking-tight transition-colors", selectedCategories.includes(cat) ? "text-ink-950 font-bold" : "text-ink-500 group-hover:text-ink-950")}>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                   <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6 py-2 border-b border-cream-200">Investment</h4>
                  <div className="space-y-4">
                    {PRICE_RANGES.map(range => (
                      <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                          "w-4 h-4 border border-ink-200 flex items-center justify-center transition-all",
                          selectedPriceRanges.includes(range) ? "bg-ink-950 border-ink-950" : "group-hover:border-ink-950"
                        )}>
                           {selectedPriceRanges.includes(range) && <X className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={selectedPriceRanges.includes(range)} onChange={() => togglePriceRange(range)} />
                        <span className={cn("text-[11px] font-medium tracking-tight transition-colors", selectedPriceRanges.includes(range) ? "text-ink-950 font-bold" : "text-ink-500 group-hover:text-ink-950")}>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                   <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6 py-2 border-b border-cream-200">Evaluation</h4>
                  <div className="space-y-4">
                    {RATINGS.map(rating => (
                      <label key={rating.label} className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                          "w-4 h-4 border border-ink-200 rounded-full flex items-center justify-center transition-all",
                          selectedRating === rating.value ? "bg-ink-950 border-ink-950" : "group-hover:border-ink-950"
                        )}>
                           {selectedRating === rating.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <input type="radio" className="hidden" name="rating" checked={selectedRating === rating.value} onChange={() => setSelectedRating(rating.value)} />
                        <span className={cn("text-[11px] font-medium tracking-tight transition-colors", selectedRating === rating.value ? "text-ink-950 font-bold" : "text-ink-500 group-hover:text-ink-950")}>{rating.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-cream-50 shimmer-bg" />
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 border border-cream-100 bg-cream-50/20">
                <Search className="w-12 h-12 text-ink-200 mb-6" />
                <h3 className="font-serif text-2xl text-ink-950 mb-4">No pieces match your criteria</h3>
                <p className="text-ink-400 text-xs tracking-widest uppercase text-center max-w-sm leading-relaxed">
                  Refine your search parameters or explore our new arrivals for inspiration.
                </p>
                <button onClick={clearFilters} className="btn-outline mt-10">Clear All Parameters</button>
              </div>
            ) : (
              <div>
                {/* AI Insights Bar */}
                {expansion && (expansion.category || expansion.color || expansion.pattern) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 p-6 bg-ink-950 text-white flex items-center gap-10">
                    <div className="flex items-center gap-3 shrink-0">
                      <Sparkles className="w-4 h-4 text-gold-400" />
                      <span className="text-[10px] tracking-[0.2em] font-bold uppercase">AI Evaluation</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {expansion.category && <span className="text-[10px] italic font-serif text-ink-300">Intending: {expansion.category}</span>}
                      {expansion.color && <span className="text-[10px] italic font-serif text-ink-300">Shade focus: {expansion.color}</span>}
                      {expansion.pattern && <span className="text-[10px] italic font-serif text-ink-300">Design motif: {expansion.pattern}</span>}
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  <AnimatePresence>
                    {filteredResults.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <div className="mt-32">
                <div className="flex flex-col items-center mb-16">
                  <span className="section-eyebrow">Extended Selection</span>
                  <h2 className="font-serif text-3xl font-semibold text-ink-950 mt-2">Pieces of Similar Essence</h2>
                  <div className="w-16 h-px bg-gold-400 mt-6" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {alternatives.slice(0, 6).map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}