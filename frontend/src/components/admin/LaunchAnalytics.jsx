import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { Loader2, Zap, Users, Gift, Mail } from 'lucide-react';

const P = {
  charcoal:  '#1c1917',
  stone:     '#57534e',
  light:     '#a8a29e',
  pale:      '#d6d3d1',
  maroon:    '#800000',
  surface:   '#fafaf9',
  border:    '#e7e5e4',
};

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: `1px solid ${P.border}`,
    borderRadius: '2px',
    boxShadow: 'none',
    fontSize: 10,
    fontFamily: 'inherit',
    padding: '6px 10px',
  },
  itemStyle: { color: P.charcoal, fontWeight: 700 },
  labelStyle: { color: P.stone, fontWeight: 600 },
};

export default function LaunchAnalytics() {
  const [launchData, setLaunchData] = useState({ metrics: null, goodies: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await api.get('/api/admin/launch-metrics');
        setLaunchData({ metrics: res.data.metrics, goodies: res.data.goodies });
      } catch (err) {
        console.error('Failed to fetch launch metrics', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center bg-white border border-stone-100 rounded-sm">
        <Loader2 className="w-5 h-5 text-stone-300 animate-spin" />
      </div>
    );
  }

  // Filter and map goodie data for chart
  const goodieData = (launchData.goodies || []).map(d => ({
    name: d.itemName,
    count: d.quantityAllocated
  }));

  const eaCount = launchData.metrics?.foundingMembersCount || 0;
  const eaLimit = 500;
  const eaPercentage = Math.min((eaCount / eaLimit) * 100, 100);

  return (
    <div className="space-y-6 mb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="px-2 py-0.5 bg-stone-900 text-white text-[9px] font-black uppercase tracking-[0.2em]">
          Launch Command Center
        </div>
        <div className="flex-1 h-px bg-stone-100" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Live Strategy Feed</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Component A: Early Adopter Progress */}
        <div className="lg:col-span-8 bg-white border border-stone-100 rounded-sm p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-900">Founding Members</h3>
                    <p className="text-[10px] font-medium text-stone-400 mt-0.5">Progress toward Early Adopter limit ({eaLimit})</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-stone-900 tracking-tighter">{eaCount}</span>
                    <span className="text-xs font-bold text-stone-300 ml-1">/ {eaLimit}</span>
                </div>
            </div>
            
            <div className="relative h-2 w-full bg-stone-50 rounded-full overflow-hidden border border-stone-100">
                <div 
                    className="absolute top-0 left-0 h-full bg-stone-900 transition-all duration-1000 ease-out"
                    style={{ width: `${eaPercentage}%` }}
                />
            </div>
            
            <div className="flex justify-between mt-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 italic">Phase 01: Genesis</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-stone-900">{Math.round(eaPercentage)}% Captive</p>
            </div>
        </div>

        {/* Component B: Quick Metrics */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-5">
            {/* Newsletter conversion */}
            <div className="bg-white border border-stone-100 rounded-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-stone-50 flex items-center justify-center rounded-sm">
                    <Mail className="w-5 h-5 text-stone-900" />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 leading-none mb-1">List Growth</p>
                    <p className="text-xl font-black text-stone-900 tracking-tight">{launchData.metrics?.listConversionRate || 0}% <span className="text-[10px] font-bold text-stone-300 lowercase tracking-normal">conv.</span></p>
                </div>
            </div>
            {/* Promo usage */}
            <div className="bg-white border border-stone-100 rounded-sm p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#800000] flex items-center justify-center rounded-sm">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 leading-none mb-1">Code: FIRSTDROP</p>
                    <p className="text-xl font-black text-stone-900 tracking-tight">{launchData.metrics?.promoCodeUses || 0} <span className="text-[10px] font-bold text-stone-300 lowercase tracking-normal">uses</span></p>
                </div>
            </div>
        </div>

        {/* Component C: Goodie Distribution */}
        <div className="lg:col-span-12 bg-white border border-stone-100 rounded-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-stone-900">Physical Goodie Allocation</h3>
                    <p className="text-[10px] font-medium text-stone-400 mt-0.5">Inventory distribution for Founding Member kits</p>
                </div>
                <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-stone-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Total Allocations</span>
                </div>
            </div>

            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={goodieData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                        <CartesianGrid stroke={P.border} strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: P.light, fontSize: 10, fontWeight: 700 }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: P.light, fontSize: 10, fontWeight: 700 }}
                        />
                        <Tooltip {...TOOLTIP_STYLE} />
                        <Bar 
                            dataKey="count" 
                            fill={P.charcoal} 
                            radius={[2, 2, 0, 0]}
                            barSize={60}
                        >
                            {goodieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? P.charcoal : index === 1 ? P.stone : P.light} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}
