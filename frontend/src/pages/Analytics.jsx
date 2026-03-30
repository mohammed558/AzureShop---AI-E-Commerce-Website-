import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Eye, Search, Package, Clock, BarChart2 } from 'lucide-react';
import { getAnalyticsData } from '../lib/useAnalytics';

const CHART_COLORS = ['#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm" style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(getAnalyticsData());
    // Refresh data every 5 seconds in case user opens products in other tabs
    const interval = setInterval(() => setData(getAnalyticsData()), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const isEmpty = data.totalViews === 0 && data.totalSearches === 0;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-500 mb-6"
        >
          <button
            onClick={() => navigate('/')}
            className="hover:text-gray-900 transition-colors shrink-0 cursor-pointer"
          >
            Home
          </button>
          <span className="shrink-0">/</span>
          <span className="text-gray-900 font-medium">Analytics</span>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Analytics</h1>
            <p className="text-sm text-gray-500">Your personalized activity dashboard — powered by local data</p>
          </div>
        </motion.div>

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mb-6">
              <BarChart2 className="w-12 h-12 text-purple-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No data yet</h2>
            <p className="text-gray-500 max-w-sm">
              Browse some products and run some searches — your activity will appear here as interactive charts.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Eye} label="Total Product Views" value={data.totalViews} color="bg-gradient-to-br from-purple-500 to-indigo-600" delay={0} />
              <StatCard icon={Search} label="Total Searches" value={data.totalSearches} color="bg-gradient-to-br from-azure-500 to-cyan-500" delay={0.1} />
              <StatCard icon={Package} label="Unique Products Viewed" value={data.uniqueProducts} color="bg-gradient-to-br from-amber-400 to-orange-500" delay={0.2} />
              <StatCard icon={TrendingUp} label="Avg. Views/Product" value={data.uniqueProducts > 0 ? (data.totalViews / data.uniqueProducts).toFixed(1) : 0} color="bg-gradient-to-br from-emerald-400 to-teal-500" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart — Top Viewed Products */}
              {data.topProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-500" />
                    Most Viewed Products
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">Top {data.topProducts.length} products by views</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.topProducts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="views" name="Views" radius={[6, 6, 0, 0]}>
                        {data.topProducts.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Line Chart — Search Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-azure-500" />
                  Search Activity
                </h3>
                <p className="text-xs text-gray-400 mb-6">Searches over the past 7 days</p>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.searchActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Searches"
                      stroke="#0ea5e9"
                      strokeWidth={2.5}
                      dot={{ fill: '#0ea5e9', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart — Category Distribution */}
              {data.categoryData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-500" />
                    Category Interests
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">Based on viewed products</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={data.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data.categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span style={{ fontSize: 12, color: '#374151' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              )}

              {/* Recent Searches */}
              {data.recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    Recent Searches
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">Your last {data.recentSearches.length} searches</p>
                  <div className="space-y-2">
                    {data.recentSearches.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.04 }}
                        className="flex items-center gap-3 py-2.5 px-3 bg-gray-50 rounded-xl"
                      >
                        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="flex-1 text-sm text-gray-700 font-medium">{s.query}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(s.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
