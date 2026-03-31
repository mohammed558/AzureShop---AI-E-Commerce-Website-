import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Package, Truck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart from localStorage
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('storage'));
    
    // Show success toast
    toast.success('✅ Payment successful! Order confirmed.', {
      duration: 4,
      style: { borderRadius: '0', background: '#111', color: '#fff' },
    });

    // Auto redirect after 8 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-8 bg-gold-400/20 rounded-full flex items-center justify-center border-2 border-gold-400"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Check className="w-12 h-12 text-gold-500" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="font-serif text-5xl md:text-6xl text-ink-950 mb-4"
          >
            Payment Complete
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-ink-500 text-lg md:text-xl mb-12 max-w-lg mx-auto"
          >
            Your order has been successfully processed. Your items will be carefully curated and shipped to you shortly.
          </motion.p>

          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16 p-8 bg-cream-50 border border-cream-200"
          >
            {[
              { icon: Check, title: 'Order Confirmed', desc: 'Confirmation email sent' },
              { icon: Package, title: 'Processing', desc: 'Items being prepared' },
              { icon: Truck, title: 'Shipping Soon', desc: 'Tracking info provided' }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-4">
                  <step.icon className="w-8 h-8 text-gold-500" />
                </div>
                <h3 className="font-serif text-lg text-ink-950 mb-2">{step.title}</h3>
                <p className="text-sm text-ink-400">{step.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="p-6 bg-ink-950/5 border border-ink-200 mb-12"
          >
            <p className="text-sm text-ink-600 leading-relaxed">
              A detailed order receipt with tracking information has been sent to your registered email address. 
              You can also view your order status in your account dashboard at any time.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-8 py-4 flex items-center justify-center gap-2"
            >
              CONTINUE SHOPPING <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="btn-outline px-8 py-4"
            >
              VIEW ACCOUNT
            </button>
          </motion.div>

          {/* Auto-redirect Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="text-xs text-ink-300 tracking-widest uppercase mt-10"
          >
            Redirecting to home in a few seconds...
          </motion.p>
        </div>
      </div>
    </div>
  );
}
