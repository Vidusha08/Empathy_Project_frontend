/*export default function AssessmentPage() {
  return <div className="p-4">Assessment Page</div>;
}*/
import { useNavigate } from "react-router-dom";
import { MessageSquare, CheckCircle2, Brain, Lightbulb, ShieldCheck } from "lucide-react";
 
const seekPrinciples = [
  {
    icon: Brain,
    label: "Self-awareness",
    desc: "Understand your own emotions and how they affect you.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  {
    icon: MessageSquare,
    label: "Empathy",
    desc: "Connect with others through compassion and understanding.",
    color: "bg-pink-50 text-pink-600 border-pink-100",
  },
  {
    icon: ShieldCheck,
    label: "Ethics",
    desc: "Make decisions guided by fairness and integrity.",
    color: "bg-green-50 text-green-600 border-green-100",
  },
  {
    icon: Lightbulb,
    label: "Kindness",
    desc: "Respond to yourself and others with warmth and care.",
    color: "bg-yellow-50 text-yellow-600 border-yellow-100",
  },
];
 
export default function AssessmentPage() {
  const navigate = useNavigate();
 
  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
 
        {/* Hero card */}
        <div className="bg-gradient-to-br from-[#1a237e] to-[#3949ab] rounded-3xl p-8 text-white mb-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/5" />
          <div className="absolute right-4 bottom-0 w-24 h-24 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 mb-4">
              <CheckCircle2 size={14} />
              <span className="text-xs font-medium">Pre-Skill Assessment</span>
            </div>
            <h1 className="text-2xl font-bold mb-2 leading-snug">
              Welcome to SEEK Empathy
            </h1>
            <p className="text-white/75 text-sm leading-relaxed">
              Before you start your journey, let's understand how you're feeling.
              This quick assessment helps your guide personalise support for you.
            </p>
          </div>
        </div>
 
        {/* SEEK principles */}
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Your journey is guided by
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {seekPrinciples.map(({ icon: Icon, label, desc, color }) => (
            <div
              key={label}
              className={`bg-white border rounded-2xl p-4 flex flex-col gap-2 shadow-sm ${color.split(" ").find(c => c.startsWith("border"))}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.split(" ").slice(0, 2).join(" ")}`}>
                <Icon size={17} />
              </div>
              <p className="font-semibold text-gray-800 text-sm">{label}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
 
        {/* What to expect */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">
            What to expect
          </h3>
          <ul className="space-y-2.5">
            {[
              "Share how you're feeling right now — there are no wrong answers.",
              "The chatbot will guide you through personalised coping strategies.",
              "Your emotional level and risk level will be tracked over time.",
              "You can revisit the assessment anytime from your profile.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
 
        {/* CTA */}
        <button
          onClick={() => navigate("/chat")}
          className="w-full flex items-center justify-center gap-2.5 bg-[#1a237e] hover:bg-[#283593] active:scale-[0.98] text-white font-semibold py-4 rounded-2xl transition-all shadow-lg text-base"
        >
          <MessageSquare size={18} />
          Start Chatting with Your Guide
        </button>
 
        <p className="text-center text-xs text-gray-400 mt-3">
          Your responses are private and used only to personalise your experience.
        </p>
      </div>
    </div>
  );
}