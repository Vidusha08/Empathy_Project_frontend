// src/components/common/Layout.jsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSettingsStore } from "../../store/settingsStore";
import { getThemeConfig } from "../../theme/themeConfig";
import { ambientSoundManager } from "../../theme/ambientSoundManager";
import "./appTheme.css";

export default function Layout() {
  const colorMode = useSettingsStore((state) => state.colorMode);
  const theme = useSettingsStore((state) => state.theme);
  const isMuted = useSettingsStore((state) => state.isMuted);

  const themeConfig = getThemeConfig(theme);
  const isDefault = themeConfig.themeId === "default";
  const accent = themeConfig.accentColor;
  const backgroundImage = themeConfig.backgroundImage;

  // Synchronize theme and color mode at the document root level
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeConfig.themeId);
    document.documentElement.setAttribute("data-color-mode", colorMode);
  }, [themeConfig.themeId, colorMode]);

  // Synchronize ambient sound with the single theme selection and mute state
  useEffect(() => {
    ambientSoundManager.setMuted(isMuted);
    if (!isMuted && themeConfig.ambientSound) {
      ambientSoundManager.play(themeConfig.themeId, themeConfig.ambientSound);
    }
  }, [themeConfig.themeId, themeConfig.ambientSound, isMuted]);

  return (
    <div
      className="app-shell flex h-screen w-screen overflow-hidden"
      data-theme={themeConfig.themeId}
      data-color-mode={colorMode}
      style={{
        backgroundImage: !isDefault && backgroundImage ? `url("${backgroundImage}")` : "none",
        backgroundColor: isDefault ? (colorMode === "dark" ? "#111827" : "#f6f2ec") : "transparent",
      }}
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
        <Topbar />
        <main
          className="app-main min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent"
          data-theme={themeConfig.themeId}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
