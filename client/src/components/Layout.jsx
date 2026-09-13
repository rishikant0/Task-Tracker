import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import LeftSidebar from './LeftSidebar';
import TopNavbar from './TopNavbar';
import TaskModal from './TaskModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const Layout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          onMenuClick={() => setIsMobileOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ searchQuery }} />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal />
      <DeleteConfirmModal />
    </div>
  );
};

export default Layout;
