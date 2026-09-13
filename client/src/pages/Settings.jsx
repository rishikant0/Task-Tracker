import React from 'react';
import { Moon, LogOut, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage your app preferences</p>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Appearance</h2>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-bg-card-hover rounded-lg flex items-center justify-center">
              <Moon size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Dark Mode</p>
              <p className="text-xs text-text-secondary">TaskFlow uses dark mode by default</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-full">Active</span>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Account</h2>

        <div className="flex items-center justify-between py-3 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-bg-card-hover rounded-lg flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{user?.name}</p>
              <p className="text-xs text-text-secondary">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Edit Profile
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-bg-card-hover rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Account Security</p>
              <p className="text-xs text-text-secondary">Your account is protected with a password</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Session</h2>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-500/10 rounded-lg flex items-center justify-center">
              <LogOut size={18} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Sign Out</p>
              <p className="text-xs text-text-secondary">Sign out of your current session</p>
            </div>
          </div>
          <button
            id="settings-logout-btn"
            onClick={handleLogout}
            className="btn-danger text-sm px-4 py-1.5"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
