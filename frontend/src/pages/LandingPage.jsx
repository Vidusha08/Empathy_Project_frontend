// src/pages/LandingPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import landing from "../assets/images/landing.webp";
 
const SERIF = { fontFamily: "'Newsreader', Georgia, serif" };
 
const SKILLS = [
  {
    name: "Calming the Body and Mind",
    what: "Slow your breathing and settle your nerves so you can think clearly, even when things feel heavy.",
    tryIt: "Breathe in for 4 counts, out for 6. Repeat five times and notice what changes.",
  },
  {
    name: "Ethical Mindfulness",
    what: "Pause before you react, and choose actions that match what you actually value.",
    tryIt: "Next time you feel pulled to snap at someone, wait one breath and ask: what do I want here?",
  },
  {
    name: "Emotional Awareness",
    what: "Put names to your feelings and spot what sets them off, so they stop catching you off guard.",
    tryIt: "Right now, finish this sentence: \"I feel ___ because ___.\"",
  },
  {
    name: "Self-Compassion",
    what: "Treat yourself with the same kindness you would offer a friend who is struggling.",
    tryIt: "Think of a recent mistake. Write down what you would say to a friend in the same spot.",
  },
  {
    name: "Impartiality and Common Humanity",
    what: "Remember that everyone, including people you disagree with, wants to be happy and to avoid pain.",
    tryIt: "Pick someone who irritates you. Name one thing they probably want, just like you do.",
  },
  {
    name: "Forgiveness and Gratitude",
    what: "Loosen the grip of old resentments and notice the good that is already around you.",
    tryIt: "Write down three small things from today you are thankful for.",
  },
  {
    name: "Empathic Concern",
    what: "Tune in to what others feel and let it move you to care about them.",
    tryIt: "In your next conversation, listen without planning your reply, then reflect back what you heard.",
  },
  {
    name: "Compassion",
    what: "Turn care into action: small, practical things that ease someone else's difficulty.",
    tryIt: "Do one small kind thing for someone today without being asked.",
  },
];
 
const STEPS = [
  { title: "Create your account", text: "Sign up with a username and email. It takes about a minute." },
  { title: "Complete a short check-in", text: "A few questions about how you are doing, plus a quick empathy quiz, so we can start from where you are." },
  { title: "Learn with the chatbot", text: "Talk through each skill with a friendly guide, read the lessons, and take quizzes at your own pace." },
  { title: "Watch yourself grow", text: "See your progress across all eight skills on your dashboard." },
];
 
const NAV = [
  { id: "about", label: "About" },
  { id: "skills", label: "Content" },
  { id: "how", label: "How it works" },
];
 
// TODO: replace the names and roles below with the real team details.
const SUPPORTERS = { name: "Supporter name", role: "Supporter role" };
const CONTRIBUTORS = [
  { name: "Contributor name", role: "Role (e.g. Developer)" },
  { name: "Contributor name", role: "Role (e.g. Developer)" },
  { name: "Contributor name", role: "Role" },
];
 
const initials = (name) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
 
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const skill = SKILLS[active];
 
  const goTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
 
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <style>{`
        @keyframes lp-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        .lp-float { animation: lp-float 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .lp-float { animation: none; } }
      `}</style>
 
      {/* ---------- Navbar ---------- */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-indigo-700 text-lg" style={SERIF}>
            <img src={landing} alt="" className="w-8 h-8 object-contain" />
            EmpathyGuru
          </Link>
 
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => goTo(n.id)} className="hover:text-indigo-600 transition-colors">
                {n.label}
              </button>
            ))}
          </nav>
 
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              Log in
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all">
              Sign up
            </Link>
          </div>
 
          <button className="md:hidden p-2 text-gray-600" aria-label="Toggle menu" aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
 
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => goTo(n.id)}
                className="block w-full text-left text-gray-700 font-medium py-1">{n.label}</button>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/login" className="text-center py-2.5 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold text-sm">Log in</Link>
              <Link to="/register" className="text-center py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm">Sign up</Link>
            </div>
          </div>
        )}
      </header>
 
      {/* ---------- Hero ---------- */}
      <section className="pt-16 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight" style={SERIF}>
              Understand your feelings. Understand others.
            </h1>
            <p className="mt-5 text-lg text-indigo-100 max-w-xl mx-auto md:mx-0">
              EmpathyGuru is a learning platform where you build empathy skills and practise
              staying calm and in control of difficult emotions, one small step at a time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link to="/register"
                className="px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold shadow-xl hover:bg-indigo-50 transition-colors">
                Sign up
              </Link>
              <Link to="/login"
                className="px-8 py-3.5 rounded-xl border-2 border-white/70 text-white font-semibold hover:bg-white/10 transition-colors">
                Log in
              </Link>
            </div>
          </div>
 
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/15 rounded-full blur-2xl" aria-hidden="true" />
              <img src={landing} alt="Your friendly learning guide."
                className="lp-float relative w-56 h-56 md:w-80 md:h-80 object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>
 
      {/* ---------- About ---------- */}
      <section id="about" className="scroll-mt-16 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 max-w-2xl" style={SERIF}>
            A place to practise the skills that make hard moments easier
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl">
            Empathy is something you can learn and strengthen with practice. This platform guides you through
            it using conversation, short lessons and quizzes.
          </p>
 
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { t: "Talk it through", d: "Chat with an AI guide that explains each skill and helps you apply it to real situations from your own life." },
              { t: "Learn by doing", d: "Short lessons and quizzes turn ideas into habits you can use when you are stressed, angry or overwhelmed." },
              { t: "See your progress", d: "Your dashboard shows how you are developing across all eight skills, so you know what to work on next." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 p-6">
                <h3 className="text-lg font-bold text-indigo-700">{c.t}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
 
          {/* About the project + contributors */}
          <div className="mt-12 grid md:grid-cols-5 gap-8 rounded-3xl bg-gray-50 p-6 md:p-8">
            <div className="md:col-span-3">
              <h3 className="text-2xl font-bold text-gray-900" style={SERIF}>About the project</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">
                EmpathyGuru is a research project that teaches the eight empathy skills of the UNESCO SEEK
                framework through an AI chatbot, short lessons and quizzes. It was created to explore whether
                guided, conversational practice can help learners understand their own emotions and respond to
                other people with more care.
              </p>
              <p className="mt-3 text-gray-600 leading-relaxed">
                The sign-up check-in and quizzes are used for research purposes, and your individual results
                are not shown back to you in the app.
              </p>
            </div>
 
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-gray-900" style={SERIF}>Contributors</h3>
              <ul className="mt-3 space-y-3">
                {CONTRIBUTORS.map((p, i) => (
                  <li key={`${p.name}-${i}`} className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-indigo-600 text-white text-sm font-bold">
                      {initials(p.name)}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-purple-600 text-white text-sm font-bold">
                  {initials(SUPPORTERS.name)}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{SUPPORTERS.name}</p>
                  <p className="text-xs text-gray-500">{SUPPORTERS.role}</p>
                </div>
              </div>
            </div>
          </div>
 
          <div className="mt-10 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-900 max-w-3xl">
            EmpathyGuru is a learning tool, not therapy or a replacement for a counsellor. If the
            check-in suggests you would be better supported by a person, we will point you to one first.
          </div>
        </div>
      </section>
 
      {/* ---------- Interactive skills ---------- */}
      <section id="skills" className="scroll-mt-16 py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={SERIF}>Eight skills, one step at a time</h2>
          <p className="mt-4 text-gray-600 max-w-2xl">
            The course follows the UNESCO SEEK framework. Pick a skill to see what it is and try a one-minute exercise.
          </p>
 
          <div className="mt-10 grid md:grid-cols-5 gap-6">
            <div role="tablist" aria-label="Empathy skills" className="md:col-span-2 flex flex-col gap-2">
              {SKILLS.map((s, i) => (
                <button key={s.name} role="tab" aria-selected={i === active} onClick={() => setActive(i)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    i === active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                  }`}>
                  {s.name}
                </button>
              ))}
            </div>
 
            <div role="tabpanel" className="md:col-span-3 bg-white rounded-3xl shadow-xl p-8 self-start">
              <h3 className="text-2xl font-bold text-indigo-700" style={SERIF}>{skill.name}</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">{skill.what}</p>
              <div className="mt-6 rounded-2xl bg-purple-50 border border-purple-100 p-5">
                <p className="font-semibold text-purple-700 text-sm">Try this now</p>
                <p className="mt-1 text-gray-700">{skill.tryIt}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setActive((active + 1) % SKILLS.length)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                  Next skill
                </button>
                <Link to="/login" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-colors">
                  Learn this skill
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* ---------- How it works (a real sequence) ---------- */}
      <section id="how" className="scroll-mt-16 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={SERIF}>How it works</h2>
          <ol className="mt-10 grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border-2 border-gray-100 p-6">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm">{i + 1}</span>
                <h3 className="mt-4 font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
 
      {/* ---------- Final CTA ---------- */}
      <section className="bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white" style={SERIF}>Ready to begin?</h2>
          <p className="mt-3 text-indigo-100">Create an account, or log in to pick up where you left off.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold shadow-xl hover:bg-indigo-50 transition-colors">Sign up</Link>
            <Link to="/login" className="px-8 py-3.5 rounded-xl border-2 border-white/70 text-white font-semibold hover:bg-white/10 transition-colors">Log in</Link>
          </div>
        </div>
      </section>
 
      <footer className="py-8 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} EmpathyGuru</p>
        <p className="mt-1">
          <a href="#" className="hover:text-gray-600 underline">Terms</a>
          {" "}and{" "}
          <a href="#" className="hover:text-gray-600 underline">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
}

/*import { useState } from "react";
import { Link } from "react-router-dom";
import landing from "../assets/images/landing.webp";
 
const SERIF = { fontFamily: "'Newsreader', Georgia, serif" };
 
const SKILLS = [
  {
    name: "Calming the Body and Mind",
    what: "Slow your breathing and settle your nerves so you can think clearly, even when things feel heavy.",
    tryIt: "Breathe in for 4 counts, out for 6. Repeat five times and notice what changes.",
  },
  {
    name: "Ethical Mindfulness",
    what: "Pause before you react, and choose actions that match what you actually value.",
    tryIt: "Next time you feel pulled to snap at someone, wait one breath and ask: what do I want here?",
  },
  {
    name: "Emotional Awareness",
    what: "Put names to your feelings and spot what sets them off, so they stop catching you off guard.",
    tryIt: "Right now, finish this sentence: \"I feel ___ because ___.\"",
  },
  {
    name: "Self-Compassion",
    what: "Treat yourself with the same kindness you would offer a friend who is struggling.",
    tryIt: "Think of a recent mistake. Write down what you would say to a friend in the same spot.",
  },
  {
    name: "Impartiality and Common Humanity",
    what: "Remember that everyone, including people you disagree with, wants to be happy and to avoid pain.",
    tryIt: "Pick someone who irritates you. Name one thing they probably want, just like you do.",
  },
  {
    name: "Forgiveness and Gratitude",
    what: "Loosen the grip of old resentments and notice the good that is already around you.",
    tryIt: "Write down three small things from today you are thankful for.",
  },
  {
    name: "Empathic Concern",
    what: "Tune in to what others feel and let it move you to care about them.",
    tryIt: "In your next conversation, listen without planning your reply, then reflect back what you heard.",
  },
  {
    name: "Compassion",
    what: "Turn care into action: small, practical things that ease someone else's difficulty.",
    tryIt: "Do one small kind thing for someone today without being asked.",
  },
];
 
const STEPS = [
  { title: "Create your account", text: "Sign up with a username and email. It takes about a minute." },
  { title: "Complete a short check-in", text: "A few questions about how you are doing, plus a quick empathy quiz, so we can start from where you are." },
  { title: "Learn with the chatbot", text: "Talk through each skill with a friendly guide, read the lessons, and take quizzes at your own pace." },
  { title: "Watch yourself grow", text: "See your progress across all eight skills on your dashboard." },
];
 
const NAV = [
  { id: "about", label: "About" },
  { id: "skills", label: "Content" },
  { id: "how", label: "How it works" },
];
 
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);
  const skill = SKILLS[active];
 
  const goTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
 
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <style>{`
        @keyframes lp-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        .lp-float { animation: lp-float 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .lp-float { animation: none; } }
      `}</style>
 
      {/* ---------- Navbar ---------- *}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-indigo-700 text-lg" style={SERIF}>
            <img src={landing} alt="" className="w-8 h-8 object-contain" />
            EmpathyGuru
          </Link>
 
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => goTo(n.id)} className="hover:text-indigo-600 transition-colors">
                {n.label}
              </button>
            ))}
          </nav>
 
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              Log in
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all">
              Sign up
            </Link>
          </div>
 
          <button className="md:hidden p-2 text-gray-600" aria-label="Toggle menu" aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
 
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => goTo(n.id)}
                className="block w-full text-left text-gray-700 font-medium py-1">{n.label}</button>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/login" className="text-center py-2.5 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold text-sm">Log in</Link>
              <Link to="/register" className="text-center py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm">Sign up</Link>
            </div>
          </div>
        )}
      </header>
 
      {/* ---------- Hero ---------- *}
      <section className="pt-16 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight" style={SERIF}>
              Understand your feelings. Understand others.
            </h1>
            <p className="mt-5 text-lg text-indigo-100 max-w-xl mx-auto md:mx-0">
              EmpathyGuru is a learning platform where you build empathy skills and practise
              staying calm and in control of difficult emotions, one small step at a time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link to="/register"
                className="px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold shadow-xl hover:bg-indigo-50 transition-colors">
                Sign up
              </Link>
              <Link to="/login"
                className="px-8 py-3.5 rounded-xl border-2 border-white/70 text-white font-semibold hover:bg-white/10 transition-colors">
                Log in
              </Link>
            </div>
          </div>
 
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-white/15 rounded-full blur-2xl" aria-hidden="true" />
              <img src={landing} alt="Your friendly learning guide."
                className="lp-float relative w-56 h-56 md:w-80 md:h-80 object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>
 
      {/* ---------- About ---------- *}
      <section id="about" className="scroll-mt-16 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 max-w-2xl" style={SERIF}>
            A place to practise the skills that make hard moments easier
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl">
            Empathy is something you can learn and strengthen with practice. This platform guides you through
            it using conversation, short lessons and quizzes.
          </p>
 
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { t: "Talk it through", d: "Chat with an AI guide that explains each skill and helps you apply it to real situations from your own life." },
              { t: "Learn by doing", d: "Short lessons and quizzes turn ideas into habits you can use when you are stressed, angry or overwhelmed." },
              { t: "See your progress", d: "Your dashboard shows how you are developing across all eight skills, so you know what to work on next." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 p-6">
                <h3 className="text-lg font-bold text-indigo-700">{c.t}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-900 max-w-3xl">
            EmpathyGuru is a learning tool, not therapy or a replacement for a counsellor. If the
            check-in suggests you would be better supported by a person, we will point you to one first.
          </div>
        </div>
      </section>
 
      {/* ---------- Interactive skills ---------- *}
      <section id="skills" className="scroll-mt-16 py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={SERIF}>Eight skills, one step at a time</h2>
          <p className="mt-4 text-gray-600 max-w-2xl">
            The course follows the UNESCO SEEK framework. Pick a skill to see what it is and try a one-minute exercise.
          </p>
 
          <div className="mt-10 grid md:grid-cols-5 gap-6">
            <div role="tablist" aria-label="Empathy skills" className="md:col-span-2 flex flex-col gap-2">
              {SKILLS.map((s, i) => (
                <button key={s.name} role="tab" aria-selected={i === active} onClick={() => setActive(i)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    i === active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                  }`}>
                  {s.name}
                </button>
              ))}
            </div>
 
            <div role="tabpanel" className="md:col-span-3 bg-white rounded-3xl shadow-xl p-8 self-start">
              <h3 className="text-2xl font-bold text-indigo-700" style={SERIF}>{skill.name}</h3>
              <p className="mt-3 text-gray-600 leading-relaxed">{skill.what}</p>
              <div className="mt-6 rounded-2xl bg-purple-50 border border-purple-100 p-5">
                <p className="font-semibold text-purple-700 text-sm">Try this now</p>
                <p className="mt-1 text-gray-700">{skill.tryIt}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button onClick={() => setActive((active + 1) % SKILLS.length)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                  Next skill
                </button>
                <Link to="/register" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl transition-colors">
                  Learn this skill
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
 
      {/* ---------- How it works (a real sequence) ---------- *}
      <section id="how" className="scroll-mt-16 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={SERIF}>How it works</h2>
          <ol className="mt-10 grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border-2 border-gray-100 p-6">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm">{i + 1}</span>
                <h3 className="mt-4 font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
 
          
        </div>
      </section>
 
      {/* ---------- Final CTA ---------- *}
      <section className="bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white" style={SERIF}>Ready to begin?</h2>
          <p className="mt-3 text-indigo-100">Create an account, or log in to pick up where you left off.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold shadow-xl hover:bg-indigo-50 transition-colors">Sign up</Link>
            <Link to="/login" className="px-8 py-3.5 rounded-xl border-2 border-white/70 text-white font-semibold hover:bg-white/10 transition-colors">Log in</Link>
          </div>
        </div>
      </section>
 
      <footer className="py-8 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Empathy for Learning</p>
        <p className="mt-1">
          <a href="#" className="hover:text-gray-600 underline">Terms</a>
          {" "}and{" "}
          <a href="#" className="hover:text-gray-600 underline">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
}*/