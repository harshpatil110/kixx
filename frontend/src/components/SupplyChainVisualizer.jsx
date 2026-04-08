import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Handle,
  Position,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ─── Color Tokens ─────────────────────────────────────────────────────────────
const C = {
  financial: '#22c55e',
  physical:  '#3b82f6',
  data:      '#f59e0b',
};

// ─── Node Metadata ────────────────────────────────────────────────────────────
const NODE_META = {
  consumer: { label: 'Consumer',        icon: '🛍️', color: '#818cf8' },
  kixx:     { label: 'KIXX Platform',   icon: '⚡', color: '#f43f5e' },
  reseller: { label: 'Reseller',        icon: '📦', color: '#0ea5e9' },
  courier:  { label: 'Courier Partner', icon: '🚚', color: '#f59e0b' },
  escrow:   { label: 'Escrow / Bank',   icon: '🏦', color: '#22c55e' },
};

// ─── Layout positions (fixed, not re-positioned per phase) ───────────────────
const NODE_POS = {
  consumer: { x: 520, y: 180 },
  kixx:     { x: 260, y: 180 },
  reseller: { x:   0, y: 180 },
  courier:  { x: 260, y:  20 },
  escrow:   { x: 260, y: 340 },
};

// ─── Phase Definitions ────────────────────────────────────────────────────────
const PHASES = [
  {
    id: 'handshake',
    label: 'Digital Handshake',
    step: '01',
    color: C.data,
    title: 'Consumer → KIXX: Order Placement',
    description:
      'The consumer browses the KIXX storefront, selects a product, and submits a checkout. KIXX validates the order, reserves inventory from the matched reseller, and creates an internal order record.',
    actions: [
      'Consumer submits cart via KIXX checkout',
      'KIXX validates SKU availability against reseller stock',
      'Order record created with PENDING status',
      'Reseller receives pick-pack notification via KIXX panel',
    ],
    risks: [
      'SKU mismatch → order auto-cancelled, consumer notified',
      'Fraud score trigger → order held for manual review',
    ],
    activeNodes: ['consumer', 'kixx'],
    edges: [
      {
        id: 'e1',
        source: 'consumer',
        target: 'kixx',
        animated: true,
        style: { stroke: C.data, strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.data },
        label: 'Order Request',
        labelStyle: { fill: '#fde68a', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
      {
        id: 'e2',
        source: 'kixx',
        target: 'reseller',
        animated: true,
        style: { stroke: C.data, strokeWidth: 2, strokeDasharray: '5 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.data },
        label: 'Stock Check',
        labelStyle: { fill: '#fde68a', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
    ],
  },
  {
    id: 'inbound',
    label: 'Inbound Logistics',
    step: '02',
    color: C.physical,
    title: 'Reseller → Courier: Physical Handoff',
    description:
      'The reseller picks, packs, and seals the order. KIXX dispatches a pickup request to the integrated courier partner. The reseller hands over the parcel; the courier generates an AWB and scan-confirms pickup.',
    actions: [
      'KIXX dispatches pickup request to Courier API',
      'Courier generates AWB + tracking number',
      'Reseller prepares and seals the package',
      'Courier collects parcel and scan-confirms at facility',
    ],
    risks: [
      'Pickup failure → KIXX re-dispatches, reseller SLA clock starts',
      'Package damage at handoff → photo evidence flagged',
    ],
    activeNodes: ['reseller', 'courier', 'kixx'],
    edges: [
      {
        id: 'e3',
        source: 'kixx',
        target: 'courier',
        animated: true,
        style: { stroke: C.physical, strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.physical },
        label: 'Pickup Request',
        labelStyle: { fill: '#93c5fd', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
      {
        id: 'e4',
        source: 'reseller',
        target: 'courier',
        animated: true,
        style: { stroke: C.physical, strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.physical },
        label: 'Physical Handoff',
        labelStyle: { fill: '#93c5fd', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
    ],
  },
  {
    id: 'vault',
    label: 'The Vault',
    step: '03',
    color: C.financial,
    title: 'Consumer → Escrow: Payment Capture',
    description:
      `Simultaneously with order placement, the consumer's payment is captured and placed into a secure escrow account. Funds remain locked until delivery confirmation is received, protecting both buyer and seller.`,
    actions: [
      'Payment gateway captures consumer funds',
      'Escrow account receives and holds the transaction',
      'KIXX receives payment confirmation signal',
      'Order status moves from PENDING to CONFIRMED',
    ],
    risks: [
      'Payment gateway timeout → retry x3, then order cancelled',
      'Suspected chargeback → escrow flagged, reseller payout frozen',
    ],
    activeNodes: ['consumer', 'escrow', 'kixx'],
    edges: [
      {
        id: 'e5',
        source: 'consumer',
        target: 'escrow',
        animated: true,
        style: { stroke: C.financial, strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.financial },
        label: 'Payment Captured',
        labelStyle: { fill: '#86efac', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
      {
        id: 'e6',
        source: 'escrow',
        target: 'kixx',
        animated: true,
        style: { stroke: C.financial, strokeWidth: 2, strokeDasharray: '5 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.financial },
        label: 'Confirmation Signal',
        labelStyle: { fill: '#86efac', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
    ],
  },
  {
    id: 'outbound',
    label: 'Outbound Logistics',
    step: '04',
    color: C.physical,
    title: 'Courier → Consumer: Last-Mile Delivery',
    description:
      `The courier partner executes last-mile delivery from its facility to the consumer's address. Real-time tracking events are pushed to KIXX, which forwards them to the consumer's order tracking dashboard.`,
    actions: [
      'Courier sorts parcel at hub and assigns delivery agent',
      'Real-time GPS tracking events pushed to KIXX API',
      'Delivery attempt made at consumer address',
      'Consumer signs/OTP-confirms delivery receipt',
    ],
    risks: [
      'Delivery exception (address issue) → KIXX support ticket auto-created',
      'Non-delivery after 3 attempts → return-to-origin initiated',
    ],
    activeNodes: ['courier', 'consumer', 'kixx'],
    edges: [
      {
        id: 'e7',
        source: 'courier',
        target: 'consumer',
        animated: true,
        style: { stroke: C.physical, strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.physical },
        label: 'Last-Mile Delivery',
        labelStyle: { fill: '#93c5fd', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
      {
        id: 'e8',
        source: 'courier',
        target: 'kixx',
        animated: true,
        style: { stroke: C.data, strokeWidth: 1.5, strokeDasharray: '4 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.data },
        label: 'Tracking Events',
        labelStyle: { fill: '#fde68a', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
    ],
  },
  {
    id: 'settlement',
    label: 'Financial Settlement',
    step: '05',
    color: C.financial,
    title: 'Escrow → Reseller: Payout Release',
    description:
      `Upon delivery confirmation from the courier, KIXX signals the escrow to release funds. The escrow deducts the KIXX platform commission, then disburses the net payout to the reseller's registered bank account.`,
    actions: [
      'KIXX receives delivery-confirmed event from Courier API',
      'KIXX sends payout release instruction to Escrow',
      'Escrow deducts platform commission (configurable %)',
      'Net amount disbursed to Reseller bank account within 24–48h',
    ],
    risks: [
      'Open dispute by consumer → escrow release frozen pending resolution',
      'Bank routing failure → escrow retries with alternate IFSC',
    ],
    activeNodes: ['escrow', 'reseller', 'kixx'],
    edges: [
      {
        id: 'e9',
        source: 'kixx',
        target: 'escrow',
        animated: true,
        style: { stroke: C.financial, strokeWidth: 2, strokeDasharray: '5 3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.financial },
        label: 'Release Signal',
        labelStyle: { fill: '#86efac', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
      {
        id: 'e10',
        source: 'escrow',
        target: 'reseller',
        animated: true,
        style: { stroke: C.financial, strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: C.financial },
        label: 'Payout (Net)',
        labelStyle: { fill: '#86efac', fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: 'transparent' },
      },
    ],
  },
];

// ─── Custom Node ──────────────────────────────────────────────────────────────
function SupplyNode({ data }) {
  const { label, icon, color, active } = data;
  return (
    <div
      style={{
        background: active ? `${color}1a` : 'rgba(255,255,255,0.03)',
        border: `2px solid ${active ? color : 'rgba(255,255,255,0.10)'}`,
        boxShadow: active
          ? `0 0 24px ${color}55, 0 0 48px ${color}18`
          : '0 2px 12px rgba(0,0,0,0.5)',
        opacity: active ? 1 : 0.38,
        transition: 'all 0.35s ease',
        minWidth: 130,
      }}
      className="rounded-2xl px-4 py-3 text-center cursor-default select-none"
    >
      <Handle type="target" position={Position.Top}    style={{ background: color, border: 'none', width: 7, height: 7 }} />
      <Handle type="target" position={Position.Left}   style={{ background: color, border: 'none', width: 7, height: 7 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: 'none', width: 7, height: 7 }} />
      <Handle type="source" position={Position.Right}  style={{ background: color, border: 'none', width: 7, height: 7 }} />
      <div
        className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-lg"
        style={{ background: active ? `${color}33` : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? color : 'transparent'}` }}
      >
        {icon}
      </div>
      <div className="text-[13px] font-bold text-white tracking-wide leading-tight">{label}</div>
    </div>
  );
}

const nodeTypes = { supply: SupplyNode };

// ─── Main Visualizer ──────────────────────────────────────────────────────────
export default function SupplyChainVisualizer({ activePhaseId }) {
  const phase = useMemo(
    () => PHASES.find((p) => p.id === activePhaseId) ?? PHASES[0],
    [activePhaseId]
  );

  const nodes = useMemo(
    () =>
      Object.entries(NODE_META).map(([id, meta]) => ({
        id,
        type: 'supply',
        position: NODE_POS[id],
        draggable: true,
        data: {
          ...meta,
          active: phase.activeNodes.includes(id),
        },
      })),
    [phase]
  );

  return (
    // CRITICAL: wrapper must have explicit pixel height so ReactFlow is never 0px
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={phase.edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.2}
          color="rgba(255,255,255,0.07)"
        />
        <Controls
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
          }}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}

// Re-export PHASES so VisualizationPage can consume them
export { PHASES };
