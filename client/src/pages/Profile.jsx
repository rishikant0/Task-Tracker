import React, { useState } from 'react';
import { User, Mail, Calendar, Loader2, Check } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { updateProfile } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await updateProfile({ name: name.trim() });
      updateUser({ name: res.data.name });
      toast.success('Profile updated');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setError('');
    setEditMode(false);
  };

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage your account information</p>
      </div>

      {/* Avatar card */}
      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-glow">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-bold text-text-primary">{user?.name}</h2>
          <p className="text-sm text-text-secondary">{user?.email}</p>
        </div>
      </div>

      {/* Info card */}
      <div className="card p-6 space-y-5">
        <h3 className="section-title">Account Information</h3>

        {/* Name field */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
            <User size={13} /> Full Name
          </label>
          {editMode ? (
            <div>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                className={`field w-full max-w-sm ${error ? 'border-red-500' : ''}`}
                autoFocus
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary px-4 py-1.5 text-sm"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Save</>}
                </button>
                <button onClick={handleCancel} className="btn-secondary px-4 py-1.5 text-sm" disabled={loading}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-primary">{user?.name}</p>
              <button
                id="edit-name-btn"
                onClick={() => setEditMode(true)}
                className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-border-default" />

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
            <Mail size={13} /> Email Address
          </label>
          <p className="text-sm text-text-primary">{user?.email}</p>
          <p className="text-xs text-text-secondary mt-0.5">Email cannot be changed</p>
        </div>

        <div className="border-t border-border-default" />

        {/* Member since */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
            <Calendar size={13} /> Member Since
          </label>
          <p className="text-sm text-text-primary">
            {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
