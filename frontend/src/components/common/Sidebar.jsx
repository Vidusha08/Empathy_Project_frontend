//src/components/common/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  History,
  Settings,
  Heart,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  LayoutDashboardIcon,
} from "lucide-react";
import { useState } from "react";
import { useSettingsStore } from "../../store/settingsStore";
import { getThemeConfig } from "../../theme/themeConfig";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboardIcon, path: "/dashboard" },
  { label: "Empathy Chat", icon: Sparkles, path: "/chat" },
  { label: "Content", icon: BookOpen, path: "/content" },
  { label: "Progress", icon: BarChart2, path: "/progress" },
  { label: "Chat History", icon: History, path: "/history" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useSettingsStore((state) => state.theme);
  const themeConfig = getThemeConfig(theme);

  const links = navItems.map(({ label, icon: Icon, path }) => (
    <NavLink
      key={path}
      to={path}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) =>
        `app-sidebar__link flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive
            ? "app-sidebar__link--active is-active font-semibold shadow-xs"
            : ""
        }`
      }
    >
      <Icon size={20} className="app-sidebar__icon flex-shrink-0" />
      {!collapsed && <span className="app-sidebar__label text-sm font-medium">{label}</span>}
    </NavLink>
  ));

  return (
    <>
      <button
        type="button"
        className="sidebar-mobile-trigger"
        aria-label="Open navigation"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <LayoutDashboardIcon size={19} />
      </button>
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`app-sidebar relative flex flex-col h-screen text-white transition-all duration-300 ${
          collapsed ? "w-16" : "w-56"
        } ${mobileOpen ? "is-mobile-open" : ""}`}
        style={{ minWidth: collapsed ? "4rem" : "14rem" }}
      >
        {/* Logo Empathy Guru */}
        <div className="app-sidebar__logo-container flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="app-sidebar__logo-badge flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg">
            <Heart size={18} className="text-white" fill="white" />
          </div>
          {!collapsed && (
            <span className="app-sidebar__brand text-lg font-bold tracking-wide text-white">
              EmpathyGuru
            </span>
          )}
        </div>

        {/* Nav Links*/}
        <nav className="app-sidebar__nav px-2 py-4 space-y-1">
          {links}
        </nav>

        {/* Spacer pushes the collapse button down without growing the nav itself */}
        <div className="flex-1" />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="app-sidebar__collapse-btn absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white shadow-md z-10 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
    </>
  );
}
