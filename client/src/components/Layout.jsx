import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiGrid, FiList, FiCalendar, FiSettings, FiMenu, FiX, FiBell, FiSearch, FiMoon, FiSun, FiLogOut, FiUser, FiMaximize, FiMinimize } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import TaskModal from './TaskModal';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import ConfirmationModal from './ConfirmationModal';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <FiHome /> },
    { name: 'Board', path: '/board', icon: <FiGrid /> },
    { name: 'List View', path: '/list', icon: <FiList /> },
    { name: 'Calendar', path: '/calendar', icon: <FiCalendar /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-64 glass-card border-l-0 rounded-none rounded-r-2xl lg:rounded-none flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <FiHome className="text-white text-xl" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">TaskMaster</span>
          </Link>
          <button className="lg:hidden text-slate-500" onClick={() => setIsOpen(false)}>
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-700/50">
          <button 
            onClick={logout}
            className="sidebar-link w-full text-left text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <FiLogOut className="text-xl" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const Topbar = ({ toggleSidebar }) => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (e) {}
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch (e) {}
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/list?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-10 glass-panel border-b border-slate-200 dark:border-slate-700/50 px-4 sm:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-slate-600 dark:text-slate-300" onClick={toggleSidebar}>
          <FiMenu className="text-2xl" />
        </button>
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-full px-4 py-2 w-64 md:w-80 border border-slate-200 dark:border-slate-700 transition-all focus-within:ring-2 focus-within:ring-indigo-500/50">
          <FiSearch className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tasks... (Press Enter)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent border-none outline-none ml-2 w-full text-sm text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleFullscreen} className="hidden sm:block p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {isFullscreen ? <FiMinimize className="text-xl" /> : <FiMaximize className="text-xl" />}
        </button>
        <button onClick={toggleDarkMode} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {isDarkMode ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
        </button>
        
        {/* Notifications Dropdown */}
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
            <FiBell className="text-xl" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-80 glass-card p-0 overflow-hidden z-20 shadow-2xl">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                    <button onClick={async () => { await markAllNotificationsAsRead(); fetchNotifications(); }} className="text-xs text-indigo-600 hover:text-indigo-500">Mark all read</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n._id} onClick={() => handleMarkRead(n._id)} className={`p-4 border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                        <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-slate-500"><FiBell className="mx-auto text-2xl mb-2 opacity-20" />No notifications yet</div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <div onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 cursor-pointer">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-shadow">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-48 glass-card p-1 z-20 shadow-2xl">
                  <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><FiUser /> My Profile</Link>
                  <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><FiSettings /> Settings</Link>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                  <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><FiLogOut /> Logout</button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const Layout = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const initTheme = useThemeStore(state => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar toggleSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative z-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <TaskModal />
      <ConfirmationModal />
    </div>
  );
};

export default Layout;
