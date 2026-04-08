import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Loader2,
  AlertTriangle,
  Pencil,
  Check,
  X,
  RefreshCw,
  Search,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

// ---------------------------------------------------------------------------
// Stock Status Badge
// ---------------------------------------------------------------------------
function StockBadge({ stock }) {
  const s = parseInt(stock, 10) || 0;
  if (s <= 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Out of Stock
      </span>
    );
  if (s <= 10)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
        Low Stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
      In Stock
    </span>
  );
}

// ---------------------------------------------------------------------------
// Inline Stock Editor — lives in the table row
// ---------------------------------------------------------------------------
function StockEditor({ productId, currentStock, onSave }) {
  const [value, setValue] = useState(String(currentStock ?? 0));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      toast.error('Please enter a valid non-negative number.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put(`/api/admin/inventory/${productId}`, { stock: num });
      if (res.data.success) {
        toast.success(`Stock updated to ${num}`);
        onSave(productId, num); // update parent state optimistically
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className="w-20 px-2 py-1 text-sm font-bold text-gray-900 border border-gray-300
                   rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]/30
                   focus:border-[#800000] text-center"
        disabled={saving}
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-100
                   text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-50"
        title="Save"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable column header
// ---------------------------------------------------------------------------
function SortHeader({ label, field, sortField, sortDir, onSort }) {
  const isActive = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-left w-full group"
    >
      <span className={`text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${isActive ? 'text-[#800000]' : 'text-gray-400 group-hover:text-gray-600'}`}>
        {label}
      </span>
      <span className={`transition-colors ${isActive ? 'text-[#800000]' : 'text-gray-300 group-hover:text-gray-400'}`}>
        {isActive ? (
          sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        ) : (
          <ArrowUpDown className="w-3 h-3" />
        )}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// InventoryPage
// ---------------------------------------------------------------------------
export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  // ── Fetch all inventory ─────────────────────────────────────────────────
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/admin/inventory');
      if (res.data.success) {
        setProducts(res.data.data);
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error('[Inventory] Fetch error:', err.message);
      setError('Failed to load inventory. Please retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // ── Optimistic stock update in local state ──────────────────────────────
  const handleStockSaved = useCallback((productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    setEditingId(null);
  }, []);

  // ── Sorting ─────────────────────────────────────────────────────────────
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // ── Derived data: filter + sort ─────────────────────────────────────────
  const displayed = [...products]
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.brandName?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (sortField === 'basePrice' || sortField === 'stock') {
        va = parseFloat(va) || 0;
        vb = parseFloat(vb) || 0;
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va ?? '').localeCompare(String(vb ?? ''))
        : String(vb ?? '').localeCompare(String(va ?? ''));
    });

  // ── KPI summary strip ───────────────────────────────────────────────────
  const total = products.length;
  const outOfStock = products.filter((p) => parseInt(p.stock, 10) === 0).length;
  const lowStock = products.filter((p) => {
    const s = parseInt(p.stock, 10);
    return s > 0 && s <= 10;
  }).length;

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#800000]" />
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
          Loading Inventory…
        </p>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-lg font-bold text-gray-900">{error}</p>
        <button
          onClick={fetchInventory}
          className="px-6 py-2.5 bg-[#800000] text-white text-sm font-bold rounded-xl
                     hover:bg-[#600000] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Inventory
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Real-time stock levels — edits write directly to the database
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200
                       rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50
                       hover:border-gray-300 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            to="/admin/inventory/add"
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-800
                       rounded-xl text-sm font-bold text-white hover:bg-stone-800
                       transition-all shadow-sm"
          >
            Add New Product
          </Link>
        </div>
      </div>

      {/* ── KPI mini-strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total SKUs', value: total, color: '#800000' },
          { label: 'Low Stock', value: lowStock, color: '#D97706' },
          { label: 'Out of Stock', value: outOfStock, color: '#DC2626' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="relative bg-white rounded-2xl p-5 border border-gray-100
                       shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: color }} />
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">
              {label}
            </p>
            <p className="text-3xl font-black tracking-tight text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Search bar ───────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, category, or brand…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl
                     text-sm text-gray-800 placeholder-gray-400 font-medium
                     focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]
                     shadow-sm transition"
        />
      </div>

      {/* ── Data Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-6 py-4 w-[56px]" />
                <th className="text-left px-4 py-4">
                  <SortHeader label="Product" field="name" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-left px-4 py-4">
                  <SortHeader label="Category" field="category" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-left px-4 py-4">
                  <SortHeader label="Brand" field="brandName" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-left px-4 py-4">
                  <SortHeader label="Price" field="basePrice" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-left px-4 py-4">
                  <SortHeader label="Stock" field="stock" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-left px-4 py-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">Status</span>
                </th>
                <th className="text-right px-6 py-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400 text-sm font-medium">
                    {search ? `No products match "${search}"` : 'No products found in the database.'}
                  </td>
                </tr>
              ) : (
                displayed.map((product, i) => (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-100 last:border-0 transition-colors duration-150
                      ${editingId === product.id ? 'bg-amber-50/60' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                      hover:bg-gray-50`}
                  >
                    {/* Image */}
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 leading-tight">
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.isNew && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                          {product.isOnSale && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                              Sale
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 font-medium capitalize">
                        {product.category || '—'}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 font-medium">
                        {product.brandName || '—'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-gray-900">
                        ₹{Number(product.basePrice).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Stock — shows editor when editing, raw count otherwise */}
                    <td className="px-4 py-3">
                      {editingId === product.id ? (
                        <StockEditor
                          productId={product.id}
                          currentStock={product.stock}
                          onSave={handleStockSaved}
                        />
                      ) : (
                        <span className="text-sm font-black text-gray-900">
                          {parseInt(product.stock, 10).toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <StockBadge stock={product.stock} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3 text-right">
                      {editingId === product.id ? (
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                     text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Cancel editing"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(product.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                     text-xs font-bold text-[#800000] bg-[#800000]/8
                                     hover:bg-[#800000]/15 transition-colors border border-[#800000]/20"
                          title="Edit stock"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit Stock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {displayed.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-600">{displayed.length}</span> of{' '}
              <span className="font-bold text-gray-600">{total}</span> products
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Click <strong>Edit Stock</strong> on any row to update quantity
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
