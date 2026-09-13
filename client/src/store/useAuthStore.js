import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    set({ user: userData, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const merged = { ...JSON.parse(localStorage.getItem('user') || '{}'), ...userData };
    localStorage.setItem('user', JSON.stringify(merged));
    set((state) => ({ user: { ...state.user, ...userData } }));
  },
}));

export default useAuthStore;
