import { create } from "zustand";
 
const useChatStore = create((set) => ({
  messages: [],
  isLoading: false,
 
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
 
  setLoading: (val) => set({ isLoading: val }),
 
  clearMessages: () => set({ messages: [] }),
}));
 
export default useChatStore;