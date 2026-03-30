import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../lib/useWishlist';

export default function Wishlist() {
  const { wishlist, clearWishlist } = useWishlist();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="min-h-screen bg-white pt-10 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-ink-400 mb-12">
          <button onClick={() => navigate('/')} className="hover:text-ink-950 transition-colors">Home</button>
          <span>/</span>
          <span className="text-ink-950 font-semibold italic">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="section-eyebrow !mb-2">Your Favorites</span>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-ink-950 leading-tight italic">
              Saved Masterpieces
            </h1>
            <p className="text-ink-400 text-[11px] tracking-widest uppercase font-bold mt-4">
              {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your private collection
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-[11px] tracking-[0.2em] uppercase font-bold text-ink-300 hover:text-red-500 transition-colors border-b border-transparent hover:border-red-500 pb-1"
            >
              Clear Entire Collection
            </button>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {wishlist.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-40 border border-ink-50 bg-cream-50/20"
            >
              <div className="w-20 h-20 mb-8 flex items-center justify-center border border-ink-100">
                <Heart className="w-8 h-8 text-ink-200" />
              </div>
              <h2 className="font-serif text-2xl text-ink-950 mb-4 text-center">Your wishlist is currently uncurated</h2>
              <p className="text-ink-400 text-[11px] tracking-widest uppercase text-center max-w-sm leading-relaxed mb-10">
                Explore our curated gallery and save pieces that resonate with your unique aesthetic.
              </p>
              <button 
                onClick={() => navigate('/')} 
                className="btn-primary"
              >
                BEGIN EXPLORATION <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12"
            >
              {wishlist.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions / Footer */}
        {wishlist.length > 0 && (
          <div className="mt-32 pt-20 border-t border-cream-100 flex flex-col items-center gap-10">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-ink-400">Discover more for your collection</span>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="btn-outline px-12"
            >
              BROWSE NEW ARRIVALS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
