//src/pages/ChatPage.jsx
import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatWindow from "../components/chat/ChatWindow";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import { sendMessage } from "../api/chatApi";
import { completeObjective } from "../api/progressApi";
import {
  BookOpen, Volume2, VolumeX, User, ChevronDown,
  LogOut, ArrowRight, Mic, Send,
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
 
function ProfileMenu({ displayName }) {
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
          {displayName}
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
  const { messages, addMessage, isLoading, setLoading, setGreetingName } = useChatStore();
  const navigate = useNavigate();
 
  const firstName = getFirstName(user);
 
  // Personalize the seeded greeting once the user's name is known
  // (it's created generically at store-init time, before login happens).
  useEffect(() => {
    if (firstName) setGreetingName(firstName);
  }, [firstName, setGreetingName]);
 
  const ts = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
 
  const handleSend = useCallback(async (text) => {
    addMessage({
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: ts(),
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
        status:    res.status,
        skill:     res.skill,
        topic:     res.topic,
        learningObjective: res.learningObjective,
        recommendedActivity: res.recommendedActivity,
        sourcePage: res.sourcePage,
        interactionId: res.interactionId,
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
 
  const handleCompleteObjective = async (objectiveId, skillId) => {
    try {
      await completeObjective(objectiveId, skillId);
      addMessage({
        id: Date.now(),
        role: "assistant",
        content: "Objective marked as completed.",
        timestamp: ts(),
      });
    } catch {
      addMessage({
        id: Date.now(),
        role: "assistant",
        content: "I couldn't mark that objective as completed. Please try again.",
        timestamp: ts(),
      });
    }
  };
 
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
 
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Welcome,</p>
          <p className="font-bold text-gray-800 text-lg leading-tight">
            {firstName ?? "—"}
          </p>
        </div>
 
        {/* Action bar: Content · Sound · Profile */}
        <div className="flex items-center gap-1">
          <ContentMenu onNavigateToContent={() => navigate("/content")} />
          <SoundToggle />
          <ProfileMenu displayName={firstName ?? "Guest"} />
        </div>
      </div>
 
      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💬</span>
            <h1 className="text-xl font-bold text-gray-800">Chat With Your Empathy Buddy</h1>
          </div>
        </div>
 
        {/* Messages */}
        <div className="flex-1 mx-5 mb-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onCompleteObjective={handleCompleteObjective}
          />
        </div>
 
        {/* Input */}
        <div className="flex-shrink-0">
          <ChatInputArea onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}