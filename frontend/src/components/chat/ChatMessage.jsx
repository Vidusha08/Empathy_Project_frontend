import { useState } from "react";
import { Play, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
 
// ─── Skill → resources map ────────────────────────────────────────────────────
// Keys must match the `skill` string returned by the backend exactly.
// Set value to null to suppress the panel for that skill.
const SKILL_RESOURCES = {
  "Self-awareness": {
    color: "indigo",
    videos: [
      { label: "Understanding Your Emotions",  meta: "6–8 min" },
      { label: "Calm Your Mind Before Exams",  meta: "5–7 min" },
    ],
    activities: [
      { label: "Self-awareness check-in",  meta: "5 min · Reflective" },
      { label: "Guided journaling prompt", meta: "Reflective writing"  },
    ],
  },
  "Empathy": {
    color: "teal",
    videos: [
      { label: "Building Empathy in Daily Life", meta: "8–10 min" },
      { label: "Understanding Your Emotions",    meta: "6–8 min"  },
    ],
    activities: [
      { label: "Empathy role-play exercise", meta: "Interactive practice" },
      { label: "Today's kindness challenge", meta: "Daily activity"       },
    ],
  },
  "Ethics": {
    color: "violet",
    videos: [
      { label: "Building Empathy in Daily Life", meta: "8–10 min" },
      { label: "Kindness as a Daily Practice",   meta: "4–5 min"  },
    ],
    activities: [
      { label: "Explore an ethical scenario", meta: "Case study"          },
      { label: "Self-awareness check-in",     meta: "5 min · Reflective"  },
    ],
  },
  "Kindness": {
    color: "pink",
    videos: [
      { label: "Kindness as a Daily Practice",   meta: "4–5 min"  },
      { label: "Building Empathy in Daily Life", meta: "8–10 min" },
    ],
    activities: [
      { label: "Today's kindness challenge", meta: "Daily activity"       },
      { label: "Empathy role-play exercise", meta: "Interactive practice" },
    ],
  },
  "Emotional Awareness": {
    color: "amber",
    videos: [
      { label: "Understanding Your Emotions", meta: "6–8 min" },
      { label: "Calm Your Mind Before Exams", meta: "5–7 min" },
    ],
    activities: [
      { label: "Help me understand my mood", meta: "Emotion check-in"  },
      { label: "Guided journaling prompt",   meta: "Reflective writing" },
    ],
  },
  "Stress Management": {
    color: "orange",
    videos: [
      { label: "Calm Your Mind Before Exams", meta: "5–7 min" },
      { label: "Understanding Your Emotions", meta: "6–8 min" },
    ],
    activities: [
      { label: "Breathing & mindfulness",    meta: "2–3 min · Calming" },
      { label: "Help me understand my mood", meta: "Emotion check-in"  },
    ],
  },
  "Crisis Support": {
    color: "red",
    videos: [
      { label: "Calm Your Mind Before Exams", meta: "5–7 min" },
      { label: "Understanding Your Emotions", meta: "6–8 min" },
    ],
    activities: [
      { label: "Breathing & mindfulness",    meta: "2–3 min · Calming" },
      { label: "Help me understand my mood", meta: "Emotion check-in"  },
    ],
  },
  // Explicitly null — no panel shown
  "General Support": null,
};
 
// ─── Per-color Tailwind classes ───────────────────────────────────────────────
const colorMap = {
  indigo: {
    wrap:     "bg-indigo-50 border-indigo-100",
    badge:    "bg-indigo-100 text-indigo-700",
    heading:  "text-indigo-600",
    videoBtn: "bg-indigo-600 hover:bg-indigo-700 text-white",
    actBtn:   "bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50",
    icon:     "text-indigo-400",
    toggle:   "hover:bg-indigo-50",
  },
  teal: {
    wrap:     "bg-teal-50 border-teal-100",
    badge:    "bg-teal-100 text-teal-700",
    heading:  "text-teal-600",
    videoBtn: "bg-teal-600 hover:bg-teal-700 text-white",
    actBtn:   "bg-white border border-teal-200 text-teal-700 hover:bg-teal-50",
    icon:     "text-teal-400",
    toggle:   "hover:bg-teal-50",
  },
  violet: {
    wrap:     "bg-violet-50 border-violet-100",
    badge:    "bg-violet-100 text-violet-700",
    heading:  "text-violet-600",
    videoBtn: "bg-violet-600 hover:bg-violet-700 text-white",
    actBtn:   "bg-white border border-violet-200 text-violet-700 hover:bg-violet-50",
    icon:     "text-violet-400",
    toggle:   "hover:bg-violet-50",
  },
  pink: {
    wrap:     "bg-pink-50 border-pink-100",
    badge:    "bg-pink-100 text-pink-700",
    heading:  "text-pink-600",
    videoBtn: "bg-pink-600 hover:bg-pink-700 text-white",
    actBtn:   "bg-white border border-pink-200 text-pink-700 hover:bg-pink-50",
    icon:     "text-pink-400",
    toggle:   "hover:bg-pink-50",
  },
  amber: {
    wrap:     "bg-amber-50 border-amber-100",
    badge:    "bg-amber-100 text-amber-700",
    heading:  "text-amber-600",
    videoBtn: "bg-amber-500 hover:bg-amber-600 text-white",
    actBtn:   "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50",
    icon:     "text-amber-400",
    toggle:   "hover:bg-amber-50",
  },
  orange: {
    wrap:     "bg-orange-50 border-orange-100",
    badge:    "bg-orange-100 text-orange-700",
    heading:  "text-orange-600",
    videoBtn: "bg-orange-500 hover:bg-orange-600 text-white",
    actBtn:   "bg-white border border-orange-200 text-orange-700 hover:bg-orange-50",
    icon:     "text-orange-400",
    toggle:   "hover:bg-orange-50",
  },
  red: {
    wrap:     "bg-red-50 border-red-100",
    badge:    "bg-red-100 text-red-700",
    heading:  "text-red-600",
    videoBtn: "bg-red-600 hover:bg-red-700 text-white",
    actBtn:   "bg-white border border-red-200 text-red-700 hover:bg-red-50",
    icon:     "text-red-400",
    toggle:   "hover:bg-red-50",
  },
};
 
// ─── Skill resources panel ────────────────────────────────────────────────────
function SkillResources({ skill }) {
  const [open, setOpen] = useState(true); // open by default so student sees it immediately
 
  const resources = SKILL_RESOURCES[skill];
  if (!resources) return null;
 
  const c = colorMap[resources.color] || colorMap.indigo;
 
  return (
    <div className={`mt-3 rounded-xl border overflow-hidden ${c.wrap}`}>
 
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${c.toggle}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${c.badge}`}>
            {skill}
          </span>
          <span className="text-[11px] text-gray-500 font-medium">
            Explore more to strengthen this skill ✨
          </span>
        </div>
        {open
          ? <ChevronUp   size={13} className="text-gray-400 flex-shrink-0 ml-1" />
          : <ChevronDown size={13} className="text-gray-400 flex-shrink-0 ml-1" />
        }
      </button>
 
      {/* Expanded body */}
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t border-white/60">
 
          {/* Videos */}
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${c.heading}`}>
              📹 Watch
            </p>
            <div className="space-y-1.5">
              {resources.videos.map((v, i) => (
                <button
                  key={i}
                  onClick={() => alert(`Video: ${v.label}`)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] font-medium transition-all shadow-sm ${c.videoBtn}`}
                >
                  <Play size={10} fill="currentColor" className="flex-shrink-0" />
                  <span className="flex-1 leading-snug">{v.label}</span>
                  <span className="opacity-75 text-[10px] flex-shrink-0">{v.meta}</span>
                </button>
              ))}
            </div>
          </div>
 
          {/* Activities */}
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${c.heading}`}>
              🏋️ Practice
            </p>
            <div className="space-y-1.5">
              {resources.activities.map((a, i) => (
                <button
                  key={i}
                  onClick={() => alert(`Activity: ${a.label}`)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-[11px] font-medium transition-all ${c.actBtn}`}
                >
                  <Dumbbell size={10} className={`flex-shrink-0 ${c.icon}`} />
                  <span className="flex-1 leading-snug">{a.label}</span>
                  <span className="text-gray-400 text-[10px] flex-shrink-0">{a.meta}</span>
                </button>
              ))}
            </div>
          </div>
 
        </div>
      )}
    </div>
  );
}
 
// ─── Main component ───────────────────────────────────────────────────────────
export default function ChatMessage({ message }) {
  const { role, content, timestamp, skill } = message;
  const isUser = role === "user";
 
  // Show skill panel only on assistant messages with a recognised, non-null skill
  const showResources =
    !isUser &&
    skill &&
    skill in SKILL_RESOURCES &&
    SKILL_RESOURCES[skill] !== null;
 
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[72%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-[#1a237e] text-white rounded-br-sm"
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
        }`}
      >
        {/* Message text */}
        <p className="text-sm leading-relaxed">{content}</p>
 
        {/* Timestamp only — emotion badge removed from both sides */}
        {timestamp && (
          <p className={`text-[10px] mt-1.5 ${isUser ? "text-white/50" : "text-gray-400"}`}>
            {timestamp}
          </p>
        )}
 
        {/* Skill resources panel — assistant only, when skill is identified */}
        {showResources && <SkillResources skill={skill} />}
      </div>
    </div>
  );
}
