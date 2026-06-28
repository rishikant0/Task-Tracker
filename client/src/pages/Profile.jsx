import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiSave, FiTrash2 } from 'react-icons/fi';
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
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">My Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name}</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{user?.email}</p>
          
          <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-700 pt-6">
            <div>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats?.total || 0}</p>
              <p className="text-xs text-slate-500 uppercase">Total Tasks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.completed || 0}</p>
              <p className="text-xs text-slate-500 uppercase">Completed</p>
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Update Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><FiUser /></div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><FiMail /></div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field pl-10" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : <><FiSave className="mr-2" /> Save Changes</>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
