import React, { useEffect, useState } from 'react';
import { Loader2, AlertTriangle, ArrowDownUp, RefreshCw, BadgeIndianRupee } from 'lucide-react';
import api from '../../services/api';

export default function SalesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sorting Mode: 'newest' | 'highest'
  const [sortMode, setSortMode] = useState('newest');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/admin/orders');
      if (res.data.success) {
        setOrders(res.data.data || []);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error('[Admin Sales] Fetch error:', err.message);
      setError('Unable to load order ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Formatters
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  };

  const formatCurrency = (amount) => {
    const num = parseInt(amount, 10) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Derive Sorted Orders
  const sortedOrders = [...orders].sort((a, b) => {
    if (sortMode === 'highest') {
      const aAmt = parseInt(a.totalAmount, 10) || 0;
      const bAmt = parseInt(b.totalAmount, 10) || 0;
      return bAmt - aAmt;
    } else {
      // newest
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return bDate - aDate;
    }
  });

  // Calculate quick metrics
  const totalLedgerValue = orders.reduce((sum, o) => sum + (parseInt(o.totalAmount, 10) || 0), 0);
  const totalTransactions = orders.length;

  // ── States ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
        <p className="font-label text-xs font-bold text-stone-400 uppercase tracking-widest">
          Loading Ledger…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-lg font-bold text-stone-900">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-6 py-2 border border-stone-300 text-stone-900 text-sm font-bold rounded-sm
                     hover:bg-stone-100 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F5F0] min-h-[calc(100vh-80px)] space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-stone-900">
            Sales Ledger
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-1">
            Complete transaction history and revenue records.
          </p>
        </div>
        <div className="flex items-center gap-4">
           {/* Ledger Metrics Strip */}
           <div className="flex items-center gap-6 px-5 py-2 bg-white border border-stone-200">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Volume</span>
                <span className="text-sm font-black text-stone-900">{totalTransactions} Orders</span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Revenue</span>
                <span className="text-sm font-black text-[#800000]">{formatCurrency(totalLedgerValue)}</span>
              </div>
           </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white border border-stone-200 p-1 rounded-sm">
          <button
            onClick={() => setSortMode('newest')}
            className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
              sortMode === 'newest'
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            Newest First
          </button>
          <button
            onClick={() => setSortMode('highest')}
            className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-colors ${
              sortMode === 'highest'
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            Highest Amount
          </button>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-200
                     rounded-sm text-[11px] font-bold uppercase tracking-widest text-stone-600 
                     hover:bg-stone-50 hover:text-stone-900 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync
        </button>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white border border-stone-200 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#F7F5F0] border-b border-stone-200">
              <tr>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                  Order ID
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                  Customer
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                  Total Amount
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-stone-500 uppercase tracking-[0.15em]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <p className="text-sm font-bold text-stone-400">No orders recorded in the ledger.</p>
                  </td>
                </tr>
              ) : (
                sortedOrders.map((order) => {
                  const shortId = order.id ? order.id.split('-')[0].toUpperCase() : 'UNKNOWN';
                  return (
                    <tr key={order.id} className="hover:bg-[#F7F5F0]/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-bold text-stone-900 border border-stone-200 bg-[#F7F5F0] px-2 py-0.5">
                          {shortId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-stone-500">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-stone-900">
                          {order.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-stone-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-sm bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info strip */}
        <div className="bg-stone-50 border-t border-stone-200 px-6 py-3">
           <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">
             End of Ledger
           </p>
        </div>
      </div>
    </div>
  );
}
