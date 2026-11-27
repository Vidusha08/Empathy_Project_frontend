// src/components/common/Topbar.jsx
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useSettingsStore } from "../../store/settingsStore";
import { getThemeConfig } from "../../theme/themeConfig";
import { ambientSoundManager } from "../../theme/ambientSoundManager";
import { getSkills } from "../../api/contentApi";
import EditProfileModal from "./EditProfileModal";
import {
  BookOpen, Volume2, VolumeX, User, LogOut, ArrowRight, Settings,
} from "lucide-react";

function getUsername(user) {
  return user?.username ?? null;
}

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

function ContentMenu() {
  const [open, setOpen] = useState(false);
  const [skills, setSkills] = useState([]);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  useOnClickOutside([buttonRef, menuRef], () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    void getSkills().then(setSkills).catch(() => setSkills([]));
  }, [open]);

  useLayoutEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.right - 288 });
    }
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        title="Content"
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
          open
            ? "bg-[var(--app-accent-subtle)] text-[var(--app-accent)]"
            : "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-soft)]"
        }`}
      >
        <BookOpen size={18} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
          className="app-menu-popover w-72 rounded-2xl shadow-xl overflow-hidden z-[100]"
        >
          <div className="px-4 py-3 border-b border-[var(--app-border)]">
            <p className="text-sm font-semibold">Skills Content</p>
            <p className="text-xs text-[var(--app-text-muted)]">{skills.length} skills available</p>
          </div>
          <ul className="max-h-64 overflow-y-auto divide-y divide-[var(--app-border-subtle)]">
            {skills.map((skill) => (
              <li key={skill.skill_id} className="px-4 py-2.5 transition-colors cursor-pointer">
                <p className="text-sm font-medium">{skill.title}</p>
                <p className="text-xs text-[var(--app-text-muted)] truncate">{skill.description || skill.summary}</p>
              </li>
            ))}
          </ul>
          <button
            onClick={() => { setOpen(false); navigate("/content"); }}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[var(--app-accent)] hover:bg-[var(--app-accent-subtle)] transition-colors border-t border-[var(--app-border)]"
          >
            Read more <ArrowRight size={14} />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

function SoundToggle() {
  const isMuted = useSettingsStore((state) => state.isMuted);
  const toggleMute = useSettingsStore((state) => state.toggleMute);
  const theme = useSettingsStore((state) => state.theme);
  const [soundStatus, setSoundStatus] = useState({
    muted: isMuted,
    isPlaying: false,
    isAutoplayBlocked: false,
  });

  useEffect(() => {
    return ambientSoundManager.subscribe((status) => {
      setSoundStatus(status);
    });
  }, []);

  const handleToggle = () => {
    const config = getThemeConfig(theme);
    toggleMute();
    if (isMuted) {
      // Unmuting: user interaction fulfills browser autoplay requirement
      ambientSoundManager.setMuted(false);
      ambientSoundManager.play(config.themeId, config.ambientSound, true);
    } else {
      ambientSoundManager.setMuted(true);
    }
  };

  const config = getThemeConfig(theme);
  const title = isMuted
    ? `Unmute ambient sound (${config.soundLabel})`
    : `Mute ambient sound (${config.soundLabel})`;

  return (
    <button
      onClick={handleToggle}
      aria-label={title}
      aria-pressed={!isMuted}
      title={title}
      className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
        !isMuted
          ? "bg-[var(--app-accent-subtle)] text-[var(--app-accent)]"
          : "text-[var(--app-text-muted)] hover:bg-[var(--app-surface-soft)]"
      }`}
    >
      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}

function ProfileMenu({ displayName, user }) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  useOnClickOutside([buttonRef, menuRef], () => setOpen(false));
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  useLayoutEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.right - 176 });
    }
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    clearAuth();
    navigate("/");
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        title={displayName}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-all ${
          open ? "ring-2 ring-[var(--app-accent)]" : ""
        }`}
      >
        {user?.profileImage
          ? <img src={user.profileImage} alt="" className="h-8 w-8 rounded-full object-cover" />
          : <div className="w-8 h-8 rounded-full bg-[var(--app-accent)] flex items-center justify-center flex-shrink-0 text-white">
              <User size={15} />
            </div>}
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
          className="app-menu-popover w-44 rounded-2xl shadow-xl overflow-hidden z-[100]"
        >
          <div className="px-4 py-2.5 border-b border-[var(--app-border)]">
            <p className="text-sm font-medium truncate">{displayName}</p>
          </div>
          <button
            onClick={() => { setOpen(false); setEditOpen(true); }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--app-text)] hover:bg-[var(--app-accent-subtle)] transition-colors"
          >
            <Settings size={15} /> Edit profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>,
        document.body
      )}
      {editOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}

export default function Topbar() {
  const user = useAuthStore((state) => state.user);
  const username = getUsername(user);
  const location = useLocation();
  const isDashboardPage = location.pathname === "/dashboard" || location.pathname.startsWith("/dashboard/");

  return (
    <div className="app-topbar px-6 py-4 flex-shrink-0 flex items-center justify-between gap-4">
      {!isDashboardPage && (
        <div>
          <p className="text-xs mb-0.5 text-[var(--app-text-muted)]">Welcome,</p>
          <p className="font-bold text-lg leading-tight text-[var(--app-text)]">
            {username ?? "—"}
          </p>
        </div>
      )}

      {/* Action bar: Content · Sound · Profile */}
      <div className="ml-auto flex items-center gap-1">
        <ContentMenu />
        <SoundToggle />
        <ProfileMenu displayName={username ?? "Guest"} user={user} />
      </div>
    </div>
  );
}
