import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap, Shield, ArrowRight, Search, Mic, Camera } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getAllProducts, getRecommendations } from '../services/api';
import { cn } from '../lib/utils';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const features = [
    { icon: Search, title: 'Semantic Search', desc: 'Find products by meaning, not just keywords' },
    { icon: Mic, title: 'Voice Search', desc: 'Speak naturally to find what you need' },
    { icon: Camera, title: 'Visual Search', desc: 'Upload images to find similar products' },
    { icon: Sparkles, title: 'AI Recommendations', desc: 'Personalized suggestions just for you' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-azure-50 via-purple-50 to-pink-50" />
        
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.9, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 30, 0], y: [0, 20, -30, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-10 w-96 h-96 bg-azure-300/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 20, -30, 0], y: [0, -20, 30, 0], scale: [1, 1.2, 0.8, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg shadow-purple-500/10 mb-8"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Powered by Azure AI Services</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
            >
              Discover Products with{' '}
              <span className="gradient-text-azure">AI Intelligence</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Experience the future of shopping with semantic search, voice commands, 
              image recognition, and personalized recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.a
                href="#products"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-azure-500 via-purple-600 to-pink-500 text-white rounded-2xl font-semibold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
              >
                Explore Products
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold shadow-lg border border-gray-200 hover:border-purple-300 transition-all"
              >
                <Zap className="w-5 h-5 text-amber-500" />
                Try AI Search
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900">AI-Powered Shopping</h2>
            <p className="mt-4 text-gray-600">Experience cutting-edge technology in every search</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group p-6 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-purple-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-azure-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Recommended Products */}
      {recommended.length > 0 && (
        <section className="py-20 bg-gray-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
                <p className="text-sm text-gray-500">Personalized by Azure AI Personalizer</p>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {recommended.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azure-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
            </div>
            <span className="text-sm text-gray-500">{products.length} items</span>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 shimmer-bg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500">No products found. Make sure your Azure Search index has data.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold">Why Choose AzureShop?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure & Reliable', desc: 'Built on Microsoft Azure infrastructure' },
              { icon: Zap, title: 'Lightning Fast', desc: 'AI-powered search in milliseconds' },
              { icon: Sparkles, title: 'Always Learning', desc: 'Recommendations improve over time' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
