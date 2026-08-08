import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Save, CheckCircle2, Target, Award, Key, Smartphone, Monitor, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { updateProfile, getAnalytics } from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAnalytics();
        setStats(res.data.stats);
      } catch (error) {}
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await updateProfile(formData);
      updateUser(res.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        <div className="absolute -bottom-16 left-8 sm:left-12 flex items-end gap-6">
          <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-xl relative">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-success flex items-center justify-center">
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 px-4 sm:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {user?.name}
            <Shield className="text-primary" size={20} />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Mail size={16} /> {user?.email}
          </p>
        </div>
        <button className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2">
          <Award size={18} /> Pro Plan
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-4 sm:px-8">
        {/* Left Column: Stats & Activity */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="text-primary" size={20} /> Quick Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <Target className="text-indigo-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.total || 0}</p>
                <p className="text-xs text-slate-500 font-medium">Total Tasks</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <CheckCircle2 className="text-emerald-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.completed || 0}</p>
                <p className="text-xs text-slate-500 font-medium">Completed</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-600 dark:text-slate-400">Completion Rate</span>
                <span className="font-bold text-primary">
                  {stats?.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${stats?.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Key className="text-primary" size={20} /> Connected Devices
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <Monitor className="text-slate-400" size={24} />
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">MacBook Pro 14"</p>
                  <p className="text-xs text-slate-500">Active now • Chrome</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <Smartphone className="text-slate-400" size={24} />
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">iPhone 13 Pro</p>
                  <p className="text-xs text-slate-500">Last active 2h ago • iOS App</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Settings */}
        <div className="xl:col-span-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Personal Information</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><User size={18} /></div>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Mail size={18} /></div>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
                <button type="submit" disabled={loading} className="btn bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all flex items-center gap-2">
                  {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
