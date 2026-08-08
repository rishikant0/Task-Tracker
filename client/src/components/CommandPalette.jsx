import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Home, LayoutList, Kanban, Calendar, Settings, User, LogOut, CheckCircle2, MessageSquare, Briefcase, Users, BarChart2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useModalStore from '../store/useModalStore';

const CommandPalette = ({ isOpen, setIsOpen }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { openModal } = useModalStore();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setIsOpen]);

  const commands = [
    { id: 'home', label: 'Go to Dashboard', icon: Home, action: () => navigate('/') },
    { id: 'projects', label: 'View Projects', icon: Briefcase, action: () => navigate('/projects') },
    { id: 'list', label: 'View Task List', icon: LayoutList, action: () => navigate('/list') },
    { id: 'kanban', label: 'Open Kanban Board', icon: Kanban, action: () => navigate('/board') },
    { id: 'calendar', label: 'Open Calendar', icon: Calendar, action: () => navigate('/calendar') },
    { id: 'team', label: 'Team Directory', icon: Users, action: () => navigate('/team') },
    { id: 'analytics', label: 'View Analytics', icon: BarChart2, action: () => navigate('/analytics') },
    { id: 'messages', label: 'Open Messages', icon: MessageSquare, action: () => navigate('/messages') },
    { id: 'new-task', label: 'Create New Task', icon: CheckCircle2, action: () => openModal() },
    { id: 'profile', label: 'View Profile', icon: User, action: () => navigate('/profile') },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => navigate('/settings') },
    { id: 'logout', label: 'Log Out', icon: LogOut, action: () => logout() },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (action) => {
    action();
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <Search className="text-slate-400 mr-3" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-500"
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold tracking-wider">
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">ESC</kbd> to close
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd.action)}
                      className="w-full flex items-center px-3 py-2.5 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 text-slate-700 dark:text-slate-300 rounded-xl transition-colors text-left group"
                    >
                      <Icon size={18} className="mr-3 opacity-70 group-hover:opacity-100" />
                      <span className="font-medium text-sm">{cmd.label}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
