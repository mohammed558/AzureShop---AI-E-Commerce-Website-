import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Package,
  Sparkles,
  CreditCard,
  Truck,
  Shield
} from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';

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
    const updated = cart.filter(i => i.id !== id);
    updateCart(updated);
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 rounded-lg shimmer-bg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl shimmer-bg" />
              ))}
            </div>
            <div className="h-80 rounded-2xl shimmer-bg" />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-azure-100 to-purple-100 flex items-center justify-center"
          >
            <ShoppingCart className="w-16 h-16 text-purple-400" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Discover amazing products and add them to your cart!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-azure-500 to-purple-600 text-white rounded-2xl font-semibold shadow-xl shadow-purple-500/30"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-4 sm:pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            Shopping Cart
            <span className="text-base sm:text-lg font-normal text-gray-500">({cart.length} items)</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3 sm:gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 shrink-0 cursor-pointer"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      <img
                        src={item.imageUrl || ''}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full hidden flex-col items-center justify-center bg-gray-50 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-semibold text-sm sm:text-base text-gray-900 cursor-pointer hover:text-purple-600 transition-colors line-clamp-2"
                            onClick={() => navigate(`/product/${item.id}`)}
                          >
                            {item.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 sm:mt-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </motion.button>
                          <span className="w-8 sm:w-10 text-center font-semibold text-sm sm:text-base">{item.qty}</span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQty(item.id, 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </motion.button>
                        </div>
                        <span className="font-bold text-base sm:text-lg text-gray-900">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span>Subtotal ({cart.reduce((sum, i) => sum + i.qty, 0)} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-gray-600">
                  <span className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    Shipping
                  </span>
                  <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs text-green-600 mt-1">You saved {formatPrice(50)} on shipping!</p>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-azure-500 to-purple-600 text-white rounded-xl sm:rounded-2xl font-semibold shadow-lg sm:shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                Proceed to Checkout
              </motion.button>

              <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                {[
                  { icon: Truck, text: 'Free shipping on orders over ₹500' },
                  { icon: Shield, text: 'Secure payment processing' },
                  { icon: Sparkles, text: 'AI-powered recommendations' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}