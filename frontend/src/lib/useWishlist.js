import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'azureshop_wishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const sync = () => {
      try {
        setWishlist(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
      } catch {
        setWishlist([]);
      }
    };
    window.addEventListener('wishlist-update', sync);
    return () => window.removeEventListener('wishlist-update', sync);
  }, []);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      const next = exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event('wishlist-update'));
      
      if (exists) {
        toast('Removed from wishlist', { icon: '💔' });
      } else {
        toast.success('Added to wishlist', { icon: '❤️' });
      }
      return next;
    });
  };

  const isWishlisted = (id) => wishlist.some(p => p.id === id);

  const clearWishlist = () => {
    localStorage.setItem(STORAGE_KEY, '[]');
    setWishlist([]);
    window.dispatchEvent(new Event('wishlist-update'));
  };

  return { wishlist, toggleWishlist, isWishlisted, clearWishlist };
}
