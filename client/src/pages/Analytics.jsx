import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { Download, Filter, TrendingUp, Clock, CheckCircle2, Zap, Loader2 } from 'lucide-react';
import { getAnalytics } from '../services/api';



const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hours = ['8a', '10a', '12p', '2p', '4p', '6p', '8p'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('Weekly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalytics();
        setData(res.data);
        setHeatmapData(res.data.heatmap || []);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  const StatBox = ({ title, value, trend, icon: Icon, color }) => (
    <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}>
          <Icon size={24} />
        </div>
        <span className={`flex items-center gap-1 text-sm font-bold ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      </div>
      <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
      <p className="text-sm font-medium text-slate-500">{title}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = data?.stats || { total: 0, completed: 0 };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  // Format weeklyData to match ComposedChart expected data format (adding mock hours)
  const chartData = (data?.weekly || []).map(d => ({
    name: d.name,
    completed: d.tasks,
    hours: Math.round(d.tasks * 1.5 * 10) / 10 // roughly 1.5 hours per task
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Performance Analytics</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed insights into your productivity and task completion.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field h-10 py-0 w-32"
          >
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
          <button className="btn bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
            <Filter size={16} /> Filters
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox title="Completion Rate" value={`${completionRate}%`} trend={completionRate > 50 ? 5.2 : -1.2} icon={CheckCircle2} color="from-emerald-500 to-teal-500" />
        <StatBox title="Productivity Score" value={Math.min(100, completionRate + 15)} trend={1.8} icon={TrendingUp} color="from-indigo-500 to-blue-500" />
        <StatBox title="Total Tasks" value={stats.total} trend={0} icon={Zap} color="from-purple-500 to-pink-500" />
        <StatBox title="Hours Logged" value={`${Math.round(stats.completed * 1.5)}h`} trend={2.4} icon={Clock} color="from-orange-500 to-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Productivity Trend</h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">Last 7 Days</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1E293B', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar yAxisId="left" dataKey="completed" name="Tasks" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="hours" name="Hours" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Focus Heatmap (Simulated) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Heatmap</h3>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Peak Hours</span>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-8 gap-2">
              <div className="col-span-1 flex flex-col justify-between py-2 text-xs text-slate-400 font-medium h-[240px]">
                {days.map(d => <span key={d}>{d}</span>)}
              </div>
              <div className="col-span-7 grid grid-cols-12 gap-1.5 h-[240px]">
                {heatmapData.map((d, i) => {
                  let colorClass = 'bg-slate-100 dark:bg-slate-800';
                  if (d.value > 80) colorClass = 'bg-primary';
                  else if (d.value > 60) colorClass = 'bg-primary/70';
                  else if (d.value > 40) colorClass = 'bg-primary/50';
                  else if (d.value > 20) colorClass = 'bg-primary/30';
                  
                  return (
                    <div 
                      key={i} 
                      className={`rounded-sm w-full h-[28px] ${colorClass} hover:ring-2 hover:ring-white dark:hover:ring-slate-900 transition-all cursor-pointer`}
                      title={`${d.value}% active`}
                    ></div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-between pl-[12.5%] mt-3 text-xs text-slate-400 font-medium">
              {hours.map(h => <span key={h}>{h}</span>)}
            </div>
            
            <div className="flex items-center justify-end gap-2 mt-4 text-xs font-medium text-slate-500">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/50"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/70"></div>
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
              </div>
              <span>More</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
