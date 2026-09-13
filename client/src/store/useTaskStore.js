import { create } from 'zustand';
import * as api from '../services/api';

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  // Fetch all tasks (optional query params: status, priority, search)
  fetchTasks: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const res = await api.getTasks(params);
      set({ tasks: res.data, loading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch tasks';
      console.error('FETCH TASKS ERROR:', err.response?.data || err.message);
      set({ error: message, loading: false });
    }
  },

  // Create a new task — throws on error so callers (TaskModal) can catch and display it
  createTask: async (data) => {
    try {
      const res = await api.createTask(data);
      set((state) => ({ tasks: [res.data, ...state.tasks] }));
      return res.data;
    } catch (err) {
      console.error('CREATE TASK ERROR:', err.response?.data || err.message);
      // Re-throw so the modal can show the real error message
      throw err;
    }
  },

  // Update a task by id — throws on error so callers can catch it
  updateTask: async (id, data) => {
    try {
      const res = await api.updateTask(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? res.data : t)),
      }));
      return res.data;
    } catch (err) {
      console.error('UPDATE TASK ERROR:', err.response?.data || err.message);
      throw err;
    }
  },

  // Delete a task by id — throws on error
  deleteTask: async (id) => {
    try {
      await api.deleteTask(id);
      set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
    } catch (err) {
      console.error('DELETE TASK ERROR:', err.response?.data || err.message);
      throw err;
    }
  },

  // Optimistic status update for drag & drop
  moveTask: async (id, newStatus) => {
    // Optimistically update UI first
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, status: newStatus } : t)),
    }));
    try {
      await api.updateTask(id, { status: newStatus });
    } catch (err) {
      console.error('MOVE TASK ERROR:', err.response?.data || err.message);
      // Revert on error
      get().fetchTasks();
    }
  },
}));

export default useTaskStore;
