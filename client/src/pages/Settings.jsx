import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Trash2, Moon, Sun, Bell, Shield, Smartphone, Globe, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import useConfirmStore from '../store/useConfirmStore';
import { changePassword, deleteAccount } from '../services/api';

const Settings = () => {
  const { logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { openConfirm } = useConfirmStore();
  
  const [activeTab, setActiveTab] = useState('security');
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

  const tabs = [
    { id: 'security', label: 'Security & Login', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 font-medium">
                  <Icon size={18} />
                  {tab.label}
                </div>
                {isActive && <ChevronRight size={16} />}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Change Password */}
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <Lock className="text-primary" size={20} /> Change Password
                  </h3>
                  <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                      <input type="password" required value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                      <input type="password" required minLength={6} value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                      <input type="password" required minLength={6} value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={passLoading} className="btn bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-primary/30 transition-all">
                        {passLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Two Factor Authentication */}
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                      <Smartphone className="text-slate-400" size={20} /> Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                  <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-5 py-2.5 rounded-xl font-medium transition-colors">
                    Enable 2FA
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-900/10">
                  <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-4">Danger Zone</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">Delete Account</p>
                      <p className="text-sm text-slate-500 mt-1">Permanently delete your account and all your data. This cannot be undone.</p>
                    </div>
                    <button onClick={handleDeleteAccount} className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-rose-500/20 whitespace-nowrap flex items-center gap-2">
                      <Trash2 size={18} /> Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Appearance</h3>
                  
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center">
                        {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Theme</p>
                        <p className="text-sm text-slate-500">Toggle dark mode</p>
                      </div>
                    </div>
                    <button onClick={toggleDarkMode} className={`w-14 h-7 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${isDarkMode ? 'translate-x-8' : 'translate-x-1'} shadow-sm`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 text-center py-20"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Bell size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Notification Settings</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Fine-tune your email and push notifications. Coming soon in the next update.</p>
              </motion.div>
            )}

            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                  
                  <h3 className="text-xl font-bold mb-2">Pro Plan</h3>
                  <p className="text-indigo-100 mb-6 max-w-md">You are currently on the Pro plan. You have access to all premium features including advanced analytics and team management.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <button className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-2.5 rounded-xl font-bold transition-colors">
                      Manage Subscription
                    </button>
                    <span className="text-sm text-indigo-200">Renews on Oct 12, 2026</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
