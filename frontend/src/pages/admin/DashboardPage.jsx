import React, { useEffect, useState } from 'react';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Package,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../../services/api';
import CollectionAnalytics from '../../components/admin/CollectionAnalytics';
import FeedbackAnalytics from '../../components/admin/FeedbackAnalytics';
import ReviewAnalytics from '../../components/admin/ReviewAnalytics';
import RetentionAnalytics from '../../components/admin/RetentionAnalytics';
import LaunchAnalytics from '../../components/admin/LaunchAnalytics';
import PersonaAnalytics from '../../components/admin/PersonaAnalytics';

// ── Brand Donut Colors ──────────────────────────────────────────────────────
const BRAND_COLORS = [
  '#800000', // Maroon (KIXX primary)
  '#111111', // Near-black
  '#4A3728', // Espresso
  '#8B4513', // Saddle brown
  '#CC7722', // Ochre
  '#555555', // Mid-gray
  '#A0522D', // Sienna
  '#2F4F4F', // Dark slate
];

// ── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, accent = '#800000', subtext }) {
  return (
    <div
      className="relative bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]
                 border border-gray-100 overflow-hidden
                 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5
                 transition-all duration-300 group"
    >
      {/* Accent bar */}
      <div
        className="absolute top-0 left-0 w-full h-[3px]"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-3xl font-black tracking-tight text-gray-900">
            {value}
          </p>
          {subtext && (
            <p className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              {subtext}
            </p>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center
                      transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${accent}12` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
      </div>
    </div>
  );
}

// ── Custom Donut Tooltip ────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-xl border border-gray-100">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">{d.name}</p>
      <p className="text-lg font-black text-gray-900">
        ₹{Number(d.value).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

// ── Custom Legend ────────────────────────────────────────────────────────────
function CustomLegend({ payload }) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          {entry.value}
        </div>
      ))}
    </div>
  );
}

// ── Stock Badge ──────────────────────────────────────────────────────────────
function StockBadge({ stock }) {
  const s = parseInt(stock, 10) || 0;
  if (s <= 0)
    return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-red-100 text-red-700">Out</span>;
  if (s <= 10)
    return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-700">Low</span>;
  return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700">OK</span>;
}

// ═════════════════════════════════════════════════════════════════════════════
// Dashboard Page
// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [brandData, setBrandData] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [statsRes, brandRes, stockRes] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get('/api/admin/sales-by-brand'),
          api.get('/api/admin/inventory-alerts'),
        ]);

        setStats(statsRes.data);
        setBrandData(
          (brandRes.data.data || []).map((b) => ({
            name: b.brand,
            value: parseInt(b.sales, 10) || 0,
          }))
        );
        setLowStock(stockRes.data.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#800000]" />
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Loading Analytics…
        </p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-lg font-bold text-gray-900">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2.5 bg-[#800000] text-white text-sm font-bold rounded-xl
                     hover:bg-[#600000] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalBrandSales = brandData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 font-medium mt-1">
          Real-time overview of your KIXX storefront
        </p>
      </div>

      {/* ── Launch Strategy Command Center ────────────────────────────── */}
      <LaunchAnalytics />

      {/* ── Audience Segmentation Analysis ─────────────────────────────── */}
      <PersonaAnalytics />

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${(stats?.revenue ?? 0).toLocaleString('en-IN')}`}
          accent="#800000"
          subtext="Lifetime"
        />
        <KPICard
          icon={ShoppingBag}
          label="Total Orders"
          value={(stats?.totalOrders ?? 0).toLocaleString('en-IN')}
          accent="#111111"
          subtext="All time"
        />
        <KPICard
          icon={Users}
          label="Total Customers"
          value={(stats?.totalCustomers ?? 0).toLocaleString('en-IN')}
          accent="#4A3728"
          subtext="Registered"
        />
      </div>

      {/* ── Community Archive Analytics ──────────────────────────────── */}
      <CollectionAnalytics />

      {/* ── System Health & User Feedback ─────────────────────────── */}
      <FeedbackAnalytics />

      {/* ── Customer Sentiment & Review Analysis ─────────────────── */}
      <ReviewAnalytics />

      {/* ── User Retention & Campaign Data ────────────────────────── */}
      <div className="bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
        <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight mb-6">User Retention & Campaign Data</h2>
        <RetentionAnalytics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Donut Chart */}
        <div
          className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]
                     border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                Sales by Brand
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Revenue distribution across brands
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-bold bg-gray-100 text-gray-500 rounded-full uppercase tracking-wider">
              All Time
            </span>
          </div>

          {brandData.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={brandData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  stroke="none"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {brandData.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={BRAND_COLORS[i % BRAND_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[340px] flex items-center justify-center text-gray-400 text-sm font-medium">
              No sales data available yet.
            </div>
          )}

          {/* Brand breakdown list */}
          {brandData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {brandData.map((b, i) => (
                <div key={b.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: BRAND_COLORS[i % BRAND_COLORS.length] }}
                    />
                    <span className="font-semibold text-gray-700">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">
                      ₹{b.value.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {totalBrandSales > 0
                        ? `${Math.round((b.value / totalBrandSales) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]
                     border border-gray-100"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                Inventory Alerts
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Lowest stock items
              </p>
            </div>
            <Package className="w-5 h-5 text-gray-300" />
          </div>

          {lowStock.length > 0 ? (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80
                             transition-colors duration-200"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      ₹{Number(item.basePrice).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StockBadge stock={item.stock} />
                    <span className="text-xs font-bold text-gray-500">
                      {item.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm font-medium">
              All stock levels are healthy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
