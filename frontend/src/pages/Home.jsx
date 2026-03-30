import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Shield, 
  Zap, 
  TrendingUp,
  Search,
  Mic,
  Camera
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getAllProducts, getRecommendations } from '../services/api';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { label: 'Premium Tech', value: 'Electronics', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Curated Fashion', value: 'Clothing', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80' },  
  { label: 'Luxe Living', value: 'Home & Garden', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80' },

  { label: 'Elite Footwear', value: 'Footwear', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80' },
  { label: 'Designer Accessories', value: 'Accessories', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const trendingRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [all, recs] = await Promise.allSettled([
          getAllProducts(),
          getRecommendations('guest', { timeOfDay: 'morning', device: 'desktop' }),
        ]);
        if (all.status === 'fulfilled') setProducts(all.value);
        if (recs.status === 'fulfilled') setRecommended(recs.value);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const trendingProducts = products.filter(p => (p.rating || 0) >= 4.5).slice(0, 8);
  const newArrivals = [...products].slice(-8).reverse();

  const scrollTrending = (dir) => {
    if (trendingRef.current) {
      trendingRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white">
      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative min-h-screen sm:min-h-[90vh] flex items-center overflow-hidden bg-cream-50">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cream-100/60 to-transparent" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 w-full py-12 sm:py-0">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <span className="section-eyebrow !text-ink-900 animate-fade-in text-xs sm:text-sm">Exclusive Collection</span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold text-ink-950 leading-[1.1] mb-4 sm:mb-6 md:mb-8">
              Refined <br /> AI Search.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-ink-600 font-sans max-w-lg mb-6 sm:mb-8 md:mb-10 leading-relaxed">
              Experience the future of boutique shopping with Azure AI Intelligence. 
              Search by voice, image, or meaning with unparalleled elegance.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <button 
                onClick={() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
              >
                Shop Collection <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button 
                onClick={() => navigate('/search')}
                className="btn-outline text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto"
              >
                Explore AI Tools
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden sm:flex"
        >
          <span className="text-[9px] tracking-[0.3em] uppercase text-ink-400">Scroll</span>
          <div className="w-[1px] h-10 bg-ink-200" />
        </motion.div>
      </section>

      {/* ── Category Strip ───────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-cream-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-8 sm:mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-950">Shop by Category</h2>
            <button className="btn-ghost text-xs sm:text-sm w-full sm:w-auto" onClick={() => navigate('/search')}>View All</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                onClick={() => navigate(`/search?q=${encodeURIComponent(cat.value)}`)}
                className="group cursor-pointer text-center"
              >
                <div className="aspect-square overflow-hidden bg-cream-100 mb-4">
                  <img 
                    src={cat.img} 
                    alt={cat.label} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-[11px] tracking-[0.2em] font-medium uppercase text-ink-900 group-hover:text-gold-500 transition-colors">
                  {cat.label}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ─────────────────────────────────────────── */}
      <section id="new-arrivals" className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <span className="section-eyebrow text-xs sm:text-sm">Just Landed</span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-ink-950 mt-2">New Arrivals</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-x-6 lg:gap-y-12">
            {newArrivals.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Feature Showcase ───────────────────────────────────── */}
      <section className="py-12 sm:py-20 md:py-32 bg-cream-50 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] bg-ink-950 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1549439602-43ebcb232811?q=80&w=1200&auto=format&fit=crop" 
                  alt="AI Tech" 
                  className="w-full h-full object-cover opacity-60"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square bg-gold-400 p-10 flex flex-col justify-end">
                <h4 className="font-serif text-white text-3xl font-medium leading-tight mb-4">Discovery <br /> Reimagined.</h4>
                <p className="text-white/90 text-xs tracking-widest uppercase">Azure Multimodal Search</p>
              </div>
            </motion.div>

            <div className="flex flex-col gap-8 sm:gap-10 md:gap-12">
              {[
                { icon: Search, title: 'Semantic Context', desc: 'Our AI understands the soul of your query, going beyond simple keywords.' },
                { icon: Mic, title: 'Natural Voice', desc: 'Speak to our interface like you would to a personal concierge.' },
                { icon: Camera, title: 'Visual DNA', desc: 'Scan any image to find pieces with matching design language.' }
              ].map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="flex gap-4 sm:gap-6"
                >
                  <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 border border-ink-200 flex items-center justify-center">
                    <feat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-ink-900" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-ink-950 mb-2 sm:mb-3">{feat.title}</h3>
                    <p className="text-ink-600 text-[12px] sm:text-[13px] leading-relaxed max-w-sm">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trending Section ─────────────────────────────────────── */}
      <section className="py-12 sm:py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-0 mb-8 sm:mb-16">
            <div>
              <span className="section-eyebrow text-xs sm:text-sm">Most Loved</span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink-950 mt-2">Trending Now</h2>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button 
                onClick={() => scrollTrending(-1)} 
                className="w-10 h-10 sm:w-12 sm:h-12 border border-ink-200 flex items-center justify-center hover:bg-ink-950 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                onClick={() => scrollTrending(1)} 
                className="w-10 h-10 sm:w-12 sm:h-12 border border-ink-200 flex items-center justify-center hover:bg-ink-950 hover:text-white transition-all"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div
            ref={trendingRef}
            className="flex gap-8 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
          >
            {trendingProducts.map((product, index) => (
              <div key={product.id} className="shrink-0 w-72 md:w-80">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ────────────────────────────────────────── */}
      <section className="py-12 sm:py-20 md:py-32 bg-ink-950 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 md:gap-16">
            <div className="text-center">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-4 sm:mb-6 text-gold-300" />
              <h3 className="font-serif text-lg sm:text-xl mb-3 sm:mb-4">Unrivaled Security</h3>
              <p className="text-ink-300 text-[12px] sm:text-[13px] leading-relaxed">Built on the bedrock of Microsoft Azure for absolute data integrity.</p>
            </div>
            <div className="text-center">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-4 sm:mb-6 text-gold-300" />
              <h3 className="font-serif text-lg sm:text-xl mb-3 sm:mb-4">Elite Performance</h3>
              <p className="text-ink-300 text-[12px] sm:text-[13px] leading-relaxed">Search results served with millisecond precision via AI vectoring.</p>
            </div>
            <div className="text-center">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-4 sm:mb-6 text-gold-300" />
              <h3 className="font-serif text-lg sm:text-xl mb-3 sm:mb-4">Curated Intel</h3>
              <p className="text-ink-300 text-[12px] sm:text-[13px] leading-relaxed">Recommendations that evolve with your unique design sensibilities.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
