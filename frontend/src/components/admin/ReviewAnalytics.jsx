import React, { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell,
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import { AlertTriangle, Loader2, Star } from 'lucide-react';

// ─── Palette (Warm Editorial Minimalism) ─────────────────────────────────────
const P = {
    charcoal: '#1c1917',
    stone:    '#57534e',
    light:    '#a8a29e',
    pale:     '#d6d3d1',
    border:   '#e7e5e4',
};

// Sentiment bucket colours — dark → light (5★ most positive, 1-2★ neutral)
const SENTIMENT_COLORS = {
    5: '#1c1917',   // charcoal  — Excellent
    4: '#57534e',   // stone     — Good
    3: '#a8a29e',   // light     — Average
    2: '#d6d3d1',   // pale      — Poor
    1: '#e7e5e4',   // border    — Very poor
};

// ─── Tooltip style (matches FeedbackAnalytics exactly) ───────────────────────
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

const tickStyle = { fill: P.light, fontSize: 10, fontWeight: 600 };

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
            <Star size={24} />
            <p className="text-[11px] font-bold uppercase tracking-widest">{label}</p>
        </div>
    );
}

// ─── Inline mini-star renderer ────────────────────────────────────────────────
function StarRow({ count }) {
    return (
        <span className="inline-flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    size={10}
                    className={i < count ? 'fill-amber-400 text-amber-400' : 'fill-stone-100 text-stone-200'}
                />
            ))}
        </span>
    );
}

// ─── Custom donut tooltip ──────────────────────────────────────────────────────
function SentimentTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div style={TT.contentStyle}>
            <p style={TT.labelStyle}>{d.name}</p>
            <p style={TT.itemStyle}>{d.value} reviews</p>
        </div>
    );
}

// ─── Bucket reviews into 3 groups for the donut ────────────────────────────────
// 5★ | 4★ | 1-3★  (coarser grouping = cleaner donut)
function buildDonutData(ratingDistribution) {
    const byRating = {}; // { 1:0, 2:0, 3:0, 4:0, 5:0 }
    for (let i = 1; i <= 5; i++) byRating[i] = 0;
    ratingDistribution.forEach((r) => { byRating[r.rating] = r.count; });

    const fiveStar  = byRating[5];
    const fourStar  = byRating[4];
    const lowRange  = byRating[1] + byRating[2] + byRating[3];

    return [
        { name: '5★  Excellent', value: fiveStar,  fill: SENTIMENT_COLORS[5] },
        { name: '4★  Good',      value: fourStar,   fill: SENTIMENT_COLORS[4] },
        { name: '1–3★  Mixed',   value: lowRange,   fill: SENTIMENT_COLORS[3] },
    ].filter((d) => d.value > 0);
}

// ═════════════════════════════════════════════════════════════════════════════
// ReviewAnalytics
// ═════════════════════════════════════════════════════════════════════════════
export default function ReviewAnalytics() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        api.get('/api/admin/reviews-stats')
            .then((res) => {
                if (res.data.success) setData(res.data);
                else setError('Unexpected response from server.');
            })
            .catch(() => setError('Failed to load review statistics.'))
            .finally(() => setLoading(false));
    }, []);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-40 gap-2 text-stone-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                    Loading review data…
                </span>
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex items-center justify-center h-40 gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-[11px] font-bold uppercase tracking-widest">{error}</span>
            </div>
        );
    }

    const {
        ratingDistribution = [],
        globalAverage      = null,
        totalReviews       = 0,
        dailyVolume        = [],
    } = data || {};

    const donutData  = buildDonutData(ratingDistribution);
    const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

    // Peak day for the velocity callout
    const peakDay = [...dailyVolume].sort((a, b) => b.count - a.count)[0];

    return (
        <section className="space-y-3">
            {/* ── Section heading ── */}
            <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                    Customer Sentiment &amp; Review Analysis
                </p>
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-800 bg-stone-100 px-2 py-0.5 rounded-full">
                    {totalReviews} total reviews
                </span>
            </div>

            {/* ── KPI strip ── */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    {
                        label: 'Global Avg Rating',
                        value: globalAverage != null ? `${globalAverage.toFixed(1)} ★` : '—',
                        accent: 'border-stone-900',
                    },
                    {
                        label: 'Total Reviews',
                        value: totalReviews,
                        accent: 'border-amber-600',
                    },
                    {
                        label: '5-Star Reviews',
                        value: ratingDistribution.find((r) => r.rating === 5)?.count ?? 0,
                        accent: 'border-emerald-600',
                    },
                ].map(({ label, value, accent }) => (
                    <div
                        key={label}
                        className={`bg-white border border-stone-100 border-l-2 ${accent} px-5 py-4 rounded-sm`}
                    >
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-1">
                            {label}
                        </p>
                        <p className="text-2xl font-black text-stone-900">{value}</p>
                    </div>
                ))}
            </div>

            {/* ── 2-col chart grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── Chart 1: Sentiment Breakdown — Donut ── */}
                <Card
                    title="Sentiment Breakdown"
                    subtitle="Distribution of star ratings across all products"
                >
                    {donutData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={170}>
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={46}
                                        outerRadius={76}
                                        paddingAngle={2}
                                        stroke="none"
                                        animationBegin={0}
                                        animationDuration={700}
                                    >
                                        {donutData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<SentimentTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Compact legend with % */}
                            <div className="mt-1 space-y-2 border-t border-stone-100 pt-3">
                                {donutData.map((d) => {
                                    const pct = donutTotal > 0
                                        ? Math.round((d.value / donutTotal) * 100)
                                        : 0;
                                    return (
                                        <div key={d.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ background: d.fill }}
                                                />
                                                <span className="text-[10px] font-semibold text-stone-600">
                                                    {d.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-stone-500">
                                                    {d.value}
                                                </span>
                                                <span className="text-[10px] font-bold text-stone-400 w-8 text-right">
                                                    {pct}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Full breakdown per star */}
                            <div className="mt-3 pt-3 border-t border-stone-50 space-y-1.5">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const row   = ratingDistribution.find((r) => r.rating === star);
                                    const cnt   = row?.count ?? 0;
                                    const width = totalReviews > 0 ? (cnt / totalReviews) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2">
                                            <StarRow count={star} />
                                            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-stone-800 rounded-full transition-all duration-700"
                                                    style={{ width: `${width}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-black text-stone-400 w-6 text-right">
                                                {cnt}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <Empty label="No reviews yet" />
                    )}
                </Card>

                {/* ── Chart 2: Review Velocity — Area ── */}
                <Card
                    title="Review Velocity"
                    subtitle="Daily review submissions — last 7 days"
                >
                    {dailyVolume.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart
                                    data={dailyVolume}
                                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor={P.charcoal} stopOpacity={0.08} />
                                            <stop offset="95%" stopColor={P.charcoal} stopOpacity={0}    />
                                        </linearGradient>
                                    </defs>
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
                                    <Tooltip
                                        {...TT}
                                        formatter={(v) => [v, 'Reviews']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke={P.charcoal}
                                        strokeWidth={2}
                                        fill="url(#reviewGradient)"
                                        dot={{ fill: P.charcoal, r: 3, strokeWidth: 0 }}
                                        activeDot={{ fill: P.charcoal, r: 5, strokeWidth: 0 }}
                                        animationBegin={0}
                                        animationDuration={700}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>

                            {/* Peak callout */}
                            {peakDay?.count > 0 && (
                                <div className="mt-2 pt-3 border-t border-stone-100 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                        Peak day
                                    </span>
                                    <span className="text-[11px] font-black text-stone-900">
                                        {peakDay.label} — {peakDay.count} {peakDay.count === 1 ? 'review' : 'reviews'}
                                    </span>
                                </div>
                            )}

                            {/* 7-day total */}
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                                    7-day total
                                </span>
                                <span className="text-[11px] font-black text-stone-900">
                                    {dailyVolume.reduce((s, d) => s + d.count, 0)} reviews
                                </span>
                            </div>
                        </>
                    ) : (
                        <Empty label="No velocity data" />
                    )}
                </Card>

            </div>
        </section>
    );
}
