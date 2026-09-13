import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Kanban,
  Calendar, BarChart2, Settings, User, LogOut, Zap, X
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const MAIN_NAV = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Board', path: '/board', icon: Kanban },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
];

const GENERAL_NAV = [
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Profile', path: '/profile', icon: User },
];

const NavItem = ({ item, onClick }) => {
  const location = useLocation();
  const isActive =
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path);
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`nav-item ${isActive ? 'active' : ''}`}
    >
      <Icon size={18} />
      <span>{item.name}</span>
    </Link>
  );
};

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const logout = useAuthStore((state) => state.logout);

  const sidebarStyle = {
    width: '240px',
    flexShrink: 0,
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 40,
          }}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex" style={sidebarStyle}>
        <SidebarContent onClose={() => {}} logout={logout} />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className="lg:hidden"
        style={{
          ...sidebarStyle,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
      >
        <SidebarContent onClose={() => setIsMobileOpen(false)} logout={logout} showClose />
      </aside>
    </>
  );
};

const SidebarContent = ({ onClose, logout, showClose }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
    {/* Logo */}
    <div
      style={{
        padding: '1.25rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Link to="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #7C5CFF, #6D4AFF)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Zap size={20} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          TaskFlow
        </span>
      </Link>
      {showClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>
      )}
    </div>

    {/* Navigation */}
    <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>
          Main
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {MAIN_NAV.map((item) => (
            <NavItem key={item.name} item={item} onClick={onClose} />
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>
          General
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {GENERAL_NAV.map((item) => (
            <NavItem key={item.name} item={item} onClick={onClose} />
          ))}
        </div>
      </div>
    </nav>

    {/* Logout */}
    <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
      <button
        onClick={logout}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.625rem 0.75rem',
          background: 'none',
          border: 'none',
          borderRadius: '8px',
          color: '#EF4444',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  </div>
);

export default Sidebar;
