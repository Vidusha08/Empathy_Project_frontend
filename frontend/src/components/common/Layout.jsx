// src/components/common/Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useSettingsStore } from "../../store/settingsStore";
import beachBackground from "../../assets/images/beach_bg.jpg";
import forestBackground from "../../assets/images/forest_bg.jpg";
import "./appTheme.css";

export default function Layout() {
  const colorMode = useSettingsStore((state) => state.colorMode);
  const backgroundScene = useSettingsStore((state) => state.backgroundScene);
  const theme = useSettingsStore((state) => state.theme);
  const backgroundColor = useSettingsStore((state) => state.backgroundColor);
  const accent = {
    ocean: "#4f46e5",
    forest: "#16836a",
    sunset: "#ea580c",
    lavender: "#9333ea",
  }[theme] ?? "#4f46e5";
  const sceneImage = {
    beach: beachBackground,
    forest: forestBackground,
  }[backgroundScene];

  return (
    <div
      className="app-shell flex h-screen w-screen overflow-hidden"
      data-color-mode={colorMode}
      data-background={backgroundScene}
      style={{ "--app-accent": accent }}
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main
          className="app-main min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            backgroundColor: colorMode === "dark" ? "#111827" : backgroundColor,
            backgroundImage: sceneImage ? `url("${sceneImage}")` : "none",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
/*import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}*/
