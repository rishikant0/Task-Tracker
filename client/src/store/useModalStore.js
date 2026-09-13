import { create } from 'zustand';

// Modal store for create/edit task modal
const useModalStore = create((set) => ({
  isOpen: false,
  taskToEdit: null, // null = create mode, task object = edit mode

  openModal: (task = null) => set({ isOpen: true, taskToEdit: task }),
  closeModal: () => set({ isOpen: false, taskToEdit: null }),
}));

export default useModalStore;
