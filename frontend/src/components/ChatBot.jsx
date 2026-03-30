import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  Minimize2
} from 'lucide-react';
import { sendChat } from '../services/api';
import { cn } from '../lib/utils';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: 'Hi! I am your AI Shopping Assistant powered by Azure OpenAI. How can I help you find the perfect products today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) {
      inputRef.current?.focus();
    }
  }, [open, minimized]);

  const send = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = { 
      role: 'user', 
      content: input.trim(),
      timestamp: new Date()
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const res = await sendChat(userMsg.content, messages);
      setTimeout(() => {
        setMessages([...updated, { 
          role: 'assistant', 
          content: res.reply,
          timestamp: new Date()
        }]);
        setIsTyping(false);
        setLoading(false);
      }, 500);
    } catch {
      setMessages([...updated, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
      setIsTyping(false);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end pointer-events-none max-h-[calc(100vh-48px)]">
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto mb-4 w-[calc(100vw-32px)] sm:w-[380px] max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl shadow-black/15 overflow-hidden border border-cream-200 flex flex-col"
          >
            {/* Header - Elegant Ink & Gold */}
            <div className="relative bg-ink-950 p-4">
              <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle, #c9a227 1px, transparent 1px)', backgroundSize: '50px 50px'}} />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gold-400/10 backdrop-blur-sm flex items-center justify-center border border-gold-400/30">
                      <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-gold-400" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gold-400 rounded-full border-2 border-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif text-xs sm:text-sm font-semibold text-white">AI Concierge</h3>
                    <p className="text-[10px] sm:text-xs text-ink-300">Azure Intelligence</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMinimized(true)}
                    className="p-2 hover:bg-white/10 rounded-lg text-ink-300 hover:text-white transition-colors"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg text-ink-300 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-cream-50/50">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={cn(
                    "flex gap-3",
                    m.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    m.role === 'user' 
                      ? "bg-ink-900" 
                      : "bg-gold-400/10 border border-gold-400/30"
                  )}>
                    {m.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-gold-400" />
                    )}
                  </div>
                  <div className={cn(
                    "max-w-[75%] rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm",
                    m.role === 'user'
                      ? "bg-ink-900 text-white rounded-br-md font-sans"
                      : "bg-white text-ink-700 shadow-sm border border-cream-200 rounded-bl-md font-sans"
                  )}>
                    <p className="leading-relaxed">{m.content}</p>
                    <span className={cn(
                      "text-[9px] sm:text-[10px] mt-1 block",
                      m.role === 'user' ? "text-ink-400" : "text-ink-400"
                    )}>
                      {formatTime(m.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                  </div>
                  <div className="bg-white rounded-xl rounded-bl-md px-4 py-3 shadow-sm border border-cream-200">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ 
                            duration: 0.5, 
                            repeat: Infinity, 
                            delay: i * 0.1 
                          }}
                          className="w-2 h-2 bg-gold-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 bg-white border-t border-cream-200">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you're looking for..."
                    disabled={loading}
                    className="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2 sm:py-3 bg-cream-50 border border-cream-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/30 focus:border-gold-400/50 transition-all placeholder:text-ink-400 font-sans"
                  />
                </div>
                <motion.button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-2 sm:px-4 rounded-lg flex items-center justify-center transition-all font-sans text-xs sm:text-sm font-medium",
                    input.trim() && !loading
                      ? "bg-ink-900 text-white hover:bg-ink-800 shadow-lg shadow-ink-900/20"
                      : "bg-cream-100 text-ink-300 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </motion.button>
              </div>
              <p className="text-[9px] sm:text-[10px] text-ink-400 mt-2 text-center font-sans">
                AI Concierge powered by Azure
              </p>
            </div>
          </motion.div>
        )}

        {open && minimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setMinimized(false)}
            className="pointer-events-auto mb-4 px-4 py-3 bg-white rounded-xl shadow-xl border border-cream-200 cursor-pointer flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-ink-900 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-950 font-serif">AI Concierge</p>
              <p className="text-xs text-ink-500 font-sans">Click to chat</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB - Elegant Gold & Ink */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "pointer-events-auto relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg shadow-2xl flex items-center justify-center transition-all duration-300",
          open 
            ? "bg-ink-900 text-white" 
            : "bg-gold-400 text-ink-950"
        )}
        style={{
          boxShadow: open 
            ? '0 10px 40px rgba(10, 10, 10, 0.3)' 
            : '0 10px 40px rgba(201, 162, 39, 0.35)'
        }}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
        
        {!open && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-ink-900 rounded-full border-2 border-gold-400"
          />
        )}
        
        <motion.div
          className="absolute inset-0 rounded-lg"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(201, 162, 39, 0.35)',
              '0 0 0 20px rgba(201, 162, 39, 0)',
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
}
