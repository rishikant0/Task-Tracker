import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Kanban,
  Calendar,
  BarChart2,
  Settings,
  User,
  LogOut,
  Zap,
  X,
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const NAV_MAIN = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/board', label: 'Board', icon: Kanban },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
];

const NAV_GENERAL = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User },
];

const NavItem = ({ to, label, icon: Icon, end, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `nav-link ${isActive ? 'active' : ''}`
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

const LeftSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const close = () => setIsMobileOpen(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-bg-sidebar border-r border-border-default flex-shrink-0">
        <SidebarContent onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-bg-sidebar border-r border-border-default transform transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onLogout={handleLogout} onNavClick={close} showClose onClose={close} />
      </aside>
    </>
  );
};

const SidebarContent = ({ onLogout, onNavClick, showClose, onClose }) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="flex items-center gap-3 px-4 py-5 border-b border-border-default">
      <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
        <Zap size={18} className="text-white" />
      </div>
      <span className="text-lg font-bold text-text-primary tracking-tight">TaskFlow</span>
      {showClose && (
        <button onClick={onClose} className="ml-auto btn-icon">
          <X size={18} />
        </button>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {/* MAIN */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary px-3 mb-2">
        Main
      </p>
      {NAV_MAIN.map((item) => (
        <NavItem key={item.to} {...item} onClick={onNavClick} />
      ))}

      <div className="my-4 border-t border-border-default" />

      {/* GENERAL */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary px-3 mb-2">
        General
      </p>
      {NAV_GENERAL.map((item) => (
        <NavItem key={item.to} {...item} onClick={onNavClick} />
      ))}
    </nav>

    {/* Logout */}
    <div className="px-3 py-4 border-t border-border-default">
      <button
        onClick={onLogout}
        className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  </div>
);

export default LeftSidebar;
