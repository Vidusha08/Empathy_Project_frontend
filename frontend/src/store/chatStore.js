// src/store/chatStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
 
const defaultGreeting = (name) =>
  `Hi ${name} 👋 I'm your Empathy Guide. How are you feeling today?`;

const getInitialMessages = (name = "there") => [
  {
    id: 1,
    role: "assistant",
    content: defaultGreeting(name),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    emotion: "calm",
  },
];
 
const useChatStore = create(
  persist(
    (set) => ({
      messages: getInitialMessages(),
      studentId: null,
      isLoading: false,
      setStudentId: (studentId) =>
        set((state) => {
          if (state.studentId && studentId && state.studentId !== studentId) {
            return { studentId, messages: getInitialMessages() };
          }
          return { studentId };
        }),
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      markMessageHandled: (messageId) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === messageId ? { ...message, flowHandled: true } : message
          ),
        })),
      setLoading: (val) => set({ isLoading: val }),
      clearMessages: () => set({ messages: getInitialMessages(), studentId: null }),
 
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
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        messages: state.messages,
        studentId: state.studentId,
      }),
    }
  )
);
 
export default useChatStore;
export { useChatStore };
