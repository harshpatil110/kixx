import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
  RadialBarChart, RadialBar, 
  Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import { Loader2, Users, Target, Info } from 'lucide-react';

const P = {
  sneakerhead: '#1c1917', // Charcoal
  athlete:     '#44403c', // Stone Dark
  casual:      '#78716c', // Stone Mid
  gifter:      '#a8a29e', // Stone Light
  surface:     '#fafaf9',
  border:      '#e7e5e4',
};

const personaConfig = {
    Sneakerhead: { color: P.sneakerhead, label: 'Sneakerheads', hint: 'Focus: Hype & Drops' },
    Athlete:     { color: P.athlete,     label: 'Athletes',     hint: 'Focus: Tech & Performance' },
    Casual:      { color: P.casual,      label: 'Casual',       hint: 'Focus: Everyday Style' },
    Gifter:      { color: P.gifter,      label: 'Gifters',      hint: 'Focus: Sizing & Reliability' },
};

export default function PersonaAnalytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['audienceStats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/audience-stats');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white border border-stone-100 rounded-sm">
        <Loader2 className="w-5 h-5 text-stone-300 animate-spin" />
      </div>
    );
  }

  const rawData = stats?.data || [];
  const total = rawData.reduce((acc, curr) => acc + parseInt(curr.count, 10), 0);
  
  const chartData = rawData.map(d => {
      const config = personaConfig[d.persona] || { color: '#ccc', label: d.persona };
      return {
          name: config.label,
          count: parseInt(d.count, 10),
          fill: config.color,
          value: parseInt(d.count, 10),
      };
  }).sort((a,b) => b.count - a.count);

  const primaryPersona = chartData[0];
  const primaryPercentage = total > 0 ? Math.round((primaryPersona?.count / total) * 100) : 0;

  return (
    <div className="bg-white border border-stone-100 rounded-sm p-6 mb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
            <Target className="w-3.5 h-3.5" />
            Audience Segmentation
          </h2>
          <p className="text-[10px] font-medium text-stone-400 mt-1">Persona distribution of the current user base</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Chart */}
        <div className="lg:col-span-7 h-64">
           <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="20%" 
                outerRadius="100%" 
                barSize={15} 
                data={chartData}
            >
              <RadialBar
                minAngle={15}
                background
                clockWise
                dataKey="count"
                cornerRadius={10}
              />
              <Tooltip 
                contentStyle={{ fontSize: '10px', borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown & Analysis */}
        <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-stone-50 border border-stone-100 rounded-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400 mb-2">Admin Strategy Insight</p>
                <p className="text-sm font-bold text-stone-900 leading-snug">
                    Your primary audience is <span className="text-[#800000]">{primaryPersona?.name} ({primaryPercentage}%)</span>.
                </p>
                <p className="text-[11px] text-stone-500 font-medium mt-2 leading-relaxed">
                    Based on this segment, {primaryPersona?.name === 'Sneakerheads' ? 'prioritize "Limited Drop" alerts and archive restorations to drive resonance.' : 'focus on "Everyday Versatility" and sizing accuracy in your next marketing campaign.'}
                </p>
            </div>

            <div className="space-y-2">
                {chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-stone-50 last:border-0">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-black text-stone-900">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
