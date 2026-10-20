import { create } from "zustand";
import { persist } from "zustand/middleware";

export const themeOptions = [
  { id: "ocean", label: "Ocean", accent: "#4f46e5", sidebar: "#1a237e" },
  { id: "forest", label: "Forest", accent: "#16836a", sidebar: "#14532d" },
  { id: "sunset", label: "Sunset", accent: "#ea580c", sidebar: "#9a3412" },
  { id: "lavender", label: "Lavender", accent: "#9333ea", sidebar: "#581c87" },
];

export const useSettingsStore = create(
  persist(
    (set) => ({
      colorMode: "light",
      backgroundScene: "none",
      theme: "ocean",
      backgroundColor: "#f6f2ec",
      setColorMode: (colorMode) => set({ colorMode }),
      setBackgroundScene: (backgroundScene) => set({ backgroundScene }),
      setTheme: (theme) => set({ theme }),
      setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
    }),
    { name: "app-settings" }
  )
);
