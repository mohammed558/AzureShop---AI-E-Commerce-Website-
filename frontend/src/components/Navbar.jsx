import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Mic, Camera, ShoppingBag, Heart, Upload, X, Loader2, Clock, TrendingUp, BarChart2, Menu } from 'lucide-react';
import { voiceSearch, imageSearch } from '../services/api';
import { useWishlist } from '../lib/useWishlist';
import { trackSearch } from '../lib/useAnalytics';
import toast from 'react-hot-toast';

const TRENDING_SEARCHES = [
  'wireless headphones', 'running shoes', 'laptop', 'smartwatch',
  'bluetooth speaker', 'gaming mouse', 'yoga mat', 'coffee maker',
];
const SEARCH_HISTORY_KEY = 'azureshop_search_history';
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveSearchHistory(history) {
  try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 8))); } catch {}
}

// ─── Promo messages cycling in the top bar ─────────────────────────
const PROMOS = [
  'FREE SHIPPING ON ORDERS ABOVE ₹999',
  'AI-POWERED SEARCH — FIND ANYTHING INSTANTLY',
  'NEW ARRIVALS EVERY WEEK',
];

export default function Navbar() {
  const [query, setQuery]           = useState('');
  const [listening, setListening]   = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions]   = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showImageOptions, setShowImageOptions]   = useState(false);
  const [showCameraModal, setShowCameraModal]     = useState(false);
  const [searchHistory, setSearchHistory] = useState(getSearchHistory);
  const [promoIndex, setPromoIndex]       = useState(0);

  const fileRef         = useRef();
  const videoRef        = useRef();
  const canvasRef       = useRef();
  const streamRef       = useRef(null);
  const imageOptionsRef = useRef();
  const suggestionsRef  = useRef();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { wishlist } = useWishlist();

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cycle promo bar
  useEffect(() => {
    const t = setInterval(() => setPromoIndex(i => (i + 1) % PROMOS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Outside-click dismissals
  useEffect(() => {
    const handler = (e) => {
      if (imageOptionsRef.current && !imageOptionsRef.current.contains(e.target)) setShowImageOptions(false);
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Stop camera stream
  useEffect(() => {
    if (!showCameraModal && streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, [showCameraModal]);

  // Clear search on home
  useEffect(() => {
    if (location.pathname === '/') setQuery('');
  }, [location.pathname]);

  // ─── Text Search ─────────────────────────────────────────────────
  const handleSearch = (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (q) {
      const hist = [q, ...searchHistory.filter(h => h !== q)];
      saveSearchHistory(hist);
      setSearchHistory(hist.slice(0, 8));
      trackSearch(q);
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
    const hist = [term, ...searchHistory.filter(h => h !== term)];
    saveSearchHistory(hist);
    setSearchHistory(hist.slice(0, 8));
    trackSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setShowSuggestions(false);
  };

  const clearHistory = () => { saveSearchHistory([]); setSearchHistory([]); };

  // ─── Voice Search ─────────────────────────────────────────────────
  const startVoice = async () => {
    if (listening || isProcessingVoice) return;
    setListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        setListening(false);
        setIsProcessingVoice(true);
        try {
          const initialBlob = new Blob(chunks);
          const arrayBuffer = await initialBlob.arrayBuffer();
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          const { encodeWAV } = await import('../lib/wavEncoder');
          const wavBlob = await encodeWAV(audioBuffer);
          const res = await voiceSearch(wavBlob);
          if (res.text) {
            setQuery(res.text);
            navigate(`/search?q=${encodeURIComponent(res.text)}`);
            toast.success(`Searching: "${res.text}"`);
          } else {
            toast.error('Could not understand audio. Please try again.');
          }
        } catch (err) {
          toast.error('Voice search failed. Please try again.');
        } finally {
          setIsProcessingVoice(false);
          stream.getTracks().forEach(t => t.stop());
        }
      };
      recorder.onerror = () => { setListening(false); toast.error('Recording error.'); };
      recorder.start();
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 4000);
    } catch {
      setListening(false);
      toast.error('Microphone not available.');
    }
  };

  // ─── Image Search ────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessingImage(true);
    try {
      const results = await imageSearch(file);
      if (results?.length > 0) {
        toast.success(`Found ${results.length} similar products!`);
        navigate('/search', { state: { results, label: 'Visual Search Results' } });
      } else {
        toast.error('No similar products found.');
      }
    } catch { toast.error('Image search failed.'); }
    finally { setIsProcessingImage(false); e.target.value = ''; }
  };

  const openCamera = async () => {
    setShowImageOptions(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setShowCameraModal(true);
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); } }, 100);
    } catch { toast.error('Camera not available.'); }
  };

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
        if (results?.length > 0) {
          toast.success(`Found ${results.length} similar products!`);
          navigate('/search', { state: { results, label: 'Camera Search Results' } });
        } else { toast.error('No similar products found.'); }
      } catch { toast.error('Image search failed.'); }
      finally { setIsProcessingImage(false); }
    }, 'image/jpeg', 0.85);
  };

  const suggestions = query.length > 0
    ? TRENDING_SEARCHES.filter(t => t.toLowerCase().includes(query.toLowerCase()))
    : [];
  const showDropdown = showSuggestions && (query ? suggestions.length > 0 : searchHistory.length > 0 || TRENDING_SEARCHES.length > 0);

  return (
    <>
      {/* ── Top Promo Bar ─────────────────────────────────────────── */}
      <div className="bg-[#111111] text-white h-8 sm:h-9 flex items-center justify-center overflow-hidden relative px-2 sm:px-0">
        <AnimatePresence mode="wait">
          <motion.p
            key={promoIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-medium font-sans absolute text-center"
          >
            {PROMOS[promoIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Main Navbar ───────────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${isScrolled ? 'shadow-[0_1px_0_0_#E0E0E0]' : 'border-b border-[#E0E0E0]'}`}>
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10">
          <div className="flex items-center h-14 sm:h-16 gap-2 sm:gap-4 lg:gap-8">

            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="shrink-0 font-serif text-base sm:text-xl font-bold tracking-[0.08em] text-[#111111] uppercase"
            >
              AzureShop
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-7 ml-2">
              {[
                { label: 'New In', path: '/search?q=new' },
                { label: 'Electronics', path: '/search?q=electronics' },
                { label: 'Fashion', path: '/search?q=fashion' },
                { label: 'Home', path: '/search?q=home' },
                { label: 'Sports', path: '/search?q=sports' },
              ].map(nav => (
                <button
                  key={nav.label}
                  onClick={() => navigate(nav.path)}
                  className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#3a3a3a] hover:text-[#111] transition-colors duration-200"
                >
                  {nav.label}
                </button>
              ))}
            </nav>

            {/* Search Bar */}
            <div ref={suggestionsRef} className="flex-1 max-w-xl relative min-w-0">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center bg-[#f4f4f4] px-2 sm:px-4 h-9 sm:h-10 gap-1 sm:gap-2">
                  <Search className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#7a7a7a] shrink-0" />
                  <input
                    value={query}
                    onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder='Search...'
                    className="flex-1 bg-transparent text-[11px] sm:text-[13px] text-[#111] placeholder:text-[#9a9a9a] outline-none min-w-0"
                  />
                  {query && (
                    <button type="button" onClick={() => { setQuery(''); setShowSuggestions(false); }} className="p-0.5 text-[#9a9a9a] hover:text-[#111] shrink-0">
                      <X className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    </button>
                  )}

                  {/* Voice */}
                  <button type="button" onClick={startVoice} className="p-0.5 text-[#7a7a7a] hover:text-[#111] transition-colors shrink-0">
                    {listening ? <Loader2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-spin text-[#b8942a]" /> :
                     isProcessingVoice ? <Loader2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-spin" /> :
                     <Mic className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                  </button>

                  {/* Image Search */}
                  <div ref={imageOptionsRef} className="relative">
                    <button type="button" onClick={() => setShowImageOptions(v => !v)} className="p-0.5 text-[#7a7a7a] hover:text-[#111] transition-colors shrink-0">
                      {isProcessingImage ? <Loader2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-spin" /> : <Camera className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
                    </button>
                    <AnimatePresence>
                      {showImageOptions && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute right-0 top-8 bg-white border border-[#e0e0e0] shadow-lg py-1 min-w-[180px] z-50"
                        >
                          <button
                            onClick={() => { setShowImageOptions(false); fileRef.current?.click(); }}
                            className="w-full text-left px-4 py-2.5 text-[12px] tracking-wide text-[#3a3a3a] hover:bg-[#f4f4f4] flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" /> Upload Photo
                          </button>
                          <button
                            onClick={openCamera}
                            className="w-full text-left px-4 py-2.5 text-[12px] tracking-wide text-[#3a3a3a] hover:bg-[#f4f4f4] flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" /> Use Camera
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute top-full left-0 right-0 bg-white border border-[#e0e0e0] border-t-0 shadow-lg z-50 max-h-72 overflow-y-auto"
                    >
                      {query === '' && searchHistory.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between px-4 pt-3 pb-1">
                            <span className="text-[10px] tracking-[0.15em] uppercase text-[#7a7a7a]">Recent</span>
                            <button onClick={clearHistory} className="text-[10px] text-[#7a7a7a] hover:text-[#111] tracking-wide uppercase">Clear</button>
                          </div>
                          {searchHistory.map((h, i) => (
                            <button key={i} onClick={() => handleSuggestionClick(h)}
                              className="w-full text-left px-4 py-2 text-[12px] text-[#3a3a3a] hover:bg-[#f4f4f4] flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#9a9a9a]" /> {h}
                            </button>
                          ))}
                          <div className="border-t border-[#e0e0e0] mt-1" />
                        </div>
                      )}
                      {query === '' && (
                        <div>
                          <div className="px-4 pt-3 pb-1">
                            <span className="text-[10px] tracking-[0.15em] uppercase text-[#7a7a7a]">Trending</span>
                          </div>
                          {TRENDING_SEARCHES.map((t, i) => (
                            <button key={i} onClick={() => handleSuggestionClick(t)}
                              className="w-full text-left px-4 py-2 text-[12px] text-[#3a3a3a] hover:bg-[#f4f4f4] flex items-center gap-2">
                              <TrendingUp className="w-3.5 h-3.5 text-[#9a9a9a]" /> {t}
                            </button>
                          ))}
                        </div>
                      )}
                      {query !== '' && suggestions.map((s, i) => (
                        <button key={i} onClick={() => handleSuggestionClick(s)}
                          className="w-full text-left px-4 py-2.5 text-[12px] text-[#3a3a3a] hover:bg-[#f4f4f4] flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-[#9a9a9a]" /> {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-5 ml-auto shrink-0">
              <button onClick={() => navigate('/analytics')} title="Analytics" className="hidden md:flex text-[#3a3a3a] hover:text-[#111] transition-colors">
                <BarChart2 className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
              <button onClick={() => navigate('/wishlist')} className="relative text-[#3a3a3a] hover:text-[#111] transition-colors">
                <Heart className="w-4 sm:w-5 h-4 sm:h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#111] text-white text-[7px] sm:text-[9px] font-bold flex items-center justify-center rounded-full">
                    {wishlist.length > 9 ? '9+' : wishlist.length}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/cart')} className="relative text-[#3a3a3a] hover:text-[#111] transition-colors">
                <ShoppingBag className="w-4 sm:w-5 h-4 sm:h-5" />
                <CartBadge />
              </button>
              {/* Mobile menu */}
              <button onClick={() => setIsMobileMenuOpen(v => !v)} className="lg:hidden text-[#3a3a3a] hover:text-[#111]">
                {isMobileMenuOpen ? <X className="w-4 sm:w-5 h-4 sm:h-5" /> : <Menu className="w-4 sm:w-5 h-4 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-[#e0e0e0] bg-white overflow-hidden"
            >
              <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-col gap-1">
                {[
                  { label: 'New In', path: '/search?q=new' },
                  { label: 'Electronics', path: '/search?q=electronics' },
                  { label: 'Fashion', path: '/search?q=fashion' },
                  { label: 'Home & Garden', path: '/search?q=home' },
                  { label: 'Sports', path: '/search?q=sports' },
                  { label: 'Analytics', path: '/analytics' },
                ].map(nav => (
                  <button
                    key={nav.label}
                    onClick={() => { navigate(nav.path); setIsMobileMenuOpen(false); }}
                    className="text-left text-[12px] tracking-[0.12em] uppercase font-medium text-[#3a3a3a] py-3 border-b border-[#f4f4f4] hover:text-[#111]"
                  >
                    {nav.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Camera Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0]">
                <h3 className="font-serif text-base font-semibold tracking-wide">Visual Search</h3>
                <button onClick={() => setShowCameraModal(false)} className="text-[#7a7a7a] hover:text-[#111]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-[#f4f4f4] aspect-video flex items-center justify-center overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                <button
                  onClick={capturePhoto}
                  className="btn-primary w-full mt-6"
                >
                  Capture & Search
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CartBadge() {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    const update = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCount(cart.reduce((s, i) => s + i.qty, 0));
    };
    update();
    window.addEventListener('storage', update);
    const t = setInterval(update, 500);
    return () => { window.removeEventListener('storage', update); clearInterval(t); };
  }, []);
  if (count === 0) return null;
  return (
    <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#111] text-white text-[7px] sm:text-[9px] font-bold flex items-center justify-center rounded-full">
      {count > 9 ? '9+' : count}
    </span>
  );
}
