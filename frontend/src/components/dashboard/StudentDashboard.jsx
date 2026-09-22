// src/components/dashboard/StudentDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Wind, Scale, Eye, Heart, Users, Sunrise, HeartHandshake, HandHeart,
  MessageSquare, BookOpen, ArrowRight, Trophy, Flame,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import RabbitIdle from "../chat/RabbitIdle";

// NOTE: ids here should match whatever skill_id values your backend's
// knowledge_base.json / keyword_skill_map.json actually use.
const SKILLS = [
  { id: "calming_body_mind", title: "Calming the Body and Mind", icon: Wind, color: "#7C9885" },
  { id: "ethical_mindfulness", title: "Ethical Mindfulness", icon: Scale, color: "#B08968" },
  { id: "emotional_awareness", title: "Emotional Awareness", icon: Eye, color: "#7B9EA8" },
  { id: "self_compassion", title: "Self-Compassion", icon: Heart, color: "#C97D7D" },
  { id: "impartiality_common_humanity", title: "Impartiality & Common Humanity", icon: Users, color: "#9B8EA9" },
  { id: "forgiveness_gratitude", title: "Forgiveness and Gratitude", icon: Sunrise, color: "#D9A85E" },
  { id: "empathic_concern", title: "Empathic Concern", icon: HeartHandshake, color: "#6E9887" },
  { id: "compassion", title: "Compassion", icon: HandHeart, color: "#C17F59" },
];

const MOCK_PERCENTAGES = [80, 45, 100, 20, 60, 35, 90, 10];
const MOCK_PROGRESS = SKILLS.reduce((acc, skill, i) => {
  acc[skill.id] = { percent_complete: MOCK_PERCENTAGES[i] };
  return acc;
}, {});

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-[#EDE6D9] shadow-sm flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}22` }}
      >
        <Icon size={15} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-[#9B8E7E] truncate leading-tight">{label}</p>
        <p className="text-base font-bold text-[#3A342B] leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(MOCK_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);

  const firstName = useMemo(
    () => (user?.name || "").trim().split(/\s+/)[0] || "there",
    [user?.name]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      try {
        const mod = await import("../../api/progressApi");
        if (!mod?.getSkillProgress) throw new Error("progressApi not ready");

        const results = await Promise.all(
          SKILLS.map((skill) => mod.getSkillProgress(skill.id))
        );
        if (cancelled) return;

        const next = {};
        SKILLS.forEach((skill, i) => {
          next[skill.id] = results[i] ?? MOCK_PROGRESS[skill.id];
        });
        setProgress(next);
        setUsingMock(false);
      } catch {
        if (!cancelled) setUsingMock(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProgress();
    return () => { cancelled = true; };
  }, []);

  const barData = SKILLS.map((skill) => ({
    name: skill.title.split(" ").slice(0, 2).join(" "),
    fullName: skill.title,
    progress: progress[skill.id]?.percent_complete ?? 0,
    color: skill.color,
  }));

  const completedCount = barData.filter((s) => s.progress >= 100).length;
  const inProgressCount = barData.filter((s) => s.progress > 0 && s.progress < 100).length;
  const notStartedCount = barData.filter((s) => s.progress === 0).length;

  const pieData = [
    { name: "Completed", value: completedCount, color: "#6E9887" },
    { name: "In Progress", value: inProgressCount, color: "#D9A85E" },
    { name: "Not Started", value: notStartedCount, color: "#E4DDD0" },
  ].filter((d) => d.value > 0);

  const overallPercent = Math.round(
    barData.reduce((sum, s) => sum + s.progress, 0) / barData.length
  );

  return (
    // flex-1 + min-h-0 lets this size to whatever Layout.jsx gives it;
    // overflow-y-auto on THIS element (not a wrapper) is what scrolls.
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#F6F2EC]">
      <div className="p-4 md:p-5" >

        {/* Header style={{ fontFamily: "'Work Sans', sans-serif" }}*/}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <p className="text-xs text-[#9B8E7E] font-medium mb-0.5">Welcome back</p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#3A342B]" style={{ fontFamily: "'Newsreader', serif" }}>
              Hi, {firstName} 👋
            </h1>
            <p className="text-sm text-[#6B6255] mt-0.5">Let's keep building your empathy skills today.</p>
          </div>
          <div className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-[#EDE6D9] self-start">
            <Trophy size={18} className="text-[#D9A85E]" />
            <div>
              <p className="text-[11px] text-[#9B8E7E] leading-tight">Overall progress</p>
              <p className="text-base font-bold text-[#3A342B] leading-tight">{overallPercent}%</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gradient-to-br from-[#EFE6F5] to-[#F6F2EC] rounded-2xl p-4 border border-[#E7DEEF] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8B6FA8] bg-white/70 px-2.5 py-0.5 rounded-full mb-2">
                <MessageSquare size={12} /> Chatbot
              </span>
              <h3 className="text-base font-bold text-[#3A342B] mb-1" >
                Talk to YESGuru
              </h3>
              <p className="text-xs text-[#6B6255] mb-3">
                Ask a question, explore a feeling, or continue where you left off.
              </p>
              <button
                onClick={() => navigate("/chat")}
                className="inline-flex items-center gap-1.5 bg-[#3A342B] text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-[#4A4437] transition-colors"
              >
                Start chatting <ArrowRight size={14} />
              </button>
            </div>
            <RabbitIdle onClick={() => navigate("/chat")} size={90} />
          </div>

          <div className="bg-gradient-to-br from-[#E8F0E9] to-[#F6F2EC] rounded-2xl p-4 border border-[#DCEADD] flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#5C8A6B] bg-white/70 px-2.5 py-0.5 rounded-full mb-2">
                <BookOpen size={12} /> Learn
              </span>
              <h3 className="text-base font-bold text-[#3A342B] mb-1" >
                Explore the 8 Skills
              </h3>
              <p className="text-xs text-[#6B6255] mb-3">
                Browse each empathy skill, track objectives, and pick up where you paused.
              </p>
            </div>
            <button
              onClick={() => navigate("/content")}
              className="inline-flex items-center gap-1.5 bg-white text-[#3A342B] text-xs font-semibold px-3.5 py-2 rounded-lg border-2 border-[#3A342B]/10 hover:border-[#3A342B]/30 transition-colors self-start"
            >
              View content <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatCard icon={Flame} label="Day streak" value="—" accent="#D9765E" />
          <StatCard icon={Trophy} label="Skills completed" value={`${completedCount}/8`} accent="#6E9887" />
          <StatCard icon={BookOpen} label="In progress" value={inProgressCount} accent="#D9A85E" />
          <StatCard icon={Heart} label="Not started" value={notStartedCount} accent="#9B8E7E" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-[#EDE6D9] shadow-sm">
            <h3 className="text-sm font-bold text-[#3A342B] mb-2" >
              Progress by skill
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE6D9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6B6255" }} interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6B6255" }} unit="%" width={32} />
                <Tooltip
                  formatter={(value, _name, item) => [`${value}%`, item.payload.fullName]}
                  contentStyle={{ borderRadius: 10, border: "1px solid #EDE6D9", fontSize: 12 }}
                />
                <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EDE6D9] shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-[#3A342B] mb-2" >
              Skill status
            </h3>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={32} outerRadius={54} paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EDE6D9", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1 mt-1">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-xs text-[#6B6255]">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.name} <span className="ml-auto font-semibold text-[#3A342B]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All skills grid
        <div className="bg-white rounded-2xl p-4 border border-[#EDE6D9] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#3A342B]" style={{ fontFamily: "'Newsreader', serif" }}>
              All skills
            </h3>
            <button onClick={() => navigate("/content")} className="text-xs font-semibold text-[#8B6FA8] hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SKILLS.map((skill) => {
              const Icon = skill.icon;
              const pct = progress[skill.id]?.percent_complete ?? 0;
              return (
                <button
                  key={skill.id}
                  onClick={() => navigate("/content")}
                  className="text-left bg-[#FAF7F1] rounded-xl p-3 border border-[#EDE6D9] hover:border-[#3A342B]/20 hover:shadow-md transition-all"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: `${skill.color}22` }}>
                    <Icon size={14} style={{ color: skill.color }} />
                  </div>
                  <p className="text-xs font-semibold text-[#3A342B] mb-1.5 leading-snug">{skill.title}</p>
                  <div className="h-1.5 bg-[#EDE6D9] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: skill.color }} />
                  </div>
                  <p className="text-[11px] text-[#9B8E7E] mt-1">{pct}% complete</p>
                </button>
              );
            })}
          </div>
        </div> */}

        {usingMock && !loading && (
          <p className="text-[11px] text-[#9B8E7E] mt-3 text-center">
            Showing sample progress data — connect progressApi to see live numbers.
          </p>
        )}
      </div>
    </div>
  );
}
/*import { useAuthStore } from "../../store/authStore";

export default function StudentDashboard() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
      <div className="p-4">Student Dashboard Page</div>
      {/* TODO: skill progress cards, recent chats, etc. *}
    </div>
  );
}*/