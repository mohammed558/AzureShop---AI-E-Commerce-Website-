import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Package,
  Sparkles,
  CreditCard,
  Truck,
  Shield,
  ChevronRight
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import toast from 'react-hot-toast';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(items);
    setIsLoading(false);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('storage'));
  };

  const updateQty = (id, delta) => {
    const updated = cart
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0);
    updateCart(updated);
  };

  const removeItem = (id) => {
    const item = cart.find(i => i.id === id);
    const updated = cart.filter(i => i.id !== id);
    updateCart(updated);
    toast.error(`${item?.name} removed from bag`, {
       style: { borderRadius: '0', background: '#111', color: '#fff' },
    });
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="h-10 w-48 bg-cream-50 shimmer-bg mb-12" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-8">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-40 bg-cream-50 shimmer-bg" />
              ))}
            </div>
            <div className="lg:col-span-4 h-80 bg-cream-50 shimmer-bg" />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 pb-40">
        <div className="w-24 h-24 mb-10 flex items-center justify-center border border-ink-100 italic font-serif text-4xl text-ink-200">0</div>
        <h2 className="font-serif text-3xl mb-4">Your Bag is Empty</h2>
        <p className="text-ink-500 text-xs tracking-widest uppercase mb-12 text-center max-w-xs leading-relaxed">Discover our latest collection and find items that resonate with your style.</p>
        <button onClick={() => navigate('/')} className="btn-primary px-12">EXPLORE COLLECTION</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-10 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Navigation / Header */}
        <div className="mb-16">
          <nav className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-ink-400 mb-8">
            <button onClick={() => navigate('/')} className="hover:text-ink-950 transition-colors">Home</button>
            <span>/</span>
            <span className="text-ink-950 font-semibold italic">Shopping Bag</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="section-eyebrow !mb-2">Your Selection</span>
              <h1 className="font-serif text-4xl md:text-5xl font-semibold text-ink-950">Review Your Bag</h1>
            </div>
             <p className="text-ink-400 text-[11px] tracking-widest uppercase font-bold self-start md:self-end">
              {cart.length} unique pieces curated
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-12">
            <div className="hidden sm:grid grid-cols-12 pb-4 border-b border-ink-950 text-[10px] tracking-widest font-bold uppercase text-ink-400">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pb-12 border-b border-cream-100 last:border-0"
                >
                  <div className="col-span-12 sm:col-span-6 flex gap-6">
                    <div 
                      className="w-24 h-32 bg-cream-50 overflow-hidden shrink-0 cursor-pointer"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500" />
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                       <h3 
                        className="font-serif text-lg text-ink-950 hover:text-gold-500 transition-colors cursor-pointer"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        {item.name}
                      </h3>
                      <p className="text-[10px] tracking-widest uppercase font-bold text-ink-400">{item.category}</p>
                      <div className="flex items-center gap-4 mt-2">
                         <span className="text-xs font-semibold text-ink-950 italic">{formatPrice(item.price)}</span>
                         <button onClick={() => removeItem(item.id)} className="text-[10px] text-ink-300 hover:text-red-500 underline underline-offset-4 tracking-tighter transition-colors">REMOVE</button>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3 flex justify-start sm:justify-center">
                    <div className="flex items-center border border-ink-100 h-10 w-32">
                      <button onClick={() => updateQty(item.id, -1)} className="w-10 h-full flex items-center justify-center hover:bg-cream-50 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="flex-1 text-center text-xs font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-10 h-full flex items-center justify-center hover:bg-cream-50 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3 text-right">
                    <span className="font-serif text-xl text-ink-950 italic">{formatPrice(item.price * item.qty)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div className="pt-10 flex flex-col gap-10">
               <button onClick={() => navigate('/')} className="flex items-center gap-4 text-[11px] tracking-[0.3em] font-bold uppercase text-ink-400 hover:text-ink-950 transition-colors">
                <ArrowLeft className="w-4 h-4" /> CONTINUE COLLECTING
              </button>

              <div className="p-8 bg-cream-50 border border-cream-100">
                <div className="flex items-center gap-4 mb-4">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <h4 className="text-[11px] tracking-widest uppercase font-bold text-ink-950 italic">Personalized Concierge Suggestion</h4>
                </div>
                <p className="text-[11px] text-ink-500 leading-relaxed max-w-lg">Based on your selection, pieces from our 'High Jewelry' collection might complement your current curation perfectly.</p>
              </div>
            </div>
          </div>

          {/* Checkout Column */}
          <div className="lg:col-span-4 h-fit sticky top-10">
            <div className="border border-ink-950 p-8 pt-10">
               <h2 className="font-serif text-2xl text-ink-950 mb-10 border-b border-cream-200 pb-6 uppercase tracking-tighter">Investment Summary</h2>
              
               <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-[11px] tracking-widest uppercase font-bold">
                  <span className="text-ink-400">Subtotal Value</span>
                  <span className="text-ink-950 italic">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] tracking-widest uppercase font-bold">
                   <div className="flex items-center gap-2 text-ink-400">
                    <Truck className="w-3.5 h-3.5" /> Curated Shipping
                  </div>
                  <span className="text-ink-950">{shipping === 0 ? 'COMPLIMENTARY' : formatPrice(shipping)}</span>
                </div>
                
                <div className="pt-6 border-t border-ink-950 space-y-2">
                   <div className="flex justify-between items-center">
                    <span className="font-serif text-xl text-ink-950 uppercase tracking-tighter">Total</span>
                    <span className="font-serif text-3xl text-ink-950 italic">{formatPrice(total)}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-[9px] text-gold-500 tracking-[0.2em] font-bold uppercase text-right">Complimentary shipping applied</p>
                  )}
                </div>
              </div>

              <button 
                className="btn-primary w-full py-5 text-[11px] tracking-[0.3em]"
              >
                SECURE CHECKOUT <ChevronRight className="w-4 h-4 ml-1" />
              </button>

              <div className="mt-10 space-y-5">
                {[
                  { icon: Shield, text: 'Encrypted & Secure Transaction' },
                  { icon: Truck, text: 'Insured Premium Delivery' },
                  { icon: Package, text: 'Signature Presentation Box Included' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-[9px] tracking-widest uppercase font-bold text-ink-400 italic">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}