// src/store/chatStore.js
import { create } from "zustand";

const useChatStore = create((set) => ({
  messages: [
    {
      id: 1,
      role: "assistant",
      content: "Hi Student 👋 I'm your Empathy Guide. How are you feeling today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      emotion: "calm",
    },
  ],
  isLoading: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (val) => set({ isLoading: val }),
  clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;
export { useChatStore };

/*import { create } from "zustand";
 
const useChatStore = create((set) => ({
  messages: [],
  isLoading: false,
 
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
 
  setLoading: (val) => set({ isLoading: val }),
 
  clearMessages: () => set({ messages: [] }),
}));
 
export default useChatStore;*/