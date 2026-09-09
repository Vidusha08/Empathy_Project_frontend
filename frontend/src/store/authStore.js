// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
 
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({
        user: null,
        token: null,
      }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
 
export default useAuthStore;
