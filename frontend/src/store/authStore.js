// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      setAuth: (token, user, role) => {
        localStorage.setItem("token", token);
        set({ token, user, role });
      },

      clearAuth: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        set({ token: null, user: null, role: null });
      },

      updateUser: (updatedUser) =>
        set((state) => ({ user: { ...state.user, ...updatedUser } })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user:  state.user,
        role:  state.role,
      }),
    }
  )
);
export default useAuthStore;
/*import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: { id: 1, name: "Student", email: "student@example.com" }, // Mock user
  isAuthenticated: true,

  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));*/