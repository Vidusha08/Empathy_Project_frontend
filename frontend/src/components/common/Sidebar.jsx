//src/components/common/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  MessageSquare,
  BookOpen,
  History,
  Settings,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserCog,
} from "lucide-react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  { label: "Chat", icon: MessageSquare, path: "/chat" },
  { label: "Content", icon: BookOpen, path: "/content" },
  { label: "Chat History", icon: History, path: "/progress" },
];

// Hook: close a popover when clicking outside it
function useOnClickOutside(refs, handler) {
  useEffect(() => {
    const listener = (e) => {
      const clickedInside = refs.some(
        (ref) => ref.current && ref.current.contains(e.target)
      );
      if (clickedInside) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [refs, handler]);
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const { clearAuth: logout } = useAuthStore();
  const navigate = useNavigate();

  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  useOnClickOutside([buttonRef, menuRef], () => setSettingsOpen(false));

  // Recalculate popover position whenever it opens (escapes overflow-hidden via portal)
  useLayoutEffect(() => {
    if (settingsOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [settingsOpen]);

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#1a237e] text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
      style={{ minWidth: collapsed ? "4rem" : "14rem" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
          <Heart size={18} className="text-white" fill="white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-wide text-white">
            Empathy Buddy
          </span>
        )}
      </div>

      {/* Nav Links*/}
      <nav className="px-2 py-4 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer pushes the Settings section down without growing the nav itself */}
      <div className="flex-1" />

      {/* Bottom: Settings trigger — increased vertical padding for more room */}
      <div className="px-2 pb-16 pt-8 border-t border-white/10">
        <button
          ref={buttonRef}
          onClick={() => setSettingsOpen((o) => !o)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
            settingsOpen
              ? "bg-white/15 text-white font-semibold"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Settings size={15} className="flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left">Settings</span>
              <ChevronDown
                size={16}
                className={`flex-shrink-0 transition-transform duration-200 ${
                  settingsOpen ? "rotate-180" : ""
                }`}
              />
            </>
          )}
        </button>
      </div>

      {/* Settings popover */}
      {settingsOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}
            className="w-52 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-[100]"
          >
            <button
              onClick={() => {
                setSettingsOpen(false);
                navigate("/profile/edit");
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UserCog size={15} /> Edit Profile
            </button>
          </div>,
          document.body
        )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a237e] border border-white/20 flex items-center justify-center text-white/70 hover:text-white shadow-md z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
/*import {useAuthStore} from "../../store/authStore";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  BookOpen,
  BarChart2,
  User,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
//import {useAuthStore} from "../../store/authStore";
 
const navItems = [
  { label: "Chatbot", icon: MessageSquare, path: "/chat" },
  { label: "Content", icon: BookOpen, path: "/content" },
  { label: "Chat History", icon: BarChart2, path: "/progress" },
];
 
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, clearAuth: logout } = useAuthStore();
  const navigate = useNavigate();
 
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
 
  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#1a237e] text-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
      style={{ minWidth: collapsed ? "4rem" : "14rem" }}
    >
      {/* Logo *}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
          <Heart size={18} className="text-white" fill="white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-wide text-white">
            Empathy
          </span>
        )}
      </div>
 
      {/* Nav Links *}
      <nav className="flex-1 px-2 py-6 space-y-1">
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">{label}</span>
            )}
          </NavLink>
        ))}
      </nav>
 
      {/* Bottom: Profile + Logout *}
      <div className="px-2 pb-4 space-y-1 border-t border-white/10 pt-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-white/15 text-white font-semibold"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          {!collapsed && <span className="text-sm font-medium">Profile</span>}
        </NavLink>
 
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
 
      {/* Collapse toggle *}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a237e] border border-white/20 flex items-center justify-center text-white/70 hover:text-white shadow-md z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}*/
//import useAuthStore from "../../store/authStore";