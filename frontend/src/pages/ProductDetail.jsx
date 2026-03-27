import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Share2, 
  Heart, 
  Truck, 
  Shield, 
  RefreshCw,
  Check,
  Package,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getProduct, getRecommendations } from '../services/api';
import { cn, formatPrice } from '../lib/utils';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    // Fetch product and related items
    const fetchData = async () => {
      try {
        const prod = await getProduct(id);
        setProduct(prod);
        
        // Fetch related products based on current ID (Interest-based)
        const recs = await getRecommendations('guest', { interestProductId: id });
        setRelated(recs);
      } catch (err) {
        console.error(err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty += quantity;
    } else {
      cart.push({ ...product, qty: quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    window.dispatchEvent(new Event('storage'));
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-4 sm:pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="aspect-square rounded-2xl lg:rounded-3xl shimmer-bg" />
            <div className="space-y-4">
              <div className="h-6 sm:h-8 w-3/4 rounded-lg shimmer-bg" />
              <div className="h-4 sm:h-6 w-1/4 rounded-lg shimmer-bg" />
              <div className="h-4 w-full rounded-lg shimmer-bg" />
              <div className="h-4 w-5/6 rounded-lg shimmer-bg" />
              <div className="h-10 sm:h-12 w-1/3 rounded-xl shimmer-bg mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 sm:w-24 h-20 sm:h-24 mx-auto mb-6 rounded-full bg-gray-200 flex items-center justify-center">
            <Package className="w-10 sm:w-12 h-10 sm:h-12 text-gray-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">The product you are looking for does not exist.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-azure-500 to-purple-600 text-white rounded-xl font-medium"
          >
            Go Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const images = product.images || [product.imageUrl];

  return (
    <div className="min-h-screen bg-gray-50/50 pt-4 sm:pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-8 overflow-hidden"
        >
          <button onClick={() => navigate('/')} className="hover:text-gray-900 transition-colors shrink-0">Home</button>
          <span className="shrink-0">/</span>
          <button onClick={() => navigate('/')} className="hover:text-gray-900 transition-colors shrink-0">Products</button>
          <span className="shrink-0">/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="relative aspect-square rounded-2xl lg:rounded-3xl overflow-hidden bg-white shadow-lg">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={images[activeImage] || ''}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 hidden flex-col items-center justify-center bg-gray-50 text-gray-400">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-base sm:text-lg font-medium">No picture</span>
              </div>
              
              {product.originalPrice && (
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2 sm:px-3 py-1 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </div>
              )}

              {/* Mobile Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg lg:hidden"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg lg:hidden"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          activeImage === index ? "bg-white w-4" : "bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery - Desktop */}
            {images.length > 1 && images.some(img => img) && (
              <div className="hidden lg:flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  img ? (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        "w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0",
                        activeImage === index 
                          ? "border-purple-500 shadow-lg" 
                          : "border-transparent hover:border-gray-300"
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                  ) : null
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Title & Actions */}
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                {product.category && (
                  <span className="text-xs sm:text-sm font-medium text-purple-600 uppercase tracking-wider">
                    {product.category}
                  </span>
                )}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 leading-tight">
                  {product.name}
                </h1>
              </div>
              <div className="flex gap-1.5 sm:gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={cn(
                    "p-2 sm:p-3 rounded-xl transition-all",
                    isWishlisted 
                      ? "bg-red-50 text-red-500" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <Heart className={cn("w-4 h-4 sm:w-5 sm:h-5", isWishlisted && "fill-current")} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 sm:p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5",
                      i < Math.floor(product.rating || 4)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm sm:text-base text-gray-600">{product.rating || 4.0}</span>
              <span className="text-xs sm:text-sm text-gray-400">({product.reviewCount || 0} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base sm:text-xl text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-4 sm:py-6 border-y border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-base text-gray-700 font-medium">Qty:</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.button>
                  <span className="w-8 sm:w-12 text-center font-semibold text-base sm:text-lg">{quantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.button>
                </div>
              </div>

              <motion.button
                onClick={addToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex-1 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all flex items-center justify-center gap-2",
                  isAdded
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-azure-500 to-purple-600 text-white shadow-lg sm:shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50"
                )}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      Added
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-6">
              {[
                { icon: Truck, title: 'Free Shipping', desc: 'Over ₹500' },
                { icon: Shield, title: 'Secure', desc: 'Payment' },
                { icon: RefreshCw, title: 'Easy Returns', desc: '30 days' },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1.5 sm:mb-2 rounded-lg sm:rounded-xl bg-purple-50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900">{item.title}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azure-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                <p className="text-sm text-gray-500">You might also like these based on your interest</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((item, index) => (
                <ProductCard key={item.id} product={item} index={index} />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}