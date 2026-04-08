import React, { useState } from 'react';
import { Share2, Zap, ShieldAlert, ChevronRight, Activity } from 'lucide-react';
import SupplyChainVisualizer, { PHASES } from '../../components/SupplyChainVisualizer';

// ─── Stat Cards ───────────────────────────────────────────────────────────────
const STAT_CARDS = [
  { label: 'Active Stakeholders', value: '5',    sub: 'in live network',    color: '#800000' },
  { label: 'Flow Phases',         value: '5',    sub: 'end-to-end stages',  color: '#3b82f6' },
  { label: 'Avg. Settlement',     value: '48h',  sub: 'post-delivery',      color: '#22c55e' },
  { label: 'Exception Rate',      value: '0.4%', sub: 'last 30 days',       color: '#f59e0b' },
];

// ─── Color utilities ──────────────────────────────────────────────────────────
const FLOW_TYPE_LABEL = {
  '#22c55e': { label: 'Financial Flow', bg: '#22c55e22', text: '#4ade80' },
  '#3b82f6': { label: 'Physical Flow',  bg: '#3b82f622', text: '#60a5fa' },
  '#f59e0b': { label: 'Data Flow',      bg: '#f59e0b22', text: '#fbbf24' },
};

export default function VisualizationPage() {
  const [activePhaseId, setActivePhaseId] = useState('handshake');

  const activePhase = PHASES.find((p) => p.id === activePhaseId) ?? PHASES[0];
  const flowMeta = FLOW_TYPE_LABEL[activePhase.color] ?? { label: 'Data Flow', bg: '#ffffff11', text: '#fff' };

  return (
    <div className="bg-[#F7F5F0] min-h-[calc(100vh-80px)] pb-16 space-y-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
              System Module
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-stone-900 leading-none">
            Supply Chain Architecture
          </h1>
          <p className="text-sm text-stone-500 font-medium mt-1.5">
            Real-time logic flow of the KIXX middleman ecosystem.
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-sm text-sm font-semibold text-stone-700 self-start sm:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          Live Architecture
        </div>
      </div>

      {/* ── Stat Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-stone-200 rounded-sm p-5 flex flex-col gap-1"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              {s.label}
            </span>
            <span className="text-3xl font-black tracking-tight" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-xs text-stone-400 font-medium">{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Phase Selector + Canvas Block ── */}
      <div className="rounded-xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>

        {/* Phase Toggle Bar */}
        <div className="bg-[#F7F5F0] border-b border-stone-200 px-4 py-3 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1.5 mr-3">
            <Activity className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Phase</span>
          </div>
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhaseId(phase.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                activePhaseId === phase.id
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
                style={{
                  background: activePhaseId === phase.id ? activePhase.color : 'transparent',
                  border: `1.5px solid ${activePhaseId === phase.id ? activePhase.color : 'currentColor'}`,
                  color: activePhaseId === phase.id ? '#fff' : 'currentColor',
                }}
              >
                {phase.step}
              </span>
              {phase.label}
            </button>
          ))}

          {/* Flow type badge */}
          <div
            className="ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{ background: flowMeta.bg, color: flowMeta.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: flowMeta.text }} />
            {flowMeta.label}
          </div>
        </div>

        {/* ── CANVAS — CRITICAL: fixed pixel height on wrapper ── */}
        <div style={{ width: '100%', height: '520px', background: '#111111', position: 'relative' }}>
          <SupplyChainVisualizer activePhaseId={activePhaseId} />
        </div>

        {/* ── Legend Bar ── */}
        <div
          className="flex flex-wrap items-center gap-5 px-6 py-3"
          style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { color: '#3b82f6', label: 'Physical Flow', solid: true },
            { color: '#22c55e', label: 'Financial Flow', solid: false },
            { color: '#f59e0b', label: 'Data Flow',      solid: false },
          ].map(({ color, label, solid }) => (
            <div key={label} className="flex items-center gap-2">
              <svg width="28" height="4">
                {solid ? (
                  <line x1="0" y1="2" x2="28" y2="2" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <line x1="0" y1="2" x2="28" y2="2" stroke={color} strokeWidth="2" strokeDasharray="5 3" strokeLinecap="round" />
                )}
              </svg>
              <span className="text-[11px] text-white/40 font-semibold tracking-widest uppercase">{label}</span>
            </div>
          ))}
          <span className="ml-auto text-[11px] text-white/20 font-medium hidden sm:block">
            Drag nodes · Scroll to zoom
          </span>
        </div>

        {/* ── Detail Panel (synced to active phase) ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-0"
          style={{ background: '#0d0d10', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Column 1 — Title + Description */}
          <div
            className="p-6 md:border-r flex flex-col gap-3"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                style={{ background: activePhase.color }}
              >
                {activePhase.step}
              </div>
              <div>
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: activePhase.color }}
                >
                  {activePhase.label}
                </div>
                <div className="text-white font-black text-sm leading-tight">
                  {activePhase.title}
                </div>
              </div>
            </div>
            <p className="text-white/45 text-[13px] leading-relaxed">{activePhase.description}</p>
          </div>

          {/* Column 2 — Key Actions */}
          <div
            className="p-6 md:border-r"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3 flex items-center gap-2">
              <ChevronRight className="w-3 h-3" /> Key Actions
            </p>
            <ul className="space-y-2.5">
              {activePhase.actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0"
                    style={{ background: activePhase.color }}
                  />
                  <span className="text-white/65 text-[13px] leading-snug">{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Protocols / Risks */}
          <div className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-3 h-3 text-red-500" />
              <span className="text-red-400/70">Exception Protocols</span>
            </p>
            <ul className="space-y-2.5">
              {activePhase.risks.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0 bg-red-500" />
                  <span className="text-red-400/80 text-[12.5px] leading-snug font-medium">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Flow Summary Footer ── */}
      <div className="bg-white border border-stone-200 rounded-sm p-6">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-4">
          End-to-End Journey
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {PHASES.map((phase, i, arr) => (
            <React.Fragment key={phase.id}>
              <button
                onClick={() => setActivePhaseId(phase.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activePhaseId === phase.id
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded"
                  style={{
                    background: activePhaseId === phase.id ? phase.color : '#f1f0ed',
                    color: activePhaseId === phase.id ? '#fff' : '#888',
                  }}
                >
                  {phase.step}
                </span>
                {phase.label}
              </button>
              {i < arr.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-stone-300 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

    </div>
  );
}
