import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiClock, FiAlertCircle, FiStar, FiCalendar, FiActivity, FiPlus } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../store/useAuthStore';
import useModalStore from '../store/useModalStore';
import { getAnalytics, getActivities } from '../services/api';

const StatCard = ({ title, value, icon, color, delay, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    onClick={onClick}
    className="glass-card p-6 flex items-center justify-between group hover:-translate-y-1 transition-transform cursor-pointer"
  >
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 text-2xl transition-transform group-hover:scale-110 group-hover:rotate-3`}>
      {icon}
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
        setActivities(actRes.data.slice(0, 5)); // Just get the latest 5
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = data?.stats || { total: 0, completed: 0, inProgress: 0, pending: 0, highPriority: 0, overdue: 0 };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  const pieData = [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgress, color: '#6366f1' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const weeklyData = data?.weekly || [];

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-slate-800 dark:text-white"
          >
            Good Morning 👋 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{user?.name?.split(' ')[0]}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2"
          >
            <FiCalendar /> {today}
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => openModal()}
            className="mt-6 btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2"
          >
            <FiPlus size={20} /> Create New Task
          </motion.button>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-3 rounded-xl border border-indigo-100 dark:border-indigo-800 relative z-10"
        >
          <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 italic">
            "Stay productive. Manage your work efficiently."
          </p>
        </motion.div>
        
        {/* Background Decorative Blob */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard onClick={() => navigate('/list')} title="Total Tasks" value={stats.total} icon={<FiActivity className="text-indigo-500" />} color="bg-indigo-500" delay={0.1} />
        <StatCard onClick={() => navigate('/list?status=Completed')} title="Completed" value={stats.completed} icon={<FiCheckCircle className="text-emerald-500" />} color="bg-emerald-500" delay={0.2} />
        <StatCard onClick={() => navigate('/list?priority=High')} title="High Priority" value={stats.highPriority} icon={<FiStar className="text-orange-500" />} color="bg-orange-500" delay={0.3} />
        <StatCard onClick={() => navigate('/list?overdue=true')} title="Pending" value={stats.pending} icon={<FiClock className="text-rose-500" />} color="bg-rose-500" delay={0.4} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Tasks Created This Week</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="tasks" fill="url(#colorTasks)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Task Distribution</h3>
          <div className="flex items-center justify-center h-56">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No tasks found</p>
            )}
          </div>
          <div className="mt-4 flex flex-col justify-center gap-3">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
        {/* Activity Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6 lg:col-span-3 mt-6"
        >
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h3>
          {activities.length > 0 ? (
            <div className="space-y-6">
              {activities.map((act, idx) => (
                <div key={act._id} className="relative flex gap-4 items-start">
                  {idx !== activities.length - 1 && (
                    <div className="absolute top-8 left-4 bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                  )}
                  <div className="relative z-10 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 flex items-center justify-center shrink-0 border-4 border-slate-50 dark:border-slate-900">
                    <FiActivity size={12} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{act.action}</p>
                    <p className="text-xs text-slate-500 mt-1">{act.details}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No recent activity found.
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => openModal()}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(99,102,241,0.5)] hover:scale-110 active:scale-95 transition-all"
      >
        <FiPlus size={24} />
      </button>
    </div>
  );
};

export default Dashboard;
