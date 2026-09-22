// src/components/common/Topbar.jsx
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  BookOpen, Volume2, VolumeX, User, LogOut, ArrowRight,
} from "lucide-react";

// Mock skills content (replace with real data from API later)
const SKILLS = [
  { id: 1, title: "Calming the Body and Mind", summary: "Simple breathing and grounding practices that settle the nervous system before working with harder emotions." },
  { id: 2, title: "Ethical Mindfulness", summary: "Noticing your own values and intentions in the moment, so your actions stay aligned with what matters to you." },
  { id: 3, title: "Emotional Awareness", summary: "Naming what you feel as it happens, and recognizing the same feelings as they show up in other people." },
  { id: 4, title: "Self-Compassion", summary: "Treating your own mistakes and struggles with the same kindness you would offer a good friend." },
  { id: 5, title: "Impartiality and Common Humanity", summary: "Extending care evenly, and remembering that everyone shares the same basic wish to be happy and free from suffering." },
  { id: 6, title: "Forgiveness and Gratitude", summary: "Letting go of resentment at your own pace, and noticing what is already good, safe, or supportive around you." },
  { id: 7, title: "Empathic Concern", summary: "Tuning in to someone else's distress and genuinely caring about their wellbeing, without taking it on as your own." },
  { id: 8, title: "Compassion", summary: "Turn empathy into a wish and willingness to help." },
];

// Backend returns the student's full name at user.name (e.g. "Jane Doe").
// This pulls just the first token for a friendlier greeting, falling back
// to username, then a generic label, if name isn't available.
function getFirstName(user) {
  if (user?.name) {
    const first = user.name.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return user?.username ?? null;
}

// Hook: close a popover when clicking outside any of the given refs
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

// Content popover — icon-only trigger, lists the 8 skills with a "Read more" link

function ContentMenu() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  useOnClickOutside([buttonRef, menuRef], () => setOpen(false));

  useLayoutEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.right - 288 }); // 288px = w-72
    }
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        title="Content"
        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all
          ${open ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"}`}
      >
        <BookOpen size={18} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
          className="w-72 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-[100]"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">Skills Content</p>
            <p className="text-xs text-gray-400">8 skills available</p>
          </div>
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {SKILLS.map((skill) => (
              <li key={skill.id} className="px-4 py-2.5 hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-800">{skill.title}</p>
                <p className="text-xs text-gray-400 truncate">{skill.summary}</p>
              </li>
            ))}
          </ul>
          <button
            onClick={() => { setOpen(false); navigate("/content"); }}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100"
          >
            Read more <ArrowRight size={14} />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

// Sound toggle — icon-only (mute / unmute — background music hook-up comes later)

function SoundToggle() {
  const [muted, setMuted] = useState(true);

  return (
    <button
      onClick={() => setMuted((m) => !m)}
      title={muted ? "Unmute background music" : "Mute background music"}
      className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}

// Profile — icon-only avatar trigger, dropdown shows name + logout

function ProfileMenu({ displayName }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  useOnClickOutside([buttonRef, menuRef], () => setOpen(false));
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  useLayoutEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.right - 176 }); // 176px = w-44
    }
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    clearAuth();
    navigate("/login");
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        title={displayName}
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-all
          ${open ? "ring-2 ring-indigo-200" : ""}`}
      >
        <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
          <User size={15} className="text-white" />
        </div>
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left }}
          className="w-44 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-[100]"
        >
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-sm font-medium text-gray-700 truncate">{displayName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

// Main Topbar — common header shown on every page inside Layout

export default function Topbar() {
  const user = useAuthStore((state) => state.user);
  const firstName = getFirstName(user);

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-0.5">Welcome,</p>
        <p className="font-bold text-gray-800 text-lg leading-tight">
          {firstName ?? "—"}
        </p>
      </div>

      {/* Action bar: Content · Sound · Profile — icons only */}
      <div className="flex items-center gap-1">
        <ContentMenu />
        <SoundToggle />
        <ProfileMenu displayName={firstName ?? "Guest"} />
      </div>
    </div>
  );
}