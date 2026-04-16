import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, Legend, LabelList 
} from 'recharts';
import api from '../../services/api';
import { Loader2, TrendingUp, Gift, Users } from 'lucide-react';

/**
 * RetentionAnalytics — Admin Dashboard Component
 * Visualises user activity health and birthday distribution.
 * Adheres to "Warm Editorial Minimalism" design system.
 */
const RetentionAnalytics = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['retentionStats'],
        queryFn: async () => {
            const res = await api.get('/api/admin/retention-stats');
            return res.data;
        }
    });

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Loader2 className="w-8 h-8 text-stone-300 animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Aggregating retention data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-96 flex items-center justify-center bg-white rounded-2xl border border-red-50 shadow-sm p-8 text-center">
                <p className="text-sm font-medium text-red-500 uppercase tracking-widest">Failed to load retention metrics.</p>
            </div>
        );
    }

    const { activityHealth, birthdayDistribution } = data;

    // ── CHARCOAL (Active), STONE (Slipping), PALE STONE (Inactive) ──
    const COLORS = ['#1c1917', '#57534e', '#d6d3d1'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. Activity Health (Donut Chart) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-stone-900 uppercase tracking-tight">Activity Health</h2>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">User segments by login frequency</p>
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={activityHealth}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {activityHealth.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#1c1917', 
                                    border: 'none', 
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend 
                                verticalAlign="bottom" 
                                align="center"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Birthday Forecast (Bar Chart) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white">
                        <Gift size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-stone-900 uppercase tracking-tight">Birthday Forecast</h2>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Inventory planning for annual drops</p>
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={birthdayDistribution}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                            <XAxis 
                                dataKey="month" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#57534e' }}
                            />
                            <YAxis 
                                hide 
                            />
                            <Tooltip 
                                cursor={{ fill: '#f8f9fa' }}
                                contentStyle={{ 
                                    backgroundColor: '#1c1917', 
                                    border: 'none', 
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Bar 
                                dataKey="count" 
                                fill="#800000" 
                                radius={[4, 4, 0, 0]} 
                                barSize={24}
                            >
                                <LabelList dataKey="count" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#a8a29e' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default RetentionAnalytics;
