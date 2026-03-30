import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Eye, Check, Sparkles, Heart } from 'lucide-react';
import { cn, formatPrice, truncateText } from '../lib/utils';
import { useWishlist } from '../lib/useWishlist';

export default function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="product-card group"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-card-img-wrap">
        {!imageLoaded && (
          <div className="absolute inset-0 shimmer-bg" />
        )}
        
        <img
          src={product.imageUrl || ''}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.classList.add('flex', 'items-center', 'justify-center');
            e.target.parentNode.innerHTML = '<span class="text-[10px] text-ink-300 tracking-widest uppercase">No Image</span>';
          }}
        />

        {/* Badges */}
        <div className="absolute top-0 left-0 flex flex-col items-start p-3 gap-1 z-10">
          {product.rating >= 4.5 && (
            <div className="product-card-badge product-card-badge-gold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Top Rated</span>
            </div>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="product-card-badge">
              {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all z-20',
            wishlisted ? 'text-red-500' : 'text-ink-300 hover:text-ink-900'
          )}
        >
          <Heart className={cn('w-4.5 h-4.5', wishlisted && 'fill-current')} />
        </motion.button>

        {/* Hover Actions */}
        <div className="product-card-actions">
          <div className="flex flex-col gap-2">
            <button
              onClick={addToCart}
              className="btn-primary w-full py-2.5 text-[10px]"
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> ADDED
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    ADD TO BAG
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
              className="btn-outline w-full py-2.5 text-[10px]"
            >
              QUICK VIEW
            </button>
          </div>
        </div>
      </div>

      <div className="product-card-body">
        {product.category && (
          <span className="section-eyebrow !mb-1 !text-[9px]">
            {product.category}
          </span>
        )}

        <h3 className="product-card-name truncate">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <div className="product-card-price">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="product-card-price-old">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span>{formatPrice(product.price)}</span>
          </div>

          <div className="flex items-center gap-0.5 opacity-50">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-ink-500 font-medium">
              {product.rating || 0}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
