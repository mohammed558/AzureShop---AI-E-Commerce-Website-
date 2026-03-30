const VIEWS_KEY = 'azureshop_product_views';
const SEARCHES_KEY = 'azureshop_searches';

// Track a product view
export function trackProductView(product) {
  try {
    const views = JSON.parse(localStorage.getItem(VIEWS_KEY) || '{}');
    if (!views[product.id]) {
      views[product.id] = { ...product, count: 0, lastViewed: null };
    }
    views[product.id].count += 1;
    views[product.id].lastViewed = new Date().toISOString();
    localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
  } catch {}
}

// Track a search query
export function trackSearch(query) {
  if (!query || query === '*') return;
  try {
    const searches = JSON.parse(localStorage.getItem(SEARCHES_KEY) || '[]');
    searches.unshift({ query, timestamp: new Date().toISOString() });
    // Keep last 50
    localStorage.setItem(SEARCHES_KEY, JSON.stringify(searches.slice(0, 50)));
  } catch {}
}

// Get analytics data
export function getAnalyticsData() {
  try {
    const viewsMap = JSON.parse(localStorage.getItem(VIEWS_KEY) || '{}');
    const searches = JSON.parse(localStorage.getItem(SEARCHES_KEY) || '[]');

    const topProducts = Object.values(viewsMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(p => ({
        name: p.name?.length > 18 ? p.name.slice(0, 18) + '…' : p.name || 'Unknown',
        views: p.count,
        category: p.category || 'Other',
      }));

    // Search activity per day (last 7 days)
    const dayMap = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dayMap[key] = 0;
    }
    searches.forEach(s => {
      const key = new Date(s.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (dayMap[key] !== undefined) dayMap[key]++;
    });
    const searchActivity = Object.entries(dayMap).map(([date, count]) => ({ date, count }));

    // Category distribution
    const catMap = {};
    Object.values(viewsMap).forEach(p => {
      const cat = p.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + (p.count || 1);
    });
    const categoryData = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    const totalViews = Object.values(viewsMap).reduce((s, p) => s + p.count, 0);
    const uniqueProducts = Object.keys(viewsMap).length;

    return {
      topProducts,
      searchActivity,
      categoryData,
      recentSearches: searches.slice(0, 10),
      totalViews,
      totalSearches: searches.length,
      uniqueProducts,
    };
  } catch {
    return {
      topProducts: [],
      searchActivity: [],
      categoryData: [],
      recentSearches: [],
      totalViews: 0,
      totalSearches: 0,
      uniqueProducts: 0,
    };
  }
}
