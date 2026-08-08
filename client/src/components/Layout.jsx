import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import TaskModal from './TaskModal';
import ConfirmationModal from './ConfirmationModal';
import CommandPalette from './CommandPalette';

import LeftSidebar from './LeftSidebar';
import TopNavbar from './TopNavbar';
import RightSidebar from './RightSidebar';

const Layout = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const initTheme = useThemeStore(state => state.initTheme);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    initTheme();
    if (isAuthenticated && user) {
      import('../services/socket').then(({ socket }) => {
        socket.connect();
        socket.emit('setup', user);

        socket.on('task_updated', (data) => {
          // optionally dispatch an event for other components
          const event = new CustomEvent('taskSaved', { detail: data });
          window.dispatchEvent(event);
        });

        socket.on('message_received', (data) => {
          // You could show a toast here if not on chat page
        });

        return () => {
          socket.disconnect();
          socket.off('task_updated');
          socket.off('message_received');
        };
      });
    }
  }, [initTheme, isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100 selection:bg-primary/30">
      
      <LeftSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <TopNavbar 
          toggleMobileSidebar={() => setIsMobileSidebarOpen(true)} 
          openCommandPalette={() => setIsCommandOpen(true)}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 relative custom-scrollbar">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/20 to-purple-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 -z-10" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </main>
          
          <RightSidebar />
        </div>
      </div>
      
      <TaskModal />
      <ConfirmationModal />
      <CommandPalette isOpen={isCommandOpen} setIsOpen={setIsCommandOpen} />
    </div>
  );
};

export default Layout;
