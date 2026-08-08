import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, CheckSquare, Briefcase, Calendar, Users, 
  BarChart2, MessageSquare, Bell, Settings, User, LogOut, 
  ChevronLeft, ChevronRight, Zap, Kanban, File
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const LeftSidebar = ({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);

  const minWidth = 200;
  const maxWidth = 400;

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      } else if (newWidth < minWidth && isOpen) {
        // Optionally close if dragging too small
      }
    }
  }, [isResizing, isOpen]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const mainNav = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <Briefcase size={20} /> },
    { name: 'My Tasks', path: '/list', icon: <CheckSquare size={20} /> },
    { name: 'Board', path: '/board', icon: <Kanban size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Team', path: '/team', icon: <Users size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
  ];

  const secondaryNav = [
    { name: 'Messages', path: '/messages', icon: <MessageSquare size={20} /> },
    { name: 'Files', path: '/files', icon: <File size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
    
    return (
      <Link 
        to={item.path}
        onClick={() => setIsMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group overflow-hidden ${
          isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="activeNavIndicator"
            className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl z-0"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <div className="z-10 flex items-center gap-3 w-full">
          <span className={`${isActive ? 'text-white' : ''}`}>{item.icon}</span>
          {isOpen && <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>}
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: isOpen ? sidebarWidth : 80 }}
        transition={isResizing ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen glass-card border-l-0 rounded-none rounded-r-2xl lg:rounded-none flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300 ease-in-out lg:transition-none lg:translate-x-0 overflow-y-auto overflow-x-hidden`}
        style={{ zIndex: 100 }}
      >
        <div className="p-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-700/50">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="min-w-[40px] h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-glow">
              <Zap className="text-white fill-white" size={24} />
            </div>
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl font-bold text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent whitespace-nowrap"
              >
                TrackerAI
              </motion.span>
            )}
          </Link>
        </div>

        <div className="flex-1 py-6 px-3 flex flex-col gap-8">
          <div>
            {isOpen && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3 overflow-hidden">Main</p>}
            <nav className="flex flex-col gap-1">
              {mainNav.map(item => <NavItem key={item.name} item={item} />)}
            </nav>
          </div>

          <div>
            {isOpen && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3 overflow-hidden">General</p>}
            <nav className="flex flex-col gap-1">
              {secondaryNav.map(item => <NavItem key={item.name} item={item} />)}
            </nav>
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-700/50 sticky bottom-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md z-10">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut size={20} />
            {isOpen && <span className="font-medium overflow-hidden">Logout</span>}
          </button>
        </div>

        {/* Resizer Handle */}
        {isOpen && (
          <div 
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 active:bg-primary z-30 transition-colors"
            onMouseDown={startResizing}
          />
        )}

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center shadow-sm text-slate-500 hover:text-primary z-20 cursor-pointer"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </motion.aside>
    </>
  );
};

export default LeftSidebar;
