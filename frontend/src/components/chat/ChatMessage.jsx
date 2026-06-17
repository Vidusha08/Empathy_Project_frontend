//src/components/chat/chatMessage.jsx
import { useState } from "react";
import { Play, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
 
// ─────────────────────────────────────────────────────────────────────────────
// Skill → resources map
// Keys match backend `skill` strings EXACTLY (from skills.json).
// Activities here are the real practice activities from skills.json.
// null = suppress panel entirely.
// ─────────────────────────────────────────────────────────────────────────────
const SKILL_RESOURCES = {
  "Calming the Body and Mind": {
    color: "teal",
    videos: [
      { label: "Calm Your Mind Before Exams",  meta: "5–7 min" },
      { label: "Understanding Your Emotions",  meta: "6–8 min" },
    ],
    activities: [
      { label: "Palms rubbing sensation practice", meta: "Body awareness" },
      { label: "Chair & feet grounding",           meta: "Grounding · 3 min" },
      { label: "Resource visualisation",           meta: "Calming · 5 min" },
    ],
  },
  "Ethical Mindfulness": {
    color: "violet",
    videos: [
      { label: "Building Empathy in Daily Life", meta: "8–10 min" },
      { label: "Kindness as a Daily Practice",   meta: "4–5 min"  },
    ],
    activities: [
      { label: "Social media anger reflection",  meta: "Values check-in" },
      { label: "Impulse buying reflection",      meta: "Mindful pause"   },
      { label: "Team aggression reflection",     meta: "Case study"      },
    ],
  },
  "Emotional Awareness": {
    color: "amber",
    videos: [
      { label: "Understanding Your Emotions",  meta: "6–8 min" },
      { label: "Calm Your Mind Before Exams",  meta: "5–7 min" },
    ],
    activities: [
      { label: "Daily emotion check-in",       meta: "5 min · Reflective"  },
      { label: "Classify your emotions",       meta: "Awareness exercise"   },
      { label: "5-second pause practice",      meta: "Quick · Daily habit"  },
    ],
  },
  "Self Compassion": {
    color: "rose",
    videos: [
      { label: "Understanding Your Emotions",    meta: "6–8 min"  },
      { label: "Building Empathy in Daily Life", meta: "8–10 min" },
    ],
    activities: [
      { label: "Aspiration vs expectation reflection", meta: "Self-reflection" },
      { label: "Letter to a friend activity",          meta: "Compassion write" },
    ],
  },
  "Impartiality and Common Humanity": {
    color: "sky",
    videos: [
      { label: "Building Empathy in Daily Life", meta: "8–10 min" },
      { label: "Kindness as a Daily Practice",   meta: "4–5 min"  },
    ],
    activities: [
      { label: "Who are you? Mind map",  meta: "Identity reflection" },
      { label: "Identity reflection",    meta: "Bias awareness"      },
    ],
  },
  "Forgiveness and Gratitude": {
    color: "green",
    videos: [
      { label: "Kindness as a Daily Practice",   meta: "4–5 min"  },
      { label: "Building Empathy in Daily Life", meta: "8–10 min" },
    ],
    activities: [
      { label: "Forgiveness reflection",   meta: "Letting go · 10 min" },
      { label: "Naikan gratitude practice", meta: "Gratitude · Daily"  },
    ],
  },
  "Empathic Concern": {
    color: "indigo",
    videos: [
      { label: "Building Empathy in Daily Life", meta: "8–10 min" },
      { label: "Understanding Your Emotions",    meta: "6–8 min"  },
    ],
    activities: [
      { label: "Gratitude for others' success", meta: "Sympathetic joy"    },
      { label: "Grounding when overwhelmed",    meta: "2–3 min · Calming"  },
    ],
  },
  "Compassion": {
    color: "pink",
    videos: [
      { label: "Building Empathy in Daily Life", meta: "8–10 min" },
      { label: "Kindness as a Daily Practice",   meta: "4–5 min"  },
    ],
    activities: [
      { label: "Personal compassion mapping",           meta: "Deep reflection" },
      { label: "Balancing self & others compassion",   meta: "Practice · 10 min" },
    ],
  },
  // Legacy / fallback keys — suppress panel 
  "General Support": null,
  "Crisis Support":  null,   // handled by safety service separately
};
 
// ─────────────────────────────────────────────────────────────────────────────
// Skill names that represent a real detected skill vs a generic greeting reply.
// If the backend returns a skill NOT in this set, treat as no-skill.
// ─────────────────────────────────────────────────────────────────────────────
const VALID_SKILLS = new Set(Object.keys(SKILL_RESOURCES).filter(k => SKILL_RESOURCES[k] !== null));
 
// ─────────────────────────────────────────────────────────────────────────────
// Per-color Tailwind classes — orange removed, replaced with sky & rose
// ─────────────────────────────────────────────────────────────────────────────
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
  amber: {
    wrap:     "bg-amber-50 border-amber-100",
    badge:    "bg-amber-100 text-amber-700",
    heading:  "text-amber-600",
    videoBtn: "bg-amber-500 hover:bg-amber-600 text-white",
    actBtn:   "bg-white border border-amber-200 text-amber-700 hover:bg-amber-50",
    icon:     "text-amber-400",
    toggle:   "hover:bg-amber-50",
  },
  rose: {
    wrap:     "bg-rose-50 border-rose-100",
    badge:    "bg-rose-100 text-rose-700",
    heading:  "text-rose-600",
    videoBtn: "bg-rose-500 hover:bg-rose-600 text-white",
    actBtn:   "bg-white border border-rose-200 text-rose-700 hover:bg-rose-50",
    icon:     "text-rose-400",
    toggle:   "hover:bg-rose-50",
  },
  sky: {
    wrap:     "bg-sky-50 border-sky-100",
    badge:    "bg-sky-100 text-sky-700",
    heading:  "text-sky-600",
    videoBtn: "bg-sky-500 hover:bg-sky-600 text-white",
    actBtn:   "bg-white border border-sky-200 text-sky-700 hover:bg-sky-50",
    icon:     "text-sky-400",
    toggle:   "hover:bg-sky-50",
  },
  green: {
    wrap:     "bg-green-50 border-green-100",
    badge:    "bg-green-100 text-green-700",
    heading:  "text-green-600",
    videoBtn: "bg-green-600 hover:bg-green-700 text-white",
    actBtn:   "bg-white border border-green-200 text-green-700 hover:bg-green-50",
    icon:     "text-green-400",
    toggle:   "hover:bg-green-50",
  },
  pink: {
    wrap:     "bg-pink-50 border-pink-100",
    badge:    "bg-pink-100 text-pink-700",
    heading:  "text-pink-600",
    videoBtn: "bg-pink-500 hover:bg-pink-600 text-white",
    actBtn:   "bg-white border border-pink-200 text-pink-700 hover:bg-pink-50",
    icon:     "text-pink-400",
    toggle:   "hover:bg-pink-50",
  },
};
 
// ─────────────────────────────────────────────────────────────────────────────
// Skill resources panel
// ─────────────────────────────────────────────────────────────────────────────
function SkillResources({ skill }) {
  const [open, setOpen] = useState(true);
 
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
 
// ─────────────────────────────────────────────────────────────────────────────
// Main ChatMessage component
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatMessage({ message }) {
  const { role, content, timestamp, skill } = message;
  const isUser = role === "user";
 
  // Only show the panel when:
  // 1. It's an assistant message
  // 2. A skill was returned by the backend
  // 3. That skill is in our VALID_SKILLS set (i.e. a real content skill, not a greeting catch-all)
  const showResources = !isUser && skill && VALID_SKILLS.has(skill);
 
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
 
        {/* Timestamp only */}
        {timestamp && (
          <p className={`text-[10px] mt-1.5 ${isUser ? "text-white/50" : "text-gray-400"}`}>
            {timestamp}
          </p>
        )}
 
        {/* Skill resources — only when a real skill is detected */}
        {showResources && <SkillResources skill={skill} />}
      </div>
    </div>
  );
}