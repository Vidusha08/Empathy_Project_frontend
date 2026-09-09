// src/store/chatStore.js
import { create } from "zustand";
 
const defaultGreeting = (name) =>
  `Hi ${name} 👋 I'm your Empathy Guide. How are you feeling today?`;
 
const useChatStore = create((set) => ({
  messages: [
    {
      id: 1,
      role: "assistant",
      content: defaultGreeting("there"),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      emotion: "calm",
    },
  ],
  isLoading: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setLoading: (val) => set({ isLoading: val }),
  clearMessages: () => set({ messages: [] }),
 
  // Swaps the placeholder greeting for a personalized one once the logged-in
  // user's name is available. Only touches message id 1 (the seeded greeting),
  // so it won't overwrite anything once a real conversation is underway.
  setGreetingName: (name) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === 1 && m.role === "assistant"
          ? { ...m, content: defaultGreeting(name) }
          : m
      ),
    })),
}));
 
export default useChatStore;
export { useChatStore };
