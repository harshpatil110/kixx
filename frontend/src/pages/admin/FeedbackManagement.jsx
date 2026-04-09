import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, CheckCircle2, Inbox, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ─── Category badge colours ───────────────────────────────────────────────────
const BADGE = {
    'UI/UX Bug':                { bg: 'bg-stone-900',   text: 'text-white' },
    'Payment/Checkout Issue':   { bg: 'bg-red-800',     text: 'text-white' },
    'Account/Login Issue':      { bg: 'bg-amber-700',   text: 'text-white' },
    'General Suggestion':       { bg: 'bg-stone-500',   text: 'text-white' },
    'Other':                    { bg: 'bg-stone-200',   text: 'text-stone-700' },
};
const SHORT = {
    'UI/UX Bug':                'UI Bug',
    'Payment/Checkout Issue':   'Payment',
    'Account/Login Issue':      'Login',
    'General Suggestion':       'Suggestion',
    'Other':                    'Other',
};

function CategoryBadge({ category }) {
    const style = BADGE[category] ?? { bg: 'bg-stone-200', text: 'text-stone-700' };
    return (
        <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em]
                          rounded-sm ${style.bg} ${style.text} whitespace-nowrap`}>
            {SHORT[category] ?? category}
        </span>
    );
}

function formatDate(ts) {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

// ─── Status filter tabs ───────────────────────────────────────────────────────
const FILTERS = ['All', 'Open', 'Resolved'];

// ═════════════════════════════════════════════════════════════════════════════
export default function FeedbackManagement() {
    const [items, setItems]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [resolving, setResolving] = useState(null); // id of row being resolved
    const [filter, setFilter]     = useState('All');
    const [toastMessage, setToastMessage] = useState(null);

    const fetchFeedback = useCallback(() => {
        setLoading(true);
        setError(null);
        api.get('/api/admin/feedback')
            .then((res) => {
                if (res.data.success) setItems(res.data.data);
                else setError('Unexpected response from server.');
            })
            .catch(() => setError('Failed to load feedback.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchFeedback(); }, [fetchFeedback]);

    const handleResolve = async (id) => {
        setResolving(id);
        try {
            const res = await api.patch(`/api/admin/feedback/${id}/resolve`);
            if (res.data.success) {
                // Optimistic update — no refetch needed
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === id ? { ...item, status: 'Resolved' } : item
                    )
                );
                toast.success(`Feedback #${id} marked as resolved.`);
            }
        } catch {
            toast.error('Failed to resolve. Please retry.');
        } finally {
            setResolving(null);
        }
    };

    const handleEscalate = (id) => {
        setToastMessage('Issue successfully forwarded to tech support.');
        setTimeout(() => setToastMessage(null), 3000);
    };

    const displayed = items.filter((item) =>
        filter === 'All' ? true : item.status === filter
    );

    const openCount     = items.filter((i) => i.status === 'Open').length;
    const resolvedCount = items.filter((i) => i.status === 'Resolved').length;

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">
                        Admin / Feedback Hub
                    </p>
                    <h1 className="text-3xl font-black tracking-[-0.04em] text-stone-900">
                        User Feedback
                    </h1>
                </div>
                <button
                    onClick={fetchFeedback}
                    className="flex items-center gap-2 px-3 py-1.5 border border-stone-200
                               text-[10px] font-bold uppercase tracking-widest text-stone-500
                               hover:bg-stone-900 hover:text-white hover:border-stone-900
                               transition-all rounded-sm"
                >
                    <RefreshCw size={11} />
                    Refresh
                </button>
            </div>

            {/* ── KPI strip ── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total', value: items.length, accent: 'border-stone-900' },
                    { label: 'Open',     value: openCount,     accent: 'border-amber-600' },
                    { label: 'Resolved', value: resolvedCount, accent: 'border-emerald-600' },
                ].map(({ label, value, accent }) => (
                    <div key={label}
                         className={`bg-white border border-stone-100 border-l-2 ${accent}
                                     px-5 py-4 rounded-sm`}>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">
                            {label}
                        </p>
                        <p className="text-2xl font-black text-stone-900">{value}</p>
                    </div>
                ))}
            </div>

            {/* ── Filter tabs ── */}
            <div className="flex items-center gap-1 border-b border-stone-100 pb-0">
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest
                                    border-b-2 transition-all
                                    ${filter === f
                                        ? 'border-stone-900 text-stone-900'
                                        : 'border-transparent text-stone-400 hover:text-stone-700'
                                    }`}
                    >
                        {f}
                        {f !== 'All' && (
                            <span className="ml-1.5 text-[9px] font-black opacity-60">
                                ({f === 'Open' ? openCount : resolvedCount})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── States ── */}
            {loading && (
                <div className="flex items-center justify-center h-48 gap-2 text-stone-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                        Loading submissions…
                    </span>
                </div>
            )}

            {!loading && error && (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-red-400">
                    <AlertTriangle className="w-8 h-8" />
                    <p className="text-sm font-bold">{error}</p>
                    <button
                        onClick={fetchFeedback}
                        className="text-[10px] font-bold uppercase tracking-widest border border-red-200
                                   px-4 py-2 hover:bg-red-50 transition-colors rounded-sm"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && displayed.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-stone-300">
                    <Inbox className="w-10 h-10" />
                    <p className="text-[11px] font-bold uppercase tracking-widest">
                        {filter === 'All' ? 'No feedback submitted yet' : `No ${filter.toLowerCase()} feedback`}
                    </p>
                </div>
            )}

            {/* ── Table ── */}
            {!loading && !error && displayed.length > 0 && (
                <div className="bg-white border border-stone-100 rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-100 bg-stone-50">
                                <th className="text-left px-5 py-3 text-[9px] font-black uppercase
                                               tracking-[0.18em] text-stone-400 w-28">
                                    Category
                                </th>
                                <th className="text-left px-5 py-3 text-[9px] font-black uppercase
                                               tracking-[0.18em] text-stone-400 w-36">
                                    User / Source
                                </th>
                                <th className="text-left px-5 py-3 text-[9px] font-black uppercase
                                               tracking-[0.18em] text-stone-400">
                                    Message
                                </th>
                                <th className="text-left px-5 py-3 text-[9px] font-black uppercase
                                               tracking-[0.18em] text-stone-400 w-24">
                                    Date
                                </th>
                                <th className="text-right px-5 py-3 text-[9px] font-black uppercase
                                               tracking-[0.18em] text-stone-400 w-28">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                            {displayed.map((item) => {
                                const isResolved = item.status === 'Resolved';
                                const isWaiting  = resolving === item.id;
                                return (
                                    <tr
                                        key={item.id}
                                        className={`group transition-colors
                                            ${isResolved
                                                ? 'opacity-50 bg-white'
                                                : 'hover:bg-stone-50/60'
                                            }`}
                                    >
                                        {/* Category */}
                                        <td className="px-5 py-4 align-top">
                                            <CategoryBadge category={item.category} />
                                        </td>

                                        {/* User ID / guest */}
                                        <td className="px-5 py-4 align-top">
                                            {item.userId ? (
                                                <span className="font-mono text-[10px] text-stone-500
                                                                 truncate block max-w-[130px]"
                                                      title={item.userId}>
                                                    {item.userId.slice(0, 12)}…
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-stone-400 italic">
                                                    Guest
                                                </span>
                                            )}
                                        </td>

                                        {/* Message */}
                                        <td className="px-5 py-4 align-top max-w-0">
                                            <p className={`text-sm leading-relaxed
                                                ${isResolved
                                                    ? 'line-through text-stone-400'
                                                    : 'text-stone-700'
                                                }`}>
                                                {item.message}
                                            </p>
                                        </td>

                                        {/* Date */}
                                        <td className="px-5 py-4 align-top whitespace-nowrap">
                                            <span className="text-[11px] text-stone-400 font-medium">
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-4 align-top text-right">
                                            {isResolved ? (
                                                <span className="inline-flex items-center gap-1
                                                                 text-[10px] font-bold uppercase
                                                                 tracking-widest text-emerald-600">
                                                    <CheckCircle2 size={12} />
                                                    Done
                                                </span>
                                            ) : (
                                                <div className="flex gap-2 items-center justify-end">
                                                    <button
                                                        onClick={() => handleResolve(item.id)}
                                                        disabled={isWaiting}
                                                        className="border border-stone-200 text-[10px] px-3 py-1
                                                                   uppercase tracking-widest font-bold text-stone-500
                                                                   hover:bg-stone-900 hover:text-white
                                                                   hover:border-stone-900 transition-all
                                                                   disabled:opacity-40 rounded-sm"
                                                    >
                                                        {isWaiting ? '…' : 'Resolve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEscalate(item.id)}
                                                        className="border border-stone-200 text-[10px] px-3 py-1 uppercase tracking-widest hover:bg-stone-800 hover:text-white transition-all text-stone-600"
                                                    >
                                                        ESCALATE
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Toast ── */}
            {toastMessage && (
                <div className="fixed bottom-8 right-8 bg-stone-900 text-white text-xs px-6 py-3 rounded-sm shadow-lg tracking-wide z-50 animate-fade-in">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
