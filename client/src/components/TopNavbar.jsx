import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, Moon, Sun, Menu, User, Settings, 
  LogOut, Plus, Sparkles, ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import { getNotifications, markAllNotificationsAsRead } from '../services/api';

const TopNavbar = ({ toggleMobileSidebar, openCommandPalette }) => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch (e) {}
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/list?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric' 
  });

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/20 dark:border-slate-700/30 px-4 sm:px-8 h-20 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4 lg:gap-8">
        <button 
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
          onClick={toggleMobileSidebar}
        >
          <Menu size={24} />
        </button>

        {/* Breadcrumbs / Date */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-slate-500">
          <span>{currentDate}</span>
          <ChevronRight size={14} className="text-slate-400" />
          <span className="text-primary font-semibold">Workspace</span>
        </div>

        {/* Search Bar */}
        <div 
          onClick={openCommandPalette}
          className="hidden sm:flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl px-4 py-2.5 w-64 md:w-80 border border-slate-200/50 dark:border-slate-700/50 transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:bg-white dark:focus-within:bg-slate-800 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
        >
          <Search size={18} className="text-slate-400" />
          <div className="ml-3 w-full text-sm text-slate-400 font-medium">Search everything... (Ctrl+K)</div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-glow transition-all hover:scale-105 active:scale-95 text-sm font-medium">
          <Sparkles size={16} />
          AI Assistant
        </button>

        <button className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Plus size={20} />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

        <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  className="absolute right-0 mt-3 w-80 glass-card p-0 overflow-hidden z-20 shadow-2xl border border-white/20 dark:border-slate-700/50 rounded-2xl"
                >
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                    <button onClick={async () => { await markAllNotificationsAsRead(); fetchNotifications(); }} className="text-xs text-primary hover:text-primary-dark font-medium">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n._id} className={`p-3 mb-1 rounded-xl cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                        <Bell size={24} className="opacity-20" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Menu */}
        <div className="relative">
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)} 
            className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-slate-200 dark:border-slate-700 cursor-pointer group"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{user?.name}</p>
              <p className="text-xs text-slate-500">Premium Plan</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-800 group-hover:shadow-glow transition-all">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  className="absolute right-0 mt-3 w-56 glass-card p-2 z-20 shadow-2xl border border-white/20 dark:border-slate-700/50 rounded-2xl"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 mb-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                    <User size={16} /> My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                    <Settings size={16} /> Settings
                  </Link>
                  <div className="h-px bg-slate-100 dark:bg-slate-700/50 my-2"></div>
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-xl transition-colors font-medium">
                    <LogOut size={16} /> Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
