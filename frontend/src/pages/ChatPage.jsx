//src/pages/ChatPage.jsx
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatWindow from "../components/chat/ChatWindow";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import { sendMessage } from "../api/chatApi";
import {
  BookOpen, Volume2, VolumeX, User, ChevronDown,
  LogOut, ArrowRight, Mic, Send,
} from "lucide-react";

// Mock skills content (replace with real data from API later)
const SKILLS = [
  { id: 1, title: "Active Listening", summary: "Learn to fully focus on what others are saying." },
  { id: 2, title: "Emotional Awareness", summary: "Recognize and name your own emotions." },
  { id: 3, title: "Empathy Building", summary: "Understand feelings from another's perspective." },
  { id: 4, title: "Conflict Resolution", summary: "Navigate disagreements constructively." },
  { id: 5, title: "Self-Regulation", summary: "Manage reactions in stressful moments." },
  { id: 6, title: "Assertive Communication", summary: "Express needs clearly and respectfully." },
  { id: 7, title: "Perspective Taking", summary: "See situations through another's eyes." },
  { id: 8, title: "Stress Management", summary: "Techniques to stay calm under pressure." },
];

// Hook: close a popover when clicking outside it
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

// Chat Input

function ChatInputArea({ onSend, isLoading }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  const submit = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="px-5 pb-4 pt-1">
      <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2.5 shadow-sm focus-within:border-indigo-300 transition-colors">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          placeholder="Type a message…"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent leading-relaxed max-h-28 overflow-y-auto"
          style={{ minHeight: 24 }}
        />
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <Mic size={16} />
          </button>
          <button
            onClick={submit}
            disabled={!text.trim() || isLoading}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
              ${text.trim() && !isLoading
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Content popover — lists the 8 skills with a "Read more" link

function ContentMenu({ onNavigateToContent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all
          ${open ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100"}`}
      >
        <BookOpen size={16} />
        <span className="hidden sm:inline">Content</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-20">
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
            onClick={() => { setOpen(false); onNavigateToContent(); }}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100"
          >
            Read more <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// Sound toggle (mute / unmute — background music hook-up comes later)

function SoundToggle() {
  const [muted, setMuted] = useState(true);

  return (
    <button
      onClick={() => setMuted((m) => !m)}
      title={muted ? "Unmute background music" : "Mute background music"}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
    >
      {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      <span className="hidden sm:inline">{muted ? "Muted" : "Sound"}</span>
    </button>
  );
}

// Profile dropdown — name + logout

function ProfileMenu({ username }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    setOpen(false);
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl transition-all
          ${open ? "bg-indigo-50" : "hover:bg-gray-100"}`}
      >
        <div className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
          <User size={13} className="text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
          {username}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

// Main Page

export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
  const { messages, addMessage, isLoading, setLoading } = useChatStore();
  const navigate = useNavigate();

  const ts = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSend = useCallback(async (text) => {
    addMessage({
      id:        Date.now(),
      role:      "user",
      content:   text,
      timestamp: ts(),
      emotion:   "neutral",
    });

    setLoading(true);

    try {
      const res = await sendMessage(text);

      addMessage({
        id:        Date.now() + 1,
        role:      "assistant",
        content:   res.message,
        timestamp: ts(),
        emotion:   res.emotion ?? "calm",
        skill:     res.skill,
      });
    } catch (err) {
      const isUnauth = err?.response?.status === 401;
      addMessage({
        id:        Date.now() + 1,
        role:      "assistant",
        content:   isUnauth
          ? "Your session has expired. Please log in again."
          : "I'm here to listen. It seems there was a connection issue. Please try again.",
        timestamp: ts(),
        emotion:   "calm",
      });
    } finally {
      setLoading(false);
    }
  }, [addMessage, setLoading]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Welcome,</p>
          <p className="font-bold text-gray-800 text-lg leading-tight">
            {user?.username ?? "—"}
          </p>
        </div>

        {/* Action bar: Content · Sound · Profile */}
        <div className="flex items-center gap-1">
          <ContentMenu onNavigateToContent={() => navigate("/content")} />
          <SoundToggle />
          <ProfileMenu username={user?.username ?? "Guest"} />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💬</span>
            <h1 className="text-xl font-bold text-gray-800">Empathy Guide Chatbot</h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 mx-5 mb-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <ChatWindow messages={messages} isLoading={isLoading} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          <ChatInputArea onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
/*import { useState, useCallback, useRef } from "react";
import ChatWindow from "../components/chat/ChatWindow";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import { sendMessage } from "../api/chatApi";
import {
  Brain, TrendingUp, ShieldCheck, Smile,
  Mic, Send,
} from "lucide-react";
 
// Styles
 
const emotionLevelStyle = {
  Low:      "text-green-700 bg-green-50 border border-green-200",
  Moderate: "text-amber-700 bg-amber-50 border border-amber-200",
  High:     "text-red-700 bg-red-50 border border-red-200",
};
 
const riskLevelStyle = {
  low:      "text-green-700",
  medium:   "text-amber-700",
  moderate: "text-amber-700",
  high:     "text-red-700",
  LOW:      "text-green-700",
  MEDIUM:   "text-amber-700",
  HIGH:     "text-red-700",
};
 
// Chat Input
 
function ChatInputArea({ onSend, isLoading }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
 
  const submit = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  };
 
  return (
    <div className="px-5 pb-4 pt-1">
      <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2.5 shadow-sm focus-within:border-indigo-300 transition-colors">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          placeholder="Type a message…"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent leading-relaxed max-h-28 overflow-y-auto"
          style={{ minHeight: 24 }}
        />
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <Mic size={16} />
          </button>
          <button
            onClick={submit}
            disabled={!text.trim() || isLoading}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
              ${text.trim() && !isLoading
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
 
// Main Page
 
export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
  const { messages, addMessage, isLoading, setLoading } = useChatStore();
 
  const [liveStats, setLiveStats] = useState({
    emotionalLevel: "Moderate",
    riskLevel:      "low",
    currentEmotion: "Calm",
    skillsProgress: user?.skillsProgress || "2/8",
  });
 
  const ts = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
 
  const handleSend = useCallback(async (text) => {
    addMessage({
      id:        Date.now(),
      role:      "user",
      content:   text,
      timestamp: ts(),
      emotion:   "neutral",
    });
 
    setLoading(true);
 
    try {
      const res = await sendMessage(text);
 
      addMessage({
        id:        Date.now() + 1,
        role:      "assistant",
        content:   res.message,
        timestamp: ts(),
        emotion:   res.emotion ?? "calm",
        skill:     res.skill,
      });
 
      setLiveStats((prev) => ({
        ...prev,
        currentEmotion: res.emotion
          ? res.emotion.charAt(0).toUpperCase() + res.emotion.slice(1)
          : prev.currentEmotion,
        riskLevel: res.risk_level ?? prev.riskLevel,
      }));
 
    } catch (err) {
      const isUnauth = err?.response?.status === 401;
      addMessage({
        id:        Date.now() + 1,
        role:      "assistant",
        content:   isUnauth
          ? "Your session has expired. Please log in again."
          : "I'm here to listen. It seems there was a connection issue. Please try again.",
        timestamp: ts(),
        emotion:   "calm",
      });
    } finally {
      setLoading(false);
    }
  }, [addMessage, setLoading]);
 
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
 
      {/* Header *}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Welcome,</p>
            <p className="font-bold text-gray-800 text-lg leading-tight">
              {user?.username ?? "—"}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <StatCard
              icon={<Brain size={14} className="text-amber-500" />}
              label="Emotional Level"
              value={liveStats.emotionalLevel}
              valueClass={emotionLevelStyle[liveStats.emotionalLevel] ?? "text-amber-700 bg-amber-50 border border-amber-200"}
            />
            <StatCard
              icon={<TrendingUp size={14} className="text-blue-500" />}
              label="Skills Progress"
              value={liveStats.skillsProgress}
              valueClass="text-blue-700 bg-blue-50 border border-blue-200"
            />
            <StatCard
              icon={<ShieldCheck size={14} className="text-green-500" />}
              label="Risk Level"
              value={liveStats.riskLevel.toUpperCase()}
              valueClass={riskLevelStyle[liveStats.riskLevel] ?? "text-green-700"}
              plain
            />
            <StatCard
              icon={<Smile size={14} className="text-indigo-500" />}
              label="Current Emotion"
              value={liveStats.currentEmotion}
              valueClass="text-indigo-700 bg-indigo-50 border border-indigo-200"
            />
          </div>
        </div>
      </div>
 
      {/* Chat area *}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💬</span>
            <h1 className="text-xl font-bold text-gray-800">Empathy Guide Chatbot</h1>
          </div>
          {/*<p className="text-sm text-gray-500">
            Emotion aware support guided by SEEK principles:{" "}
            <span className="font-medium text-indigo-600">
              Self-awareness, Empathy, Ethics, and Kindness.
            </span>
          </p>*}
        </div>
 
        {/* Messages *}
        <div className="flex-1 mx-5 mb-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <ChatWindow messages={messages} isLoading={isLoading} />
        </div>
 
        {/* Input *}
        <div className="flex-shrink-0">
          <ChatInputArea onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
 
// Stat Card
 
function StatCard({ icon, label, value, valueClass, plain }) {
  return (
    <div className="border border-gray-100 rounded-xl px-4 py-2.5 bg-white shadow-sm min-w-[112px]">
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-sm font-bold ${plain ? valueClass : `px-2 py-0.5 rounded-lg inline-block ${valueClass}`}`}>
        {value}
      </p>
    </div>
  );
}
*/