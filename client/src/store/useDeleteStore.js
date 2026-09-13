import { create } from 'zustand';

// Store for delete confirmation modal
const useDeleteStore = create((set) => ({
  isOpen: false,
  taskId: null,
  taskTitle: '',

  openDelete: (taskId, taskTitle = '') => set({ isOpen: true, taskId, taskTitle }),
  closeDelete: () => set({ isOpen: false, taskId: null, taskTitle: '' }),
}));

export default useDeleteStore;
