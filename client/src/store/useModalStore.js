import { create } from 'zustand';

const useModalStore = create((set) => ({
  isOpen: false,
  task: null, // null for create, object for edit
  openModal: (task = null) => set({ isOpen: true, task }),
  closeModal: () => set({ isOpen: false, task: null }),
}));

export default useModalStore;
