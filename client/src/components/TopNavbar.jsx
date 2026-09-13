import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const TopNavbar = ({ onMenuClick, searchQuery, setSearchQuery }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="h-16 bg-bg-sidebar border-b border-border-default flex items-center gap-4 px-4 sm:px-6 flex-shrink-0">
      {/* Hamburger (mobile only) */}
      <button
        id="mobile-menu-btn"
        onClick={onMenuClick}
        className="btn-icon lg:hidden flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        <input
          id="task-search"
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-bg-card border border-border-default rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* User profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="user-profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 hover:bg-bg-card rounded-lg px-2 py-1.5 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-text-primary max-w-[120px] truncate">
              {user?.name || 'User'}
            </span>
            <ChevronDown size={14} className="text-text-secondary hidden sm:block" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 card shadow-modal py-1 z-50">
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors"
              >
                <User size={15} /> Profile
              </button>
              <button
                onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card-hover transition-colors"
              >
                <Settings size={15} /> Settings
              </button>
              <div className="border-t border-border-default my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
