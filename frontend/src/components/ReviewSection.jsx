import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, User, MessageSquare, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'azureshop_reviews';
const MOCK_REVIEWS = [
  { id: 'r1', author: 'Ananya S.', rating: 5, date: '2026-03-22', title: 'Exceptional Quality', text: 'The attention to detail in this piece is truly impressive. It arrived beautifully packaged and the material feels incredibly premium.', helpful: 14 },
  { id: 'r2', author: 'Ishaan V.', rating: 4, date: '2026-03-18', title: 'Sophisticated Choice', text: 'A very elegant addition to my collection. The finish is exactly as shown in the photographs. Highly satisfied.', helpful: 8 },
  { id: 'r3', author: 'Meera K.', rating: 5, date: '2026-03-10', title: 'Timed Perfection', text: 'The design language is timeless. I appreciate the minimalist approach that still feels substantial.', helpful: 21 },
];

function StarRating({ value, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const sz = size === 'lg' ? 'w-6 h-6' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={cn('transition-transform', onChange && 'hover:scale-110 cursor-pointer')}
        >
          <Star
            className={cn(sz, 'transition-colors',
              star <= (hover || value)
                ? 'fill-gold-500 text-gold-500'
                : 'text-ink-100'
            )}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-bold text-ink-900 w-4 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-cream-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-gold-400"
        />
      </div>
      <span className="text-[10px] text-ink-300 w-8 text-right shrink-0">{count}</span>
    </div>
  );
}

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', text: '', author: '' });

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const stored = all[productId] || [];
      setReviews([...MOCK_REVIEWS, ...stored]);
    } catch {
      setReviews([...MOCK_REVIEWS]);
    }
  }, [productId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(n => ({
    label: n,
    count: reviews.filter(r => r.rating === n).length,
  }));

  const submitReview = (e) => {
    e.preventDefault();
    if (!form.rating || !form.text.trim()) {
      toast.error('Please provide a rating and a review body.');
      return;
    }
    const newReview = {
      id: `u-${Date.now()}`,
      author: form.author.trim() || 'Anonymous Collector',
      rating: form.rating,
      date: new Date().toISOString().split('T')[0],
      title: form.title.trim() || 'Valued Feedback',
      text: form.text.trim(),
      helpful: 0,
    };
    const updated = [...reviews, newReview];
    setReviews(updated);
    const userReviews = updated.filter(r => r.id.startsWith('u-'));
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      all[productId] = userReviews;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
    setForm({ rating: 0, title: '', text: '', author: '' });
    setShowForm(false);
    toast.success('Your feedback has been curated. Thank you!', {
       style: { borderRadius: '0', background: '#111', color: '#fff' },
    });
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="mt-20">
      <div className="flex flex-col items-center mb-16">
        <span className="section-eyebrow">Client Feedback</span>
        <h2 className="font-serif text-3xl font-semibold text-ink-950 mt-2">Reviews & Ratings</h2>
        <div className="w-16 h-px bg-gold-400 mt-6" />
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Left: Summary */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-10">
          <div className="flex items-center gap-8 border-b border-cream-200 pb-10">
            <div className="text-6xl font-serif font-light text-ink-950 italic">{avgRating}</div>
            <div className="space-y-1">
              <StarRating value={Math.round(avgRating)} />
              <div className="text-[10px] tracking-widest uppercase text-ink-400">{reviews.length} Verified Reviews</div>
            </div>
          </div>

          <div className="space-y-4">
            {ratingCounts.map(({ label, count }) => (
              <RatingBar key={label} label={label} count={count} total={reviews.length} />
            ))}
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-outline w-full py-4 text-[11px] tracking-widest"
          >
            {showForm ? 'CANCEL REVIEW' : 'WRITE A REVIEW'}
          </button>
        </div>

        {/* Right: List & Form */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-cream-50 p-8 border border-cream-200 mb-10"
              >
                <form onSubmit={submitReview} className="space-y-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] tracking-[0.2em] font-bold uppercase text-ink-500">Your Selection *</label>
                    <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} size="lg" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] tracking-[0.2em] font-bold uppercase text-ink-500">Full Name</label>
                       <input
                        value={form.author}
                        onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                        placeholder="e.g. Elena R."
                        className="bg-transparent border-b border-ink-200 py-2 text-sm focus:border-ink-950 outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] tracking-[0.2em] font-bold uppercase text-ink-500">Subject</label>
                       <input
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Summarize your thoughts"
                        className="bg-transparent border-b border-ink-200 py-2 text-sm focus:border-ink-950 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] tracking-[0.2em] font-bold uppercase text-ink-500">Review *</label>
                    <textarea
                      value={form.text}
                      onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                      rows={4}
                      placeholder="Share your detailed experience..."
                      className="bg-transparent border border-ink-200 p-4 text-sm focus:border-ink-950 outline-none transition-colors resize-none"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full sm:w-auto">SUBMIT REVIEW</button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-12">
            {displayedReviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group border-b border-cream-100 pb-12 last:border-0"
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 border border-cream-200 flex items-center justify-center shrink-0 uppercase text-[10px] font-bold text-ink-400 tracking-tighter">
                    {review.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-serif text-base font-semibold text-ink-950">{review.title}</h4>
                        <div className="flex items-center gap-3">
                          <StarRating value={review.rating} />
                          <span className="text-[10px] text-ink-400 font-bold uppercase tracking-widest">{review.author}</span>
                        </div>
                      </div>
                      <span className="text-[9px] tracking-widest text-ink-300 uppercase">{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <p className="text-ink-600 text-sm leading-[1.8] font-sans italic">"{review.text}"</p>

                    <button className="flex items-center gap-2 text-[9px] tracking-[0.2em] font-bold uppercase text-ink-400 hover:text-gold-500 transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {reviews.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[11px] tracking-[0.3em] uppercase font-bold text-ink-900 border-b border-ink-900 w-fit mx-auto pt-4 hover:text-gold-500 hover:border-gold-500 transition-all"
            >
              {showAll ? 'SHOW LESS' : `READ ALL ${reviews.length} REVIEWS`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
