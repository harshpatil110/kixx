import React from 'react';
import {
  PieChart, Pie, Cell,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  charcoal:  '#1c1917',
  stone:     '#57534e',
  light:     '#a8a29e',
  pale:      '#d6d3d1',
  surface:   '#fafaf9',
  border:    '#e7e5e4',
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const brandData = [
  { name: 'Nike',        value: 450 },
  { name: 'Jordan',      value: 320 },
  { name: 'Adidas',      value: 180 },
  { name: 'New Balance', value:  90 },
];

const growthData = [
  { month: 'Jan', shoesAdded:  45 },
  { month: 'Feb', shoesAdded:  78 },
  { month: 'Mar', shoesAdded: 120 },
  { month: 'Apr', shoesAdded: 210 },
  { month: 'May', shoesAdded: 290 },
  { month: 'Jun', shoesAdded: 410 },
];

const topModelsData = [
  { name: 'Dunk Low',      count: 185 },
  { name: 'Jordan 1 High', count: 142 },
  { name: 'Yeezy 350',     count:  98 },
  { name: 'Air Force 1',   count:  85 },
];

// Monochromatic shades for donut slices
const DONUT_COLORS = [P.charcoal, P.stone, P.light, P.pale];

// ─── Shared Tooltip Style ─────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: `1px solid ${P.border}`,
    borderRadius: '2px',
    boxShadow: 'none',
    fontSize: 11,
    fontFamily: 'inherit',
    padding: '8px 12px',
  },
  itemStyle: { color: P.charcoal, fontWeight: 700 },
  labelStyle: { color: P.stone, fontWeight: 600, marginBottom: 2 },
  cursor: { fill: `${P.pale}55` },
};

// ─── Section Header ───────────────────────────────────────────────────────────
function CardHeader({ title, subtitle, badge }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-sm font-black text-stone-900 tracking-tight">{title}</h3>
        <p className="text-[11px] text-stone-400 font-medium mt-0.5">{subtitle}</p>
      </div>
      {badge && (
        <span className="px-2.5 py-1 text-[9px] font-bold bg-stone-100 text-stone-500
                         rounded-full uppercase tracking-[0.15em]">
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Custom Donut Label ───────────────────────────────────────────────────────
function DonutCenterLabel({ cx, cy }) {
  const total = brandData.reduce((s, d) => s + d.value, 0);
  return (
    <g>
      <text x={cx} y={cy - 6} textAnchor="middle" fill={P.charcoal}
            style={{ fontSize: 22, fontWeight: 900, fontFamily: 'inherit' }}>
        {total}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill={P.stone}
            style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em',
                     textTransform: 'uppercase', fontFamily: 'inherit' }}>
        TOTAL SHOES
      </text>
    </g>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CollectionAnalytics() {
  return (
    <section className="space-y-3">

      {/* Section heading */}
      <div className="flex items-center gap-3 mb-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
          Community Archive Analytics
        </p>
        <div className="flex-1 h-px bg-stone-100" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-300">
          Dummy Data / Preview
        </span>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── 1. Brand Market Share — Donut ── */}
        <div className="bg-white border border-stone-100 rounded-sm p-5">
          <CardHeader
            title="Brand Market Share"
            subtitle="User archive distribution by brand"
            badge="Donut"
          />

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={brandData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={2}
                stroke="none"
                animationBegin={0}
                animationDuration={700}
              >
                {brandData.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
                {/* SVG centre label rendered via labelLine trick */}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [v, 'Shoes']} />
            </PieChart>
          </ResponsiveContainer>

          {/* Brand legend list */}
          <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
            {brandData.map((b, i) => {
              const total = brandData.reduce((s, d) => s + d.value, 0);
              const pct = total > 0 ? Math.round((b.value / total) * 100) : 0;
              return (
                <div key={b.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    <span className="text-[11px] font-semibold text-stone-700">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                           style={{ width: `${pct}%`,
                                    background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    </div>
                    <span className="text-[11px] font-bold text-stone-500 w-7 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2. Archive Velocity — Area Chart ── */}
        <div className="bg-white border border-stone-100 rounded-sm p-5">
          <CardHeader
            title="Archive Velocity"
            subtitle="Monthly shoes added to community archive"
            badge="6 mo"
          />

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="archiveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor={P.charcoal} stopOpacity={0.10} />
                  <stop offset="95%" stopColor={P.charcoal} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={P.border}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: P.light, fontSize: 10, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: P.light, fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(v) => [v, 'Shoes Added']}
              />
              <Area
                type="monotone"
                dataKey="shoesAdded"
                stroke={P.charcoal}
                strokeWidth={2}
                fill="url(#archiveGrad)"
                dot={{ fill: P.charcoal, r: 3, strokeWidth: 0 }}
                activeDot={{ fill: P.charcoal, r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Mini stat */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Jun vs Jan
            </span>
            <span className="text-[11px] font-black text-stone-900">
              ↑ {Math.round(((410 - 45) / 45) * 100)}% growth
            </span>
          </div>
        </div>

        {/* ── 3. Most Vaulted Models — Bar Chart ── */}
        <div className="bg-white border border-stone-100 rounded-sm p-5">
          <CardHeader
            title="Most Vaulted Models"
            subtitle="Top sneaker models across all user archives"
            badge="Top 4"
          />

          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={topModelsData}
              layout="vertical"
              margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
              barSize={14}
            >
              <CartesianGrid
                stroke={P.border}
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: P.light, fontSize: 10, fontWeight: 600 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                axisLine={false}
                tickLine={false}
                tick={{ fill: P.stone, fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(v) => [v, 'Users']}
              />
              <Bar
                dataKey="count"
                fill={P.charcoal}
                radius={[0, 2, 2, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Top model callout */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              #1 Model
            </span>
            <span className="text-[11px] font-black text-stone-900">
              Dunk Low — 185 vaults
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
