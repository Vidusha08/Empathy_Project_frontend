// src/store/settingsStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_CONFIGS, DEFAULT_THEME_ID, getThemeConfig } from "../theme/themeConfig";

// Export themeOptions for backward compatibility with existing components
export const themeOptions = THEME_CONFIGS.map((t) => ({
  id: t.themeId,
  label: t.themeName,
  accent: t.accentColor,
  sidebar: t.sidebarBg,
  soundLabel: t.soundLabel,
  backgroundImage: t.backgroundImage,
  ambientSound: t.ambientSound,
}));

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      colorMode: "light",
      // Selected single theme controls image, accent color, and ambient sound
      theme: DEFAULT_THEME_ID,
      isMuted: true, // Default muted to respect browser autoplay

      setColorMode: (colorMode) => set({ colorMode }),
      setTheme: (themeId) => {
        const config = getThemeConfig(themeId);
        set({ theme: config.themeId });
      },
      setIsMuted: (isMuted) => set({ isMuted }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    {
      name: "app-settings",
      // Migrate old settings if present
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState;
        const currentTheme = persistedState.theme;
        const config = getThemeConfig(currentTheme);
        return {
          ...persistedState,
          theme: config.themeId,
          isMuted: persistedState.isMuted ?? true,
        };
      },
    }
  )
);
