import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiTrash2, FiMoon, FiSun, FiBell, FiGlobe } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useConfirmStore from '../store/useConfirmStore';
import { changePassword, deleteAccount } from '../services/api';

const Settings = () => {
  const { logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { openConfirm } = useConfirmStore();
  
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    try {
      setPassLoading(true);
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    openConfirm(
      'Delete Account',
      'Are you absolutely sure you want to delete your account? This action is permanent and will delete all your tasks.',
      async () => {
        try {
          await deleteAccount();
          toast.success('Account deleted successfully');
          logout();
        } catch (error) {
          toast.error('Failed to delete account');
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-6 h-fit">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Preferences</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                {isDarkMode ? <FiMoon /> : <FiSun />}
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-white">Theme</p>
                <p className="text-xs text-slate-500">Toggle dark mode</p>
              </div>
            </div>
            <button onClick={toggleDarkMode} className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between opacity-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg"><FiBell /></div>
              <div>
                <p className="font-medium text-slate-800 dark:text-white">Notifications</p>
                <p className="text-xs text-slate-500">Email & push alerts (Coming soon)</p>
              </div>
            </div>
            <button disabled className="w-12 h-6 rounded-full bg-slate-300 relative cursor-not-allowed">
              <div className="w-4 h-4 bg-white rounded-full absolute top-1 translate-x-7" />
            </button>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Security</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
              <input type="password" required value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <input type="password" required minLength={6} value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <input type="password" required minLength={6} value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="input-field" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={passLoading} className="btn btn-primary w-full">
                {passLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 md:col-span-2 border-rose-200 dark:border-rose-900/50">
          <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 border-b border-rose-100 dark:border-rose-900/50 pb-2 mb-4">Danger Zone</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-slate-800 dark:text-white">Delete Account</p>
              <p className="text-sm text-slate-500">Permanently delete your account and all your data. This cannot be undone.</p>
            </div>
            <button onClick={handleDeleteAccount} className="btn btn-danger whitespace-nowrap">
              <FiTrash2 className="mr-2" /> Delete Account
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Settings;
