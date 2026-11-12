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
import { themeOptions, useSettingsStore } from "../../store/settingsStore";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboardIcon, path: "/dashboard" },
  { label: "Empathy Chat", icon: Sparkles, path: "/general-empathy-chat" },
  { label: "Content", icon: BookOpen, path: "/content" },
  { label: "Progress", icon: BarChart2, path: "/progress" },
  { label: "Chat History", icon: History, path: "/history" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useSettingsStore((state) => state.theme);
  const activeTheme = themeOptions.find((option) => option.id === theme) ?? themeOptions[0];

  const links = navItems.map(({ label, icon: Icon, path }) => (
    <NavLink
      key={path}
      to={path}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          isActive
            ? "bg-white/15 text-white font-semibold"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <Icon size={20} className="flex-shrink-0" />
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
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
      {mobileOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside
        className={`app-sidebar relative flex flex-col h-screen text-white transition-all duration-300 ${
          collapsed ? "w-16" : "w-56"
        } ${mobileOpen ? "is-mobile-open" : ""}`}
      style={{ minWidth: collapsed ? "4rem" : "14rem", backgroundColor: activeTheme.sidebar }}
    >
      {/* Logo Empathy Buddy */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
          <Heart size={18} className="text-white" fill="white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-wide text-white">
            EmpathyGuru 
          </span>
        )}
      </div>

      {/* Nav Links*/}
      <nav className="px-2 py-4 space-y-1">
        {links}
      </nav>

      {/* Spacer pushes the Settings section down without growing the nav itself */}
      <div className="flex-1" />

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{ backgroundColor: activeTheme.sidebar }}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white shadow-md z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
      </aside>
      <nav className="sidebar-mobile-nav" aria-label="Quick navigation">
        {navItems.slice(0, 4).map(({ label, icon: Icon, path }) => (
          <NavLink key={path} to={path} onClick={() => setMobileOpen(false)}>
            <Icon size={18} />
            <span>{label === "Empathy Chat" ? "Empathy" : label}</span>
          </NavLink>
        ))}
        <button type="button" onClick={() => setMobileOpen(true)}>
          <Settings size={18} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
