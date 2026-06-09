import { useState, useCallback, useRef, useEffect } from "react";
import ChatWindow from "../components/chat/ChatWindow";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import { sendMessage } from "../api/chatApi";
import {
  Brain, TrendingUp, ShieldCheck, Smile,
  Play, BarChart2,
  Mic, X, ChevronLeft,
  CheckCircle2, GraduationCap, Dumbbell,
  HeartHandshake, Send,
} from "lucide-react";
 
// ─── Styles ───────────────────────────────────────────────────────────────────
 
const emotionLevelStyle = {
  Low:      "text-green-700 bg-green-50 border border-green-200",
  Moderate: "text-amber-700 bg-amber-50 border border-amber-200",
  High:     "text-red-700 bg-red-50 border border-red-200",
};
 
// Backend returns lowercase risk_level: "low" | "moderate" | "high"
const riskLevelStyle = {
  low:      "text-green-700",
  medium:   "text-amber-700",   // kept for safety
  moderate: "text-amber-700",
  high:     "text-red-700",
  // Legacy uppercase keys (in case old data exists)
  LOW:      "text-green-700",
  MEDIUM:   "text-amber-700",
  HIGH:     "text-red-700",
};
 
// ─── Static Data ──────────────────────────────────────────────────────────────
 
const TOP_CATEGORIES = [
  {
    id: "watch",
    label: "Watch Video",
    icon: <Play size={18} className="text-violet-600" />,
    bg: "bg-violet-50",
    border: "border-violet-200",
    description: "Watch guided SEEK videos",
  },
  {
    id: "learn",
    label: "Learn",
    icon: <GraduationCap size={18} className="text-blue-600" />,
    bg: "bg-blue-50",
    border: "border-blue-200",
    description: "Explore concepts & skills",
  },
  {
    id: "skills",
    label: "Skills Practice",
    icon: <Dumbbell size={18} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    description: "Practice SEEK exercises",
  },
];
 
const SUB_OPTIONS = {
  watch: {
    heading: "Watch Video",
    icon: <Play size={14} className="text-violet-500" />,
    items: [
      {
        id: "v1", label: "Calm Your Mind Before Exams", meta: "5–7 min", type: "video",
        video: {
          title: "Calm Your Mind Before Exams", duration: "5–7 min",
          description: "Learn evidence-based techniques to manage exam stress and maintain focus during study sessions.",
          gradient: "linear-gradient(135deg, #e0c3fc 0%, #f9a8d4 100%)",
          points: ["Practical techniques you can use immediately", "Evidence-based SEEK framework application", "Reflection prompts for deeper understanding"],
        },
      },
      {
        id: "v2", label: "Building Empathy in Daily Life", meta: "8–10 min", type: "video",
        video: {
          title: "Building Empathy in Daily Life", duration: "8–10 min",
          description: "Explore practical ways to cultivate empathy and deepen your emotional connections with others.",
          gradient: "linear-gradient(135deg, #a5f3fc 0%, #6ee7b7 100%)",
          points: ["Core empathy-building exercises", "Real-world SEEK scenarios", "Personal reflection journal prompts"],
        },
      },
      {
        id: "v3", label: "Understanding Your Emotions", meta: "6–8 min", type: "video",
        video: {
          title: "Understanding Your Emotions", duration: "6–8 min",
          description: "Develop a richer vocabulary for your emotional experiences and learn to navigate them with clarity.",
          gradient: "linear-gradient(135deg, #fde68a 0%, #fca5a5 100%)",
          points: ["Emotion naming and labelling", "Self-regulation strategies", "Applying insights in real conversations"],
        },
      },
      {
        id: "v4", label: "Kindness as a Daily Practice", meta: "4–5 min", type: "video",
        video: {
          title: "Kindness as a Daily Practice", duration: "4–5 min",
          description: "Discover simple, powerful acts of kindness that strengthen relationships and boost your own wellbeing.",
          gradient: "linear-gradient(135deg, #fbcfe8 0%, #c7d2fe 100%)",
          points: ["Science of kindness & wellbeing", "SEEK-guided kindness challenges", "Building a kindness habit"],
        },
      },
    ],
  },
  learn: {
    heading: "Learn",
    icon: <GraduationCap size={14} className="text-blue-500" />,
    items: [
      { id: "l1", label: "Help me make sense of these ideas",                      meta: "Concept clarity", type: "chat", prompt: "Help me make sense of the SEEK principles and how they connect." },
      { id: "l2", label: "Develop concept maps",                                    meta: "Visual learning", type: "chat", prompt: "Help me develop a concept map for what I've been learning." },
      { id: "l3", label: "Create a knowledge map that reveals surprising patterns", meta: "Deep insight",    type: "chat", prompt: "Create a knowledge map that reveals surprising patterns in what I know about empathy." },
      { id: "l4", label: "Find the best books on a subject",                       meta: "Reading list",    type: "chat", prompt: "Recommend the best books on empathy and emotional intelligence." },
      { id: "l5", label: "Design learning portfolios",                             meta: "Self-directed",   type: "chat", prompt: "Help me design a personal learning portfolio for my SEEK journey." },
    ],
  },
  skills: {
    heading: "Skills Practice",
    icon: <Dumbbell size={14} className="text-emerald-500" />,
    items: [
      { id: "s1", label: "Practice self-awareness check-in", meta: "5 min · Reflective",   type: "chat", prompt: "Let's do a self-awareness check-in using the SEEK framework." },
      { id: "s2", label: "Explore an ethical scenario",      meta: "Case study",            type: "chat", prompt: "Give me an ethical scenario to explore using SEEK principles." },
      { id: "s3", label: "Today's kindness challenge",       meta: "Daily activity",        type: "chat", prompt: "Give me today's kindness challenge to build empathy." },
      { id: "s4", label: "Empathy role-play exercise",       meta: "Interactive practice",  type: "chat", prompt: "Start an empathy role-play exercise with me." },
    ],
  },
  support: {
    heading: "Support",
    icon: <HeartHandshake size={14} className="text-rose-400" />,
    items: [
      { id: "su1", label: "I need someone to talk to",   meta: "Guided conversation", type: "chat", prompt: "I'm feeling a bit overwhelmed and would like to talk." },
      { id: "su2", label: "Guided journaling prompt",    meta: "Reflective writing",  type: "chat", prompt: "Give me a guided journaling prompt to reflect on my emotions today." },
      { id: "su3", label: "Breathing & mindfulness",     meta: "2–3 min · Calming",   type: "chat", prompt: "Walk me through a short breathing and mindfulness exercise." },
      { id: "su4", label: "Help me understand my mood",  meta: "Emotion check-in",    type: "chat", prompt: "Help me understand and process the emotions I'm feeling right now." },
    ],
  },
  progress: {
    heading: "My Progress",
    icon: <BarChart2 size={14} className="text-teal-500" />,
    items: [
      { id: "p1", label: "Check my skills progress",     meta: "Skills summary",    type: "chat", prompt: "Summarise my SEEK skills progress and suggest what to focus on next." },
      { id: "p2", label: "What should I focus on next?", meta: "Personalised plan", type: "chat", prompt: "Based on my progress, what should I focus on next?" },
      { id: "p3", label: "Show my assessment results",   meta: "Pre/Post scores",   type: "chat", prompt: "Show me a summary of my assessment results so far." },
      { id: "p4", label: "Celebrate a recent win",       meta: "Motivational",      type: "chat", prompt: "Help me recognise and celebrate a recent win in my SEEK journey." },
    ],
  },
};
 
// ─── Video Modal ──────────────────────────────────────────────────────────────
 
function VideoModal({ video, onClose }) {
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm"
        style={{ animation: "seekModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ background: video.gradient, height: 176 }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-24 h-24 rounded-full border-4 border-white" />
            <div className="absolute w-16 h-16 rounded-full border-4 border-white" />
            <div className="absolute w-8 h-8 rounded-full bg-white" />
          </div>
          <button
            className="relative z-10 flex items-center gap-2 bg-white text-gray-800 font-semibold text-sm px-5 py-2.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
            onClick={() => alert("Video player would open here.")}
          >
            <Play size={14} className="text-violet-600" fill="#7c3aed" />
            Watch Video
          </button>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-white/70 hover:bg-white rounded-full p-1.5 transition-colors shadow"
          >
            <X size={15} className="text-gray-600" />
          </button>
        </div>
 
        <div className="px-6 py-5">
          <h2 className="text-base font-bold text-gray-800">{video.title}</h2>
          <p className="text-sm font-semibold text-violet-500 mt-0.5 mb-3">{video.duration}</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">{video.description}</p>
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">In This Video:</p>
          <ul className="space-y-2 mb-5">
            {video.points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 size={14} className="text-violet-500 mt-0.5 flex-shrink-0" />
                {pt}
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => alert("Video player would open here.")}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
            >
              Watch Now
            </button>
          </div>
        </div>
      </div>
 
      <style>{`
        @keyframes seekModalIn {
          from { opacity:0; transform:scale(0.88) translateY(18px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
 
// ─── Top Category Panel ───────────────────────────────────────────────────────
 
function TopCategoryPanel({ onSelect }) {
  return (
    <div className="mx-5 mb-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">What would you like to do?</p>
      </div>
      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TOP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left hover:shadow-sm transition-all hover:scale-[1.02] active:scale-[0.99] ${cat.bg} ${cat.border}`}
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
              {cat.icon}
            </div>
            <span className="text-sm font-semibold text-gray-800">{cat.label}</span>
            <span className="text-xs text-gray-500 leading-tight">{cat.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
 
// ─── Sub-list Panel ───────────────────────────────────────────────────────────
 
function SubListPanel({ categoryId, onSelect, onBack, onClose }) {
  const data = SUB_OPTIONS[categoryId];
  if (!data) return null;
 
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
 
  return (
    <div
      className="mx-5 mb-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      style={{ animation: "seekSubIn 0.16s ease-out" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-700 transition-colors">
            <ChevronLeft size={16} />
          </button>
          {data.icon}
          <span className="text-sm font-semibold text-gray-700">{data.heading}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={15} />
        </button>
      </div>
 
      <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
        {data.items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
            style={{ borderTop: i > 0 ? "1px solid #f1f5f9" : "none" }}
          >
            <div className="flex-1 min-w-0 pr-3">
              <p className="text-sm text-gray-700 group-hover:text-gray-900 font-normal leading-snug">
                {item.label}
              </p>
              {item.meta && (
                <p className="text-xs text-gray-400 mt-0.5">{item.meta}</p>
              )}
            </div>
            {item.type === "video" && (
              <Play size={13} className="text-gray-300 group-hover:text-violet-400 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
 
      <style>{`
        @keyframes seekSubIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
 
// ─── Chat Input ───────────────────────────────────────────────────────────────
 
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
 
// ─── Main Page ────────────────────────────────────────────────────────────────
 
export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
  const { messages, addMessage, isLoading, setLoading } = useChatStore();
 
  const [subPanel, setSubPanel] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
 
  // Live stats updated from each AI response — seeded with user profile defaults
  const [liveStats, setLiveStats] = useState({
    emotionalLevel: "Moderate",
    riskLevel:      "low",
    currentEmotion: "Calm",
    skillsProgress: user?.skillsProgress || "2/8",
  });
 
  const ts = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
 
  const handleSend = useCallback(async (text) => {
    // Add user message immediately
    addMessage({
      id:        Date.now(),
      role:      "user",
      content:   text,
      timestamp: ts(),
      emotion:   "neutral",
    });
 
    setLoading(true);
 
    try {
      // sendMessage now returns the normalised shape:
      // { message, emotion, skill, risk_level, confidence }
      const res = await sendMessage(text);
 
      // Add assistant reply
      addMessage({
        id:        Date.now() + 1,
        role:      "assistant",
        content:   res.message,   // normalised from backend's "response" field
        timestamp: ts(),
        emotion:   res.emotion ?? "calm",
        skill:     res.skill,
      });
 
      // Update live stats header from AI response
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
          : "I'm here to listen. It seems there was a connection issue — please try again.",
        timestamp: ts(),
        emotion:   "calm",
      });
    } finally {
      setLoading(false);
    }
  }, [addMessage, setLoading]);
 
  const handleSubSelect = useCallback((item) => {
    setSubPanel(null);
    if (item.type === "video") {
      setActiveVideo(item.video);
    } else {
      handleSend(item.prompt);
    }
  }, [handleSend]);
 
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
 
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Welcome,</p>
            {/* Fixed: was user?.fullame (typo) */}
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
 
      {/* ── Chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💬</span>
            <h1 className="text-xl font-bold text-gray-800">SEEK Empathy Guide Chatbot</h1>
          </div>
          <p className="text-sm text-gray-500">
            Emotion-aware support guided by SEEK principles:{" "}
            <span className="font-medium text-indigo-600">
              Self-awareness, Empathy, Ethics, and Kindness.
            </span>
          </p>
        </div>
 
        {/* Messages */}
        <div className="flex-1 mx-5 mb-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <ChatWindow messages={messages} isLoading={isLoading} />
        </div>
 
        {/* Panels + Input */}
        <div className="flex-shrink-0">
          <ChatInputArea onSend={handleSend} isLoading={isLoading} />
          {subPanel ? (
            <SubListPanel
              categoryId={subPanel}
              onSelect={handleSubSelect}
              onBack={() => setSubPanel(null)}
              onClose={() => setSubPanel(null)}
            />
          ) : (
            <TopCategoryPanel onSelect={(id) => setSubPanel(id)} />
          )}
        </div>
      </div>
 
      {/* Video Modal */}
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
 
// ─── Stat Card ────────────────────────────────────────────────────────────────
 
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