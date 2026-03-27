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
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none max-h-[calc(100vh-48px)]">
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="pointer-events-auto mb-4 w-[380px] max-w-[calc(100vw-48px)] max-h-[calc(100vh-120px)] bg-white rounded-3xl shadow-2xl shadow-purple-500/20 overflow-hidden border border-purple-100 flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-azure-600 via-purple-600 to-pink-500 p-4">
              <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-white/70">Powered by Azure OpenAI</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMinimized(true)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
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
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    m.role === 'user' 
                      ? "bg-gradient-to-br from-azure-500 to-purple-600" 
                      : "bg-gradient-to-br from-purple-500 to-pink-500"
                  )}>
                    {m.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                    m.role === 'user'
                      ? "bg-gradient-to-r from-azure-500 to-purple-600 text-white rounded-br-md"
                      : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-md"
                  )}>
                    <p className="leading-relaxed">{m.content}</p>
                    <span className={cn(
                      "text-[10px] mt-1 block",
                      m.role === 'user' ? "text-white/60" : "text-gray-400"
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
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
                          className="w-2 h-2 bg-purple-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about products..."
                    disabled={loading}
                    className="w-full pl-4 pr-4 py-3 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all placeholder:text-gray-400"
                  />
                </div>
                <motion.button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-4 rounded-xl flex items-center justify-center transition-all",
                    input.trim() && !loading
                      ? "bg-gradient-to-r from-azure-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                AI responses may not always be accurate
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
            className="pointer-events-auto mb-4 px-4 py-3 bg-white rounded-2xl shadow-xl border border-purple-100 cursor-pointer flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">AI Assistant</p>
              <p className="text-xs text-gray-500">Click to restore</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "pointer-events-auto relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          open 
            ? "bg-gray-800 text-white rotate-90" 
            : "bg-gradient-to-r from-azure-500 via-purple-600 to-pink-500 text-white"
        )}
        style={{
          boxShadow: open 
            ? '0 10px 40px rgba(0,0,0,0.3)' 
            : '0 10px 40px rgba(168, 85, 247, 0.4)'
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
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
          />
        )}
        
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(168, 85, 247, 0.4)',
              '0 0 0 20px rgba(168, 85, 247, 0)',
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
}
