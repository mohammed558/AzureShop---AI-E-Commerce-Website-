import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ShoppingBag, 
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
import ReviewSection from '../components/ReviewSection';
import QASection from '../components/QASection';
import { useWishlist } from '../lib/useWishlist';
import { trackProductView } from '../lib/useAnalytics';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const prod = await getProduct(id);
        setProduct(prod);
        trackProductView(prod);
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
    toast.success(`${quantity} x item(s) added to bag`, {
      style: { borderRadius: '0', background: '#111', color: '#fff' },
    });
    setTimeout(() => setIsAdded(false), 2000);
    window.dispatchEvent(new Event('storage'));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-10 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="aspect-[3/4] bg-cream-50 shimmer-bg" />
            <div className="space-y-6">
              <div className="h-4 w-24 bg-cream-100 shimmer-bg" />
              <div className="h-10 w-3/4 bg-cream-100 shimmer-bg" />
              <div className="h-20 w-full bg-cream-100 shimmer-bg" />
              <div className="h-12 w-48 bg-cream-100 shimmer-bg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Package className="w-16 h-16 text-ink-300 mb-6" />
        <h2 className="font-serif text-3xl mb-4">Piece Not Found</h2>
        <p className="text-ink-500 mb-8 max-w-sm text-center">The selective item you are looking for is no longer available in our collection.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Return to Collection</button>
      </div>
    );
  }

  const images = product.images || [product.imageUrl];

  return (
    <div className="min-h-screen bg-white pt-6 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-ink-400 mb-10 overflow-hidden">
          <button onClick={() => navigate('/')} className="hover:text-ink-950 transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/search')} className="hover:text-ink-950 transition-colors">Collection</button>
          <span>/</span>
          <span className="text-ink-950 truncate font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left Column: Visuals */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[3/4] bg-cream-50 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  src={images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-6 left-6 product-card-badge">
                  Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}

              {/* Navigation arrows (Overlay on mobile) */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage(p => (p - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white text-ink-950 flex items-center justify-center transition-all lg:hidden">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setActiveImage(p => (p + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white text-ink-950 flex items-center justify-center transition-all lg:hidden">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "aspect-square overflow-hidden border transition-all",
                      activeImage === idx ? "border-ink-950 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <div className="mb-4">
              <span className="section-eyebrow !text-ink-500 !mb-2">{product.category}</span>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-ink-950 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price & Rating */}
            <div className="flex items-center justify-between py-6 border-y border-cream-200 mb-8">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-medium text-ink-950 italic">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-ink-300 line-through font-light">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-50">
                <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                <span className="text-xs font-semibold">{product.rating || '4.0'}</span>
                <span className="text-xs text-ink-400 ml-1">({product.reviewCount || 0})</span>
              </div>
            </div>

            <p className="text-ink-600 text-sm leading-relaxed mb-10 font-sans">
              {product.description}
            </p>

            {/* Add to Bag UI */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-10">
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-ink-400">Quantity</span>
                <div className="flex items-center border border-ink-200 h-12">
                  <button onClick={() => setQuantity(m => Math.max(1, m - 1))} className="w-12 h-full flex items-center justify-center hover:bg-cream-50 transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(m => m + 1)} className="w-12 h-full flex items-center justify-center hover:bg-cream-50 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={addToCart}
                  className="btn-primary flex-1 py-5 text-[11px] tracking-[0.2em]"
                >
                  <AnimatePresence mode="wait">
                    {isAdded ? (
                      <motion.span key="added" initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> ITEM ADDED
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                         ADD TO BAG
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={cn(
                    "w-16 h-16 border flex items-center justify-center transition-all",
                    isWishlisted(product.id) ? "bg-ink-950 border-ink-950 text-white" : "border-ink-200 hover:border-ink-950"
                  )}
                >
                  <Heart className={cn("w-5 h-5", isWishlisted(product.id) && "fill-current")} />
                </button>
              </div>
            </div>

            {/* Service Highlights */}
            <div className="grid grid-cols-2 gap-px bg-cream-200 border border-cream-200">
              {[
                { icon: Truck, title: 'Complimentary Shipping', sub: 'Orders above ₹999' },
                { icon: Shield, title: 'Azure Curated Quality', sub: 'AI Verified Inspection' },
                { icon: RefreshCw, title: 'Seamless Returns', sub: '30-Day Evaluation' },
                { icon: ShoppingBag, title: 'Premium Packaging', sub: 'Sustainable Luxury' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-5 flex flex-col gap-3">
                  <s.icon className="w-5 h-5 text-ink-900" />
                  <div>
                    <h4 className="text-[11px] font-bold tracking-tight text-ink-950">{s.title}</h4>
                    <p className="text-[10px] text-ink-500 mt-0.5">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {related.length > 0 && (
          <div className="mt-40">
             <div className="flex flex-col items-center mb-16">
              <span className="section-eyebrow">Curated for you</span>
              <h2 className="font-serif text-4xl font-semibold text-ink-950 mt-2">Pieces of Interest</h2>
              <div className="w-20 h-px bg-gold-400 mt-6" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-32 border-t border-cream-200 pt-32 space-y-40">
          <ReviewSection productId={id} />
          <QASection productId={id} />
        </div>
      </div>
    </div>
  );
}