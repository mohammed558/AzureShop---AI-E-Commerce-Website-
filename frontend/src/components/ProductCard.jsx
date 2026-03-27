import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Eye, Check, Sparkles } from 'lucide-react';
import { cn, formatPrice, truncateText } from '../lib/utils';

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const addToCart = (e) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(168, 85, 247, 0.15)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'box-shadow 0.4s ease'
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: isHovered 
            ? 'inset 0 0 0 2px rgba(168, 85, 247, 0.3)' 
            : 'inset 0 0 0 0px rgba(168, 85, 247, 0)'
        }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {!imageLoaded && product.imageUrl && (
          <div className="absolute inset-0 shimmer-bg" />
        )}
        
        <motion.img
          src={product.imageUrl || ''}
          alt=""
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 hidden flex-col items-center justify-center bg-gray-50 text-gray-400">
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium">No picture</span>
        </div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-sm font-medium shadow-lg hover:bg-white transition-colors"
        >
          <Eye className="w-4 h-4" />
          Quick View
        </motion.button>

        {product.rating >= 4.5 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
            <Sparkles className="w-3 h-3" />
            Top Rated
          </div>
        )}

        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        {product.category && (
          <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">
            {product.category}
          </span>
        )}

        <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
          {product.name}
        </h3>

        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {truncateText(product.description, 80)}
        </p>

        <div className="mt-2 flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3.5 h-3.5",
                  i < Math.floor(product.rating || 4)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <motion.button
            onClick={addToCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 overflow-hidden",
              isAdded
                ? "bg-green-500 text-white"
                : "bg-gradient-to-r from-azure-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
            )}
          >
            <AnimatePresence mode="wait">
              {isAdded ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Added</span>
                </motion.div>
              ) : (
                <motion.div
                  key="cart"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
