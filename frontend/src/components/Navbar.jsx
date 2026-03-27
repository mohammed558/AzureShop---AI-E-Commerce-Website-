import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Mic, 
  Camera, 
  ShoppingCart, 
  Sparkles,
  X,
  Loader2,
  Menu,
  Upload
} from 'lucide-react';
import { voiceSearch, imageSearch } from '../services/api';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchFocus, setShowSearchFocus] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [imageError, setImageError] = useState('');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const fileRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef(null);
  const imageOptionsRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close image options dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (imageOptionsRef.current && !imageOptionsRef.current.contains(e.target)) {
        setShowImageOptions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Stop camera stream when modal closes
  useEffect(() => {
    if (!showCameraModal && streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, [showCameraModal]);

  // Text Search
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSearchFocus(false);
    }
  };

  // Voice Search
  const startVoice = async () => {
    if (listening || isProcessingVoice) return;
    
    setVoiceError('');
    setListening(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        setListening(false);
        setIsProcessingVoice(true);
        
        const blob = new Blob(chunks, { type: 'audio/wav' });
        try {
          const res = await voiceSearch(blob);
          if (res.text) {
            setQuery(res.text);
            navigate(`/search?q=${encodeURIComponent(res.text)}`);
          } else {
            setVoiceError('Could not understand audio. Please try again.');
          }
        } catch (err) {
          setVoiceError('Voice search failed. Please try again.');
        } finally {
          setIsProcessingVoice(false);
          stream.getTracks().forEach(t => t.stop());
        }
      };

      recorder.onerror = () => {
        setListening(false);
        setVoiceError('Recording error. Please try again.');
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 4000);
    } catch (err) {
      setListening(false);
      setVoiceError('Microphone permission denied or not available.');
    }
  };

  // Image Search
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImageError('');
    setIsProcessingImage(true);
    
    try {
      const results = await imageSearch(file);
      if (results && results.length > 0) {
        navigate('/search', { state: { results, label: 'Image Search Results' } });
      } else {
        setImageError('No similar products found. Try a different image.');
      }
    } catch (err) {
      setImageError('Image search failed. Please try again.');
    } finally {
      setIsProcessingImage(false);
      e.target.value = '';
    }
  };

  // Open live camera
  const openCamera = async () => {
    setShowImageOptions(false);
    setImageError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setShowCameraModal(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setImageError('Camera permission denied or not available.');
    }
  };

  // Capture photo from video stream
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    setShowCameraModal(false);
    setIsProcessingImage(true);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      try {
        const results = await imageSearch(file);
        if (results && results.length > 0) {
          navigate('/search', { state: { results, label: 'Image Search Results' } });
        } else {
          setImageError('No similar products found. Try a different image.');
        }
      } catch (err) {
        setImageError('Image search failed. Please try again.');
      } finally {
        setIsProcessingImage(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/cart', label: 'Cart', icon: ShoppingCart },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled 
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-white/20" 
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer shrink-0"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-azure-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-1 rounded-xl border-2 border-dashed border-purple-400/30"
                />
              </div>
              <span className={cn(
                "text-xl font-bold hidden sm:block transition-colors duration-300",
                isScrolled ? "text-gray-900" : "text-gray-900"
              )}>
                <span className="gradient-text-azure">Azure</span>Shop
              </span>
            </motion.div>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
              <motion.div 
                className={cn(
                  "relative flex items-center w-full group",
                  showSearchFocus && "z-50"
                )}
                animate={showSearchFocus ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className={cn(
                  "absolute inset-0 rounded-2xl transition-all duration-300",
                  showSearchFocus 
                    ? "bg-white shadow-2xl shadow-purple-500/20 ring-2 ring-purple-500/30" 
                    : "bg-gray-100/80 group-hover:bg-white group-hover:shadow-lg"
                )} />
                
                <Search className="relative z-10 w-5 h-5 text-gray-400 ml-4" />
                
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSearchFocus(true)}
                  onBlur={() => setShowSearchFocus(false)}
                  placeholder='Search: "shoes for wedding", "budget laptop"...'
                  className="relative z-10 flex-1 bg-transparent border-none outline-none px-3 py-3 text-gray-700 placeholder:text-gray-400"
                />
                
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    type="button"
                    onClick={() => setQuery('')}
                    className="relative z-10 p-1 mr-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </motion.button>
                )}

                <div className="relative z-10 flex items-center gap-1 pr-2">
                  {/* Voice Search Button */}
                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={startVoice}
                      disabled={isProcessingVoice}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "p-2 rounded-xl transition-all duration-300 relative",
                        listening 
                          ? "bg-red-500 text-white" 
                          : isProcessingVoice
                            ? "bg-purple-100 text-purple-600"
                            : "hover:bg-gray-200 text-gray-500"
                      )}
                    >
                      {isProcessingVoice ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : listening ? (
                        <>
                          <Mic className="w-4 h-4 animate-pulse" />
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        </>
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </motion.button>
                    
                    {/* Voice Status Tooltip */}
                    <AnimatePresence>
                      {(listening || isProcessingVoice) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50"
                        >
                          {listening ? 'Listening...' : 'Processing...'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Image Search Button */}
                  <div className="relative" ref={imageOptionsRef}>
                    <motion.button
                      type="button"
                      onClick={() => !isProcessingImage && setShowImageOptions(prev => !prev)}
                      disabled={isProcessingImage}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "p-2 rounded-xl transition-all duration-300",
                        isProcessingImage
                          ? "bg-purple-100 text-purple-600"
                          : showImageOptions
                            ? "bg-gray-200 text-gray-700"
                            : "hover:bg-gray-200 text-gray-500"
                      )}
                    >
                      {isProcessingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </motion.button>
                    
                    {/* Image Options Dropdown */}
                    <AnimatePresence>
                      {showImageOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[160px]"
                        >
                          <button
                            onClick={() => { setShowImageOptions(false); fileRef.current.click(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Image
                          </button>
                          <div className="border-t border-gray-100" />
                          <button
                            onClick={openCamera}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                            Take Photo
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Image Status Tooltip */}
                    <AnimatePresence>
                      {isProcessingImage && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50"
                        >
                          Analyzing image...
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-1 px-4 py-2 bg-gradient-to-r from-azure-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
                  >
                    Search
                  </motion.button>
                </div>
              </motion.div>
              
              <input 
                ref={fileRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <motion.button
                onClick={() => navigate('/cart')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative p-2.5 rounded-xl transition-all duration-300",
                  location.pathname === '/cart'
                    ? "bg-gradient-to-r from-azure-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                    : "hover:bg-gray-100 text-gray-600"
                )}
              >
                <ShoppingCart className="w-5 h-5" />
                <CartBadge />
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Search - Visible on small screens */}
        <div className="md:hidden px-4 pb-3 relative z-40">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-1">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent border-none outline-none px-2 text-sm"
              />
              <button
                type="button"
                onClick={startVoice}
                disabled={isProcessingVoice}
                className={cn(
                  "p-1.5 rounded-lg transition-colors flex-shrink-0 z-40",
                  listening ? "bg-red-500 text-white" : "text-gray-500"
                )}
              >
                {isProcessingVoice ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
              <div className="relative" ref={imageOptionsRef}>
                <button
                  type="button"
                  onClick={() => !isProcessingImage && setShowImageOptions(prev => !prev)}
                  disabled={isProcessingImage}
                  className="p-1.5 text-gray-500 flex-shrink-0 z-40"
                >
                  {isProcessingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                
                {/* Mobile Image Options Dropdown */}
                <AnimatePresence>
                  {showImageOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-1 right-0 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60] min-w-[140px]"
                    >
                      <button
                        onClick={() => { setShowImageOptions(false); fileRef.current?.click(); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                      </button>
                      <div className="border-t border-gray-100" />
                      <button
                        onClick={openCamera}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Photo
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </form>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden flex flex-col"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-bold text-lg">Menu</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Links */}
              <div className="flex-1 p-4 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      navigate(link.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-medium transition-all",
                      location.pathname === link.path
                        ? "bg-gradient-to-r from-azure-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </motion.button>
                ))}
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">Powered by Azure AI</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />

      {/* Camera Capture Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">Take a Photo</span>
                </div>
                <button
                  onClick={() => setShowCameraModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="relative bg-black aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-6 border-2 border-white/40 rounded-xl" />
                  <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-xl" />
                  <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-xl" />
                  <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-xl" />
                  <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-xl" />
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
                <p className="text-sm text-gray-500">Point camera at a product to search</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={capturePhoto}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-azure-500 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30"
                >
                  <Camera className="w-4 h-4" />
                  Capture
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast Notifications */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[999] px-6 py-3 bg-red-500 text-white rounded-xl shadow-xl flex items-center gap-3"
          >
            <Mic className="w-5 h-5" />
            <span>{voiceError}</span>
            <button 
              onClick={() => setVoiceError('')}
              className="ml-2 p-1 hover:bg-red-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        
        {imageError && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[999] px-6 py-3 bg-red-500 text-white rounded-xl shadow-xl flex items-center gap-3"
          >
            <Camera className="w-5 h-5" />
            <span>{imageError}</span>
            <button 
              onClick={() => setImageError('')}
              className="ml-2 p-1 hover:bg-red-600 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Cart Badge Component
function CartBadge() {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCount(cart.reduce((sum, item) => sum + item.qty, 0));
    };
    
    updateCount();
    window.addEventListener('storage', updateCount);
    const interval = setInterval(updateCount, 500);
    
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  if (count === 0) return null;

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
    >
      {count > 9 ? '9+' : count}
    </motion.span>
  );
}
