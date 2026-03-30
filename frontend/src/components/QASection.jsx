import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, User, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

const STORAGE_KEY = 'azureshop_qa';

const SEED_QA = [
  {
    id: 'q1',
    question: 'What constitutes the specific gold composition of this piece?',
    answer: 'This item features a high-grade 18k thick gold plating over premium sterling silver, ensuring a lasting, brilliant finish that mirrors solid gold.',
    author: 'Vikram N.',
    date: '2026-02-20',
  },
  {
    id: 'q2',
    question: 'How should I maintain the luster of this item?',
    answer: 'To preserve the finish, we recommend avoiding direct contact with perfumes or harsh chemicals. Gently polish with a soft lint-free cloth after wear.',
    author: 'Sneha R.',
    date: '2026-03-01',
  },
];

export default function QASection({ productId }) {
  const [qaList, setQaList] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const stored = all[productId] || [];
      setQaList([...SEED_QA, ...stored]);
    } catch {
      setQaList([...SEED_QA]);
    }
  }, [productId]);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const submitQuestion = (e) => {
    e.preventDefault();
    if (!question.trim()) {
       toast.error('Please specify your inquiry.');
       return;
    }
    const newQ = {
      id: `u-${Date.now()}`,
      question: question.trim(),
      answer: 'Our concierge team will respond to your inquiry shortly. Thank you for your patience.',
      author: author.trim() || 'Valued Guest',
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [...qaList, newQ];
    setQaList(updated);
    const userQa = updated.filter(q => q.id.startsWith('u-'));
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      all[productId] = userQa;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
    setQuestion('');
    setAuthor('');
    setShowForm(false);
    toast.success('Inquiry submitted successfully.', {
       style: { borderRadius: '0', background: '#111', color: '#fff' },
    });
    setExpanded(prev => ({ ...prev, [newQ.id]: true }));
  };

  return (
    <div className="mt-20">
      <div className="flex flex-col items-center mb-16">
        <span className="section-eyebrow">Assistance</span>
        <h2 className="font-serif text-3xl font-semibold text-ink-950 mt-2">Questions & Answers</h2>
        <div className="w-16 h-px bg-gold-400 mt-6" />
      </div>

      <div className="max-w-3xl mx-auto space-y-10 mb-20">
        {qaList.map((qa, i) => (
          <div key={qa.id} className="border-b border-cream-100 pb-10 last:border-0 hover:bg-cream-50/50 p-4 transition-colors">
            <button
              onClick={() => toggleExpand(qa.id)}
              className="w-full flex items-start gap-4 text-left group"
            >
              <span className="text-[10px] font-bold text-ink-300 mt-1 uppercase tracking-tighter shrink-0">Q.</span>
              <span className="flex-1 font-serif text-lg text-ink-900 group-hover:text-gold-500 transition-colors">{qa.question}</span>
              <div className="shrink-0 mt-1">
                {expanded[qa.id] ? <Minus className="w-4 h-4 text-ink-400" /> : <Plus className="w-4 h-4 text-ink-400" />}
              </div>
            </button>

            <AnimatePresence>
              {expanded[qa.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 pl-8 flex gap-4">
                    <span className="text-[10px] font-bold text-ink-300 mt-1 uppercase tracking-tighter shrink-0">A.</span>
                    <div className="space-y-4">
                      <p className="text-sm text-ink-600 leading-[1.8] font-sans italic">{qa.answer}</p>
                      <div className="flex items-center gap-2 text-[9px] tracking-widest text-ink-300 uppercase font-bold">
                        <span>{qa.author}</span>
                        <span className="w-1 h-1 bg-ink-200 rounded-full" />
                        <span>{new Date(qa.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Inquiry Form */}
      <div className="max-w-3xl mx-auto border border-ink-950 p-10 mt-10">
        {!showForm ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h4 className="font-serif text-xl text-ink-950 mb-2">Still have inquiries?</h4>
              <p className="text-[10px] tracking-[0.2em] font-bold uppercase text-ink-400">Our concierge is at your service</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              ASK A QUESTION
            </button>
          </div>
        ) : (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={submitQuestion}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
               <h4 className="font-serif text-xl text-ink-950">Inquiry Details</h4>
               <button type="button" onClick={() => setShowForm(false)} className="text-[9px] font-bold tracking-widest uppercase text-ink-400 hover:text-ink-950">Cancel</button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.2em] font-bold uppercase text-ink-500">Contact Name</label>
                <input
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Your Name"
                  className="bg-transparent border-b border-ink-200 py-2 text-sm focus:border-ink-950 outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] tracking-[0.2em] font-bold uppercase text-ink-500">Your Inquiry *</label>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  required
                  placeholder="How can we assist you?"
                  className="bg-transparent border-b border-ink-200 py-2 text-sm focus:border-ink-950 outline-none transition-colors"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full">SUBMIT INQUIRY</button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
