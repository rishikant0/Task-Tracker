import { create } from 'zustand';

const useConfirmStore = create((set) => ({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null,
  
  openConfirm: (title, message, onConfirm) => set({
    isOpen: true,
    title,
    message,
    onConfirm
  }),
  
  closeConfirm: () => set({ isOpen: false })
}));

export default useConfirmStore;
