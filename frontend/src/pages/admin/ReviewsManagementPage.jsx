import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Inbox,
  RefreshCw,
  MessageSquare,
  BarChart2,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function maskEmail(email) {
  if (!email) return '—';
  // If it looks like a Firebase UID (no @), return it truncated
  if (!email.includes('@')) {
    return email.slice(0, 8) + '…' + email.slice(-4);
  }
  const [local, domain] = email.split('@');
  const visible = local.length > 3 ? local.slice(0, 3) + '***' : local;
  return `${visible}@${domain}`;
}

// ─── Mini star renderer ───────────────────────────────────────────────────────

function Stars({ rating, max = 5, size = 'sm' }) {
  const px = size === 'sm' ? 14 : 18;
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half   = !filled && i < rating;
        return (
          <Star
            key={i}
            style={{ width: px, height: px }}
            className={
              filled
                ? 'fill-amber-400 text-amber-400'
                : half
                ? 'fill-amber-200 text-amber-400'
                : 'fill-stone-100 text-stone-300'
            }
          />
        );
      })}
    </span>
  );
}

// ─── KPI card ────────────────────────────────────────────────────────────────

function KpiCard({ label, value, accent = 'border-stone-900' }) {
  return (
    <div className={`bg-white border border-stone-100 border-l-2 ${accent} px-5 py-4 rounded-sm`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-stone-900">{value}</p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VIEW 1 — Summary Table
// ═════════════════════════════════════════════════════════════════════════════

function SummaryView({ onSelect }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchSummary = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/api/admin/reviews/summary')
      .then((res) => {
        if (res.data.success) setRows(res.data.data);
        else setError('Unexpected server response.');
      })
      .catch(() => setError('Failed to load review summary.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const handleVendorReport = () => {
    setIsDrawerOpen(false);
    setToastMessage('Quality report successfully forwarded to vendor portals.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const negativeProducts = rows.filter((row) => row.avgRating <= 2.0);

  const totalReviews  = rows.reduce((s, r) => s + r.reviewCount, 0);
  const overallAvg    = rows.length
    ? (rows.reduce((s, r) => s + r.avgRating * r.reviewCount, 0) / totalReviews).toFixed(1)
    : '—';

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">
              Admin / Reviews Hub
            </p>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-stone-900">
              Review Analytics
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-[10px] uppercase tracking-widest border border-red-900 text-red-900 px-4 py-2 hover:bg-red-900 hover:text-white transition-all rounded-sm"
            >
              NEGATIVE REVIEWS
            </button>
            <button
              onClick={fetchSummary}
              className="flex items-center gap-2 px-3 py-1.5 border border-stone-200
                         text-[10px] font-bold uppercase tracking-widest text-stone-500
                         hover:bg-stone-900 hover:text-white hover:border-stone-900
                         transition-all rounded-sm"
            >
              <RefreshCw size={11} />
              Refresh
            </button>
          </div>
        </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard label="Products Reviewed" value={rows.length}    accent="border-stone-900" />
        <KpiCard label="Total Reviews"      value={totalReviews}  accent="border-amber-600" />
        <KpiCard label="Overall Avg Rating" value={overallAvg === '—' ? '—' : `${overallAvg} ★`} accent="border-emerald-600" />
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center h-48 gap-2 text-stone-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Loading reviews…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-400">
          <AlertTriangle className="w-8 h-8" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={fetchSummary}
            className="text-[10px] font-bold uppercase tracking-widest border border-red-200
                       px-4 py-2 hover:bg-red-50 transition-colors rounded-sm"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-stone-300">
          <Inbox className="w-10 h-10" />
          <p className="text-[11px] font-bold uppercase tracking-widest">No reviews submitted yet</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && rows.length > 0 && (
        <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['Product', 'Category', 'Total Reviews', 'Avg Rating', 'Action'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-[9px] font-black uppercase
                               tracking-[0.18em] text-stone-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {rows.map((row) => (
                <tr key={row.productId} className="group hover:bg-stone-50/60 transition-colors">
                  {/* Product */}
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.productName}
                          className="w-10 h-10 object-cover rounded-sm border border-stone-100 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-stone-100 rounded-sm flex items-center justify-center flex-shrink-0">
                          <BarChart2 size={14} className="text-stone-400" />
                        </div>
                      )}
                      <span className="font-semibold text-stone-900 text-[13px] line-clamp-2 max-w-[180px]">
                        {row.productName}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 align-middle">
                    <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase
                                     tracking-[0.15em] rounded-sm bg-stone-100 text-stone-600">
                      {row.category || '—'}
                    </span>
                  </td>

                  {/* Review count */}
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-stone-400" />
                      <span className="font-black text-stone-900">{row.reviewCount}</span>
                    </div>
                  </td>

                  {/* Avg rating */}
                  <td className="px-5 py-4 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900 text-base leading-none">
                        {row.avgRating.toFixed(1)}
                      </span>
                      <Stars rating={row.avgRating} />
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 align-middle">
                    <button
                      onClick={() => onSelect(row)}
                      className="border border-stone-200 text-[10px] px-3 py-1.5
                                 uppercase tracking-widest font-bold text-stone-500
                                 hover:bg-stone-900 hover:text-white hover:border-stone-900
                                 transition-all rounded-sm whitespace-nowrap"
                    >
                      View All Reviews
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-stone-900/50 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-[#F7F5F0] shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900">
            QUALITY CONTROL TRIAGE
          </h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="text-stone-400 hover:text-stone-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {negativeProducts.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No low-rated products found.</p>
          ) : (
            negativeProducts.map((p) => (
              <div key={p.productId} className="flex items-center gap-3 bg-white p-3 border border-stone-100 rounded-sm">
                {p.imageUrl ? (
                  <img src={p.imageUrl} className="w-10 h-10 object-cover rounded-sm border border-stone-100 flex-shrink-0" alt={p.productName} />
                ) : (
                  <div className="w-10 h-10 bg-stone-100 rounded-sm flex items-center justify-center flex-shrink-0">
                    <BarChart2 size={14} className="text-stone-400" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-stone-900 line-clamp-1">{p.productName}</p>
                  <p className="text-red-700 text-[10px] font-black">{p.avgRating.toFixed(1)} ★</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pinned Footer */}
        <div className="p-6 border-t border-stone-200 bg-[#F7F5F0] mt-auto">
          <button
            onClick={handleVendorReport}
            className="w-full bg-stone-900 text-white py-3 text-xs uppercase tracking-widest hover:bg-stone-800"
          >
            REPORT BATCH TO VENDOR
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-stone-900 text-white text-xs px-6 py-3 rounded-sm shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VIEW 2 — Detail Drill-down
// ═════════════════════════════════════════════════════════════════════════════

function DetailView({ product, onBack }) {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchReviews = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get(`/api/admin/reviews/product/${product.productId}`)
      .then((res) => {
        if (res.data.success) setReviews(res.data.data);
        else setError('Unexpected server response.');
      })
      .catch(() => setError('Failed to load reviews for this product.'))
      .finally(() => setLoading(false));
  }, [product.productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">

      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mt-1 text-[10px] font-bold uppercase
                     tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Summary
        </button>
      </div>

      <div className="flex items-center gap-4">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.productName}
            className="w-14 h-14 object-cover rounded-sm border border-stone-100"
          />
        ) : (
          <div className="w-14 h-14 bg-stone-100 rounded-sm flex items-center justify-center">
            <BarChart2 size={20} className="text-stone-400" />
          </div>
        )}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-0.5">
            Admin / Reviews Hub / {product.category}
          </p>
          <h1 className="text-2xl font-black tracking-[-0.04em] text-stone-900">
            {product.productName}
          </h1>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4">
        <KpiCard label="Total Reviews" value={product.reviewCount} accent="border-stone-900" />
        <KpiCard
          label="Avg Rating"
          value={avgRating ? `${avgRating} ★` : `${product.avgRating.toFixed(1)} ★`}
          accent="border-amber-600"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center h-48 gap-2 text-stone-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Loading reviews…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-400">
          <AlertTriangle className="w-8 h-8" />
          <p className="text-sm font-bold">{error}</p>
          <button
            onClick={fetchReviews}
            className="text-[10px] font-bold uppercase tracking-widest border border-red-200
                       px-4 py-2 hover:bg-red-50 transition-colors rounded-sm"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-stone-300">
          <Inbox className="w-10 h-10" />
          <p className="text-[11px] font-bold uppercase tracking-widest">No reviews yet</p>
        </div>
      )}

      {/* Review Cards — vertical list */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.reviewId}
              className="bg-white border border-stone-100 rounded-sm px-6 py-5
                         hover:border-stone-200 transition-colors"
            >
              {/* Top row: stars + date */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} size="md" />
                  <span className="text-[11px] font-black text-stone-900">
                    {review.rating}.0
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300">
                    / 5
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 font-medium">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Comment */}
              {review.comment ? (
                <p className="text-sm text-stone-700 leading-relaxed mb-4">
                  "{review.comment}"
                </p>
              ) : (
                <p className="text-sm text-stone-300 italic mb-4">No written comment.</p>
              )}

              {/* Footer: email */}
              <div className="flex items-center gap-2 pt-3 border-t border-stone-50">
                <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center
                                text-[9px] font-black text-stone-500 uppercase">
                  {(review.userEmail?.[0] || '?').toUpperCase()}
                </div>
                <span className="text-[11px] font-medium text-stone-400">
                  {maskEmail(review.userEmail)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Root export — toggle between Summary and Detail
// ═════════════════════════════════════════════════════════════════════════════

export default function ReviewsManagementPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div>
      {selectedProduct ? (
        <DetailView
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
        />
      ) : (
        <SummaryView onSelect={setSelectedProduct} />
      )}
    </div>
  );
}
