import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar,
    PieChart, Pie, Cell,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { AlertTriangle, Loader2, MessageSquare } from 'lucide-react';

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
    charcoal: '#1c1917',
    stone:    '#57534e',
    light:    '#a8a29e',
    pale:     '#d6d3d1',
    border:   '#e7e5e4',
};
const MONO = [P.charcoal, P.stone, P.light, P.pale];

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const TT = {
    contentStyle: {
        backgroundColor: '#fff',
        border: `1px solid ${P.border}`,
        borderRadius: '2px',
        boxShadow: 'none',
        fontSize: 11,
        fontFamily: 'inherit',
        padding: '8px 12px',
    },
    itemStyle:  { color: P.charcoal, fontWeight: 700 },
    labelStyle: { color: P.stone, fontWeight: 600, marginBottom: 2 },
    cursor:     { fill: `${P.pale}66` },
};

// ─── Axis tick style ──────────────────────────────────────────────────────────
const tickStyle = { fill: P.light, fontSize: 10, fontWeight: 600 };

// ─── Abbreviated category labels for tight charts ─────────────────────────────
const SHORT = {
    'UI/UX Bug':                'UI Bug',
    'Payment/Checkout Issue':   'Payment',
    'Account/Login Issue':      'Login',
    'General Suggestion':       'Suggestion',
    'Other':                    'Other',
};

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ title, subtitle, children }) {
    return (
        <div className="bg-white border border-stone-200 p-6 shadow-none rounded-sm">
            <div className="mb-4">
                <p className="text-xs font-black text-stone-900 tracking-tight uppercase">{title}</p>
                {subtitle && (
                    <p className="text-[11px] text-stone-400 font-medium mt-0.5">{subtitle}</p>
                )}
            </div>
            {children}
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ label }) {
    return (
        <div className="h-[180px] flex flex-col items-center justify-center gap-2 text-stone-300">
            <MessageSquare size={24} />
            <p className="text-[11px] font-bold uppercase tracking-widest">{label}</p>
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// FeedbackAnalytics
// ═════════════════════════════════════════════════════════════════════════════
export default function FeedbackAnalytics() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        api.get('/api/admin/feedback-stats')
            .then((res) => {
                if (res.data.success) setData(res.data);
                else setError('Unexpected response from server.');
            })
            .catch(() => setError('Failed to load feedback statistics.'))
            .finally(() => setLoading(false));
    }, []);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-40 gap-2 text-stone-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                    Loading feedback data…
                </span>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex items-center justify-center h-40 gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-[11px] font-bold uppercase tracking-widest">{error}</span>
            </div>
        );
    }

    const { categoryBreakdown = [], dailyTrend = [], totalFeedback = 0 } = data || {};

    // Map category → short label for bar chart
    const barData = categoryBreakdown.map((r) => ({
        name:  SHORT[r.category] ?? r.category,
        count: r.count,
    }));

    return (
        <section className="space-y-3">
            {/* Section heading */}
            <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                    System Health & User Feedback
                </p>
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-800 bg-stone-100 px-2 py-0.5 rounded-full">
                    {totalFeedback} total submissions
                </span>
            </div>

            {/* 3-col grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* ── Chart 1: Issue Distribution — Vertical Bar ── */}
                <Card
                    title="Issue Distribution"
                    subtitle="Report count per category"
                >
                    {barData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={20}>
                                <CartesianGrid
                                    stroke={P.border}
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ ...tickStyle, fontSize: 9 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={tickStyle}
                                    allowDecimals={false}
                                />
                                <Tooltip {...TT} formatter={(v) => [v, 'Reports']} />
                                <Bar
                                    dataKey="count"
                                    fill={P.charcoal}
                                    radius={[2, 2, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Empty label="No reports yet" />
                    )}
                </Card>

                {/* ── Chart 2: Reporting Hotspots — Donut ── */}
                <Card
                    title="Reporting Hotspots"
                    subtitle="Category share of total submissions"
                >
                    {categoryBreakdown.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Pie
                                        data={categoryBreakdown}
                                        dataKey="count"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={42}
                                        outerRadius={68}
                                        paddingAngle={2}
                                        stroke="none"
                                        animationBegin={0}
                                        animationDuration={600}
                                    >
                                        {categoryBreakdown.map((_, i) => (
                                            <Cell key={i} fill={MONO[i % MONO.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        {...TT}
                                        formatter={(v) => [v, 'Reports']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Compact legend */}
                            <div className="mt-2 space-y-1.5 border-t border-stone-100 pt-3">
                                {categoryBreakdown.map((r, i) => {
                                    const pct = totalFeedback > 0
                                        ? Math.round((r.count / totalFeedback) * 100)
                                        : 0;
                                    return (
                                        <div key={r.category} className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full flex-shrink-0"
                                                      style={{ background: MONO[i % MONO.length] }} />
                                                <span className="text-[10px] font-semibold text-stone-600 truncate max-w-[110px]">
                                                    {SHORT[r.category] ?? r.category}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-black text-stone-500">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <Empty label="No submissions" />
                    )}
                </Card>

                {/* ── Chart 3: System Health Trend — Line ── */}
                <Card
                    title="System Health Trend"
                    subtitle="Daily report volume — spikes signal incidents"
                >
                    {dailyTrend.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart
                                    data={dailyTrend}
                                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid
                                        stroke={P.border}
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ ...tickStyle, fontSize: 9 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={tickStyle}
                                        allowDecimals={false}
                                    />
                                    <Tooltip {...TT} formatter={(v) => [v, 'Reports']} />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke={P.charcoal}
                                        strokeWidth={2}
                                        dot={{ fill: P.charcoal, r: 3, strokeWidth: 0 }}
                                        activeDot={{ fill: P.charcoal, r: 5, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            {/* Peak callout */}
                            {(() => {
                                const peak = [...dailyTrend].sort((a, b) => b.count - a.count)[0];
                                return peak?.count > 0 ? (
                                    <div className="mt-2 pt-3 border-t border-stone-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                            Peak day
                                        </span>
                                        <span className="text-[11px] font-black text-stone-900">
                                            {peak.label} — {peak.count} reports
                                        </span>
                                    </div>
                                ) : null;
                            })()}
                        </>
                    ) : (
                        <Empty label="No trend data" />
                    )}
                </Card>

            </div>
        </section>
    );
}
