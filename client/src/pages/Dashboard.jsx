import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Clock, AlertCircle, Activity, 
  Plus, TrendingUp, Zap, Target, Star, BrainCircuit,
  Flame, Calendar as CalendarIcon, ArrowUpRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import useAuthStore from '../store/useAuthStore';
import useModalStore from '../store/useModalStore';
import { getAnalytics, getActivities } from '../services/api';

const StatCard = ({ title, value, icon, trend, trendValue, color, delay, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    onClick={onClick}
    className="relative group cursor-pointer"
  >
    <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
    <div className="relative glass-card p-6 rounded-2xl border border-white/20 dark:border-slate-700/50 hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white flex items-baseline gap-2">
            {value}
            {trend && (
              <span className={`text-sm font-medium flex items-center ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
                {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowUpRight size={16} className="rotate-90" />}
                {trendValue}
              </span>
            )}
          </h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      
      {/* Mini Chart Mockup */}
      <div className="mt-4 h-10 w-full opacity-50 flex items-end gap-1">
        {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
          <div key={i} className={`flex-1 rounded-t-sm bg-gradient-to-t ${color} opacity-40`} style={{ height: `${h}%` }}></div>
        ))}
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const { openModal } = useModalStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [res, actRes] = await Promise.all([getAnalytics(), getActivities()]);
        setData(res.data);
        setActivities(actRes.data.slice(0, 5)); 
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    window.addEventListener('taskSaved', fetchDashboardData);
    return () => window.removeEventListener('taskSaved', fetchDashboardData);
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || { total: 0, completed: 0, inProgress: 0, pending: 0, highPriority: 0, overdue: 0 };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  const pieData = [
    { name: 'Completed', value: stats.completed, color: '#22C55E' },
    { name: 'In Progress', value: stats.inProgress, color: '#6366F1' },
    { name: 'Pending', value: stats.pending, color: '#F59E0B' },
  ].filter(item => item.value > 0);

  const weeklyData = data?.weekly || [];



  return (
    <div className="space-y-8 pb-20 relative">
      
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Hero Section */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden bg-gradient-to-br from-indigo-50/80 to-white/80 dark:from-slate-800/80 dark:to-slate-900/80 border border-white/50 dark:border-slate-700/50"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap size={120} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold text-slate-900 dark:text-white mb-2"
              >
                Good Morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user?.name?.split(' ')[0]}</span> 👋
              </motion.h1>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CalendarIcon size={16} /> {today}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/40 dark:border-slate-700/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Today's Goal</p>
                  <p className="font-bold text-slate-900 dark:text-white">Complete 5 Tasks</p>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/40 dark:border-slate-700/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning">
                  <Flame size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Current Streak</p>
                  <p className="font-bold text-slate-900 dark:text-white">12 Days</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Productivity Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-6 bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden shadow-glow"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit size={24} />
            <h3 className="font-bold text-lg">AI Assistant</h3>
          </div>
          
          <p className="text-white/90 text-sm leading-relaxed mb-6 font-medium">
            "Your productivity is peaking! Based on your patterns, you're most effective in the next 2 hours. Focus on high-priority tasks now."
          </p>

          <div className="space-y-3">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10 flex items-center justify-between">
              <span className="text-sm font-medium">Productivity Score</span>
              <span className="font-bold">94/100</span>
            </div>
            <button 
              onClick={() => openModal()}
              className="w-full py-3 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-lg active:scale-95"
            >
              Start Deep Work
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10">
        <StatCard 
          onClick={() => navigate('/list')} 
          title="Total Tasks" 
          value={stats.total} 
          trend="up" 
          trendValue="12%"
          icon={<Activity size={24} />} 
          color="from-blue-500 to-cyan-500" 
          delay={0.1} 
        />
        <StatCard 
          onClick={() => navigate('/list?status=Completed')} 
          title="Completed" 
          value={stats.completed} 
          trend="up" 
          trendValue="8%"
          icon={<CheckCircle2 size={24} />} 
          color="from-emerald-500 to-teal-500" 
          delay={0.2} 
        />
        <StatCard 
          onClick={() => navigate('/list?priority=High')} 
          title="High Priority" 
          value={stats.highPriority} 
          trend="down" 
          trendValue="2%"
          icon={<Star size={24} />} 
          color="from-orange-500 to-amber-500" 
          delay={0.3} 
        />
        <StatCard 
          onClick={() => navigate('/list?overdue=true')} 
          title="Overdue" 
          value={stats.overdue || stats.pending} 
          trend="up" 
          trendValue="1%"
          icon={<AlertCircle size={24} />} 
          color="from-rose-500 to-pink-500" 
          delay={0.4} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Weekly Progress Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 lg:col-span-2 rounded-3xl"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Productivity Overview</h3>
              <p className="text-sm text-slate-500">Tasks completed over the last 7 days</p>
            </div>
            <button className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">This Week</button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#fff', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 rounded-3xl flex flex-col"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Status Breakdown</h3>
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1E293B', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No tasks found</p>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}80` }}></div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Log */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-6 rounded-3xl relative z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          <button className="text-sm font-medium text-primary hover:underline">View All</button>
        </div>
        <div className="space-y-4">
          {activities.length > 0 ? activities.map((activity, index) => (
            <div key={index} className="flex gap-4 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Activity size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white text-sm">{activity.action}</p>
                <p className="text-xs text-slate-500 mt-1">{activity.details}</p>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {new Date(activity.createdAt).toLocaleDateString()}
              </div>
            </div>
          )) : (
            <p className="text-center text-slate-500 py-4">No recent activity.</p>
          )}
        </div>
      </motion.div>

      {/* Floating Action Button (FAB) */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => openModal()}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-full flex items-center justify-center shadow-glow xl:hidden"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
};

export default Dashboard;
