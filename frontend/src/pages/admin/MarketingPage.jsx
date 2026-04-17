import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader2, TrendingUp, DollarSign, Activity, Users, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as BarTooltip,
} from 'recharts';

// Theme colors
const P = {
  charcoal:  '#1c1917',
  stone:     '#57534e',
  light:     '#a8a29e',
  pale:      '#d6d3d1',
  maroon:    '#800000',
  surface:   '#fafaf9',
  border:    '#e7e5e4',
};

const CHART_COLORS = [P.charcoal, P.stone, P.light, P.pale, '#e7e5e4'];

// Helper to deterministic seed values
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return Math.abs(hash);
};

export default function MarketingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulation State
  const [simCode, setSimCode] = useState('');
  const [simValue, setSimValue] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/api/admin/marketing-stats');
        // enrich data with deterministic fake names, revenue & conversion rate
        const enriched = (res.data.data || []).map((item) => {
            const h = hashString(item.code);
            const aov = 2500 + (h % 3000); // 2500 - 5500
            const conversion = 1.5 + ((h % 50) / 10); // 1.5% - 6.5%
            const name = `Creator ${item.code.substring(0,4)}`;
            
            return {
                ...item,
                name,
                aov,
                conversion,
                revenue: item.usageCount * aov
            };
        });
        
        setData(enriched.sort((a, b) => b.usageCount - a.usageCount));
      } catch (err) {
        console.error('Failed to fetch', err);
        toast.error("Failed to load influencer data.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleSimulate = (e) => {
      e.preventDefault();
      const codeToSim = simCode.toUpperCase().trim();
      const value = parseFloat(simValue);

      if (!codeToSim || isNaN(value)) {
          toast.error("Please enter a valid code and order value.", { 
              autoClose: 2000, 
              style: { background: P.charcoal, color: '#fff', fontSize: '12px', fontWeight: 'bold' }
          });
          return;
      }

      const existingIndex = data.findIndex(d => d.code === codeToSim);
      if (existingIndex === -1) {
          toast.error("Code not found in seeded db.", { 
              autoClose: 2000,
              style: { background: P.charcoal, color: '#fff', fontSize: '12px', fontWeight: 'bold' } 
          });
          return;
      }

      // Update Local State conceptually
      const newData = [...data];
      const item = newData[existingIndex];
      item.usageCount += 1;
      item.revenue += value;
      // Re-sort array
      newData.sort((a,b) => b.usageCount - a.usageCount);
      setData(newData);

      toast.success(`Checkout usage recorded for code: ${codeToSim} (₹${value}). (Not persisted)`, {
          duration: 3000,
          style: { background: P.charcoal, color: '#fff', fontSize: '12px', fontWeight: 'bold', border: `1px solid ${P.stone}` }
      });

      setSimCode('');
      setSimValue('');
  };

  const handleStatusToggle = (code) => {
      // conceptual only
      const newData = [...data];
      const index = newData.findIndex(d => d.code === code);
      if (index !== -1) {
          newData[index].isActive = !newData[index].isActive;
          setData(newData);
          toast("Status toggled conceptually.", { style: { background: P.charcoal, color: '#fff', fontSize: '12px' } });
      }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
      </div>
    );
  }

  const totalUses = data.reduce((acc, curr) => acc + curr.usageCount, 0);
  const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
  const avgDiscount = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.discountPercentage, 0) / data.length).toFixed(1) : 0;
  
  // Chart Data
  const donutData = data.filter(d => d.usageCount > 0);
  const barData = data.slice(0, 5); // top 5
  
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-white px-4 py-3 border border-stone-200 shadow-none text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-1">{p.code}</p>
          <p className="text-lg font-black text-stone-900 leading-none">{p.usageCount} Uses</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const p = payload[0].payload;
        return (
            <div className="bg-white px-3 py-2 border border-stone-200">
               <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block">{p.code}</span>
               <span className="text-sm font-black text-stone-900">{p.usageCount} Conversions</span>
            </div>
        )
    }
    return null;
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex items-end justify-between border-b border-stone-200 pb-4">
        <div>
           <h1 className="text-3xl font-black text-stone-900 tracking-[-0.04em] uppercase">Marketing Panel</h1>
           <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400 mt-1">Affiliate & Influencer Operations</p>
        </div>
      </div>

      {/* Simulator Hero */}
      <div className="bg-[#1c1917] p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Activity className="w-64 h-64" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-stone-300 flex items-center gap-2">
                       Real-Time Simulation
                  </h2>
                  <p className="text-xs font-medium text-stone-400 mt-2 max-w-md">
                      Test the dynamic linkage by simulating a successful checkout with an influencer code. 
                      Changes will instantly propagate to all metrics and visualizers without persisting to the database.
                  </p>
              </div>
              <form onSubmit={handleSimulate} className="flex flex-wrap items-center gap-3 bg-stone-900 p-4 border border-stone-800 w-full md:w-auto">
                  <input 
                      type="text" 
                      placeholder="Promo Code (e.g. DRIP15)"
                      value={simCode}
                      onChange={(e) => setSimCode(e.target.value.toUpperCase())}
                      className="bg-transparent border-b border-stone-700 text-sm font-bold text-white px-2 py-2 w-40 focus:outline-none focus:border-stone-400 placeholder:text-stone-600 uppercase tracking-wider"
                  />
                  <input 
                      type="number" 
                      placeholder="Order ₹"
                      value={simValue}
                      onChange={(e) => setSimValue(e.target.value)}
                      className="bg-transparent border-b border-stone-700 text-sm font-bold text-white px-2 py-2 w-28 focus:outline-none focus:border-stone-400 placeholder:text-stone-600"
                  />
                  <button type="submit" className="ml-2 bg-white text-stone-900 font-black text-xs uppercase tracking-widest px-6 py-3 flex items-center gap-2 hover:bg-stone-200 transition-colors">
                      Simulate
                      <Send className="w-3 h-3" />
                  </button>
              </form>
          </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-200 p-6 flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2"><TrendingUp className="w-3 h-3"/> Total Conversions</span>
              <span className="text-4xl font-black text-stone-900 tracking-tighter">{totalUses}</span>
          </div>
          <div className="bg-white border border-stone-200 p-6 flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2"><DollarSign className="w-3 h-3"/> Gross Revenue</span>
              <span className="text-4xl font-black text-stone-900 tracking-tighter">₹{totalRevenue.toLocaleString()}</span>
          </div>
          <div className="bg-white border border-stone-200 p-6 flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2"><Activity className="w-3 h-3"/> Avg Deal</span>
              <span className="text-4xl font-black text-stone-900 tracking-tighter">{avgDiscount}% <span className="text-base text-stone-400">off</span></span>
          </div>
          <div className="bg-white border border-stone-200 p-6 flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-stone-400 mb-4 flex items-center gap-2"><Users className="w-3 h-3"/> Active Codes</span>
              <span className="text-4xl font-black text-stone-900 tracking-tighter">{data.filter(d=>d.isActive).length}<span className="text-base text-stone-400">/{data.length}</span></span>
          </div>
      </div>

      {/* Flow & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-stone-200 p-6 shadow-none">
          <div className="mb-4">
            <h3 className="text-sm font-black text-stone-900 tracking-tight uppercase">Attribution Share</h3>
          </div>
          {donutData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="usageCount" stroke="none">
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center"><p className="text-xs uppercase tracking-widest font-bold text-stone-300">No data</p></div>
          )}
        </div>

        <div className="bg-white border border-stone-200 p-6 shadow-none">
          <div className="mb-4">
            <h3 className="text-sm font-black text-stone-900 tracking-tight uppercase">Top 5 Converters</h3>
          </div>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <XAxis type="number" hide={true} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="code" axisLine={false} tickLine={false} tick={{ fill: P.stone, fontSize: 10, fontWeight: 'bold' }} width={80}/>
                <BarTooltip cursor={{ fill: '#f5f5f4' }} content={<CustomBarTooltip />} />
                <Bar dataKey="usageCount" fill={P.charcoal} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-[250px] flex items-center justify-center"><p className="text-xs uppercase tracking-widest font-bold text-stone-300">No data</p></div>
          )}
        </div>
      </div>

      {/* Influencer Code Detailed Table */}
      <div className="bg-white border border-stone-200">
          <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                  <h3 className="text-sm font-black text-stone-900 tracking-tight uppercase">Influencer Code Performance</h3>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Full 15-code roster</p>
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-stone-50 border-b border-stone-100">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500 w-16">Rank</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Code</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500">Influencer Ref</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500 text-right">Discount</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500 text-right">Uses</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500 text-right">Revenue</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500 text-right">AOV</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-stone-500 text-center">Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {data.map((item, idx) => (
                          <tr key={item.code} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors group">
                              <td className="px-6 py-4 text-xs font-black text-stone-300">{idx + 1}</td>
                              <td className="px-6 py-4 text-xs font-bold text-stone-900 tracking-wider font-mono">{item.code}</td>
                              <td className="px-6 py-4 text-xs font-medium text-stone-500">{item.name}</td>
                              <td className="px-6 py-4 text-xs font-bold text-stone-900 text-right">{item.discountPercentage}%</td>
                              <td className="px-6 py-4 text-xs font-black text-[#800000] text-right">{item.usageCount}</td>
                              <td className="px-6 py-4 text-xs font-bold text-stone-900 text-right">₹{item.revenue.toLocaleString()}</td>
                              <td className="px-6 py-4 text-xs font-medium text-stone-500 text-right">₹{item.aov.toLocaleString()}</td>
                              <td className="px-6 py-4 text-center">
                                  <button onClick={() => handleStatusToggle(item.code)} className={`w-12 h-6 flex items-center rounded-full px-1 mx-auto transition-colors ${item.isActive ? 'bg-[#800000]' : 'bg-stone-200'}`}>
                                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
      
    </div>
  );
}
