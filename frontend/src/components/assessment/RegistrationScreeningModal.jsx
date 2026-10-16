// src/components/assessment/RegistrationScreeningModal.jsx
import { useState } from "react";
import {
  FREQUENCY_OPTIONS, FUNCTION_OPTIONS, PHQ9_ITEMS, PHQ9_FUNCTION_TEXT,
  GAD7_ITEMS, ASQ_ITEMS, ASQ_NOW_TEXT, YES_NO, CONTEXT_ITEMS,
  isNotSuitable,
} from "../../utils/screeningData";
import { Question, CrisisPanel, ModalShell, primaryBtn, ghostBtn, plainBtn } from "./TestParts";

const STEPS = ["intro", "phq9", "gad7", "asq", "context"];

const STEP_INFO = {
  phq9: { title: "Mood", sub: "Over the last 2 weeks, how often have you been bothered by the following?" },
  gad7: { title: "Worry and tension", sub: "Over the last 2 weeks, how often have you been bothered by the following?" },
  asq: { title: "Safety", sub: "These questions are about thoughts of harming yourself. Please answer honestly." },
  context: { title: "A little context", sub: "These are optional. Skip any you'd rather not answer." },
};

/**
 * Props
 *  onComplete(answers) – suitable: go on to the pre-skill popup
 *  onNotSuitable()     – not suitable: counseling info was shown, user pressed the button.
 *                        NOTHING is saved to the backend in this case.
 *  onCancel()          – back to the registration form
 */
export default function RegistrationScreeningModal({ onComplete, onNotSuitable, onCancel }) {
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [supportView, setSupportView] = useState(false);
  const [answers, setAnswers] = useState({
    phq9: Array(9).fill(null),
    functional: null,
    gad7: Array(7).fill(null),
    asq: Array(4).fill(null),
    asqNow: null,
    context: {},
  });

  const setItem = (key, index, value) =>
    setAnswers((p) => ({ ...p, [key]: p[key].map((v, i) => (i === index ? value : v)) }));
  const setField = (key, value) => setAnswers((p) => ({ ...p, [key]: value }));
  const setContext = (id, value) =>
    setAnswers((p) => ({ ...p, context: { ...p.context, [id]: value } }));

  const phqTotal = answers.phq9.reduce((a, v) => a + (v ?? 0), 0);
  const anyAsqYes = answers.asq.some((v) => v === true);

  const complete = {
    phq9: answers.phq9.every((v) => v !== null) && (phqTotal === 0 || answers.functional !== null),
    gad7: answers.gad7.every((v) => v !== null),
    asq: answers.asq.every((v) => v !== null) && (!anyAsqYes || answers.asqNow !== null),
    context: true,
  };

  const key = STEPS[step];

  const next = () => {
    if (key === "intro") {
      if (!consent) { setShowErrors(true); return; }
    } else if (!complete[key]) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);

    // All scored questions are done after the Safety step.
    // Not suitable -> show counseling support. No API call, no 2nd test.
    if (key === "asq" && isNotSuitable(answers)) {
      setSupportView(true);
      return;
    }

    if (key === "context") { onComplete(answers); return; }
    setStep((s) => s + 1);
  };

  const back = () => { setShowErrors(false); setStep((s) => Math.max(0, s - 1)); };

  // ---------- Counseling support view ----------
  if (supportView) {
    return (
      <ModalShell
        title="Support is available for you"
        scrollKey="support"
        footer={
          <button type="button" onClick={onNotSuitable} className={`${primaryBtn} w-full`}>
            Close
          </button>
        }
      >
        <p className="text-sm text-gray-600 leading-relaxed">
          Thank you for answering honestly. Based on your answers, we recommend that you speak with a
          counselor before using this learning program. You don't have to handle this alone.
          Please contact one of these services.
        </p>
        <CrisisPanel />
        <p className="text-sm text-gray-600 leading-relaxed">
          This is not a diagnosis or a judgement. It's about making sure you get the right kind of support.
          Your answers have not been saved and no account has been created.
        </p>
      </ModalShell>
    );
  }

  const lastLabel = key === "context" ? "Continue" : "Next";

  return (
    <ModalShell
      title="A few quick questions"
      subtitle={`Part 1 of 2 · Step ${step + 1} of ${STEPS.length}`}
      progress={(step / (STEPS.length - 1)) * 100}
      scrollKey={step}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={back} disabled={step === 0} className={ghostBtn}>Back</button>
          <button type="button" onClick={onCancel} className={plainBtn}>Cancel registration</button>
          <button type="button" onClick={next} className={primaryBtn}>{lastLabel}</button>
        </div>
      }
    >
      {key === "intro" && (
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-gray-800">Before you start learning</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            These questions help us make sure this program is the right fit for you. This is not a diagnosis. It takes about 3 minutes.
          </p>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
            <li>Your answers are stored separately from your account details.</li>
            <li>A counselor may see your results if your answers suggest you need extra support.</li>
            <li>There are no right or wrong answers. Honest answers help us support you better.</li>
          </ul>
          <div className={`rounded-xl p-4 border-2 ${showErrors && !consent ? "border-red-300 bg-red-50" : "border-indigo-100 bg-indigo-50/50"}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                className="w-5 h-5 mt-0.5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 shrink-0" />
              <span className="text-sm text-gray-700 leading-relaxed">
                I understand this is a screening and not a diagnosis, and I agree to my answers being stored and reviewed by program counselors.
              </span>
            </label>
            {showErrors && !consent && <p className="text-red-500 text-xs mt-2">⚠ Please agree to continue</p>}
          </div>
        </div>
      )}

      {key !== "intro" && (
        <div>
          <h3 className="text-lg font-bold text-gray-800">{STEP_INFO[key].title}</h3>
          <p className="text-sm text-gray-500 mt-1">{STEP_INFO[key].sub}</p>
        </div>
      )}

      {key === "phq9" && (
        <div className="space-y-3">
          {PHQ9_ITEMS.map((text, i) => (
            <Question key={i} number={i + 1} text={text} options={FREQUENCY_OPTIONS}
              value={answers.phq9[i]} onChange={(v) => setItem("phq9", i, v)}
              invalid={showErrors && answers.phq9[i] === null} />
          ))}
          {phqTotal > 0 && (
            <Question text={PHQ9_FUNCTION_TEXT} options={FUNCTION_OPTIONS}
              value={answers.functional} onChange={(v) => setField("functional", v)}
              invalid={showErrors && answers.functional === null} />
          )}
        </div>
      )}

      {key === "gad7" && (
        <div className="space-y-3">
          {GAD7_ITEMS.map((text, i) => (
            <Question key={i} number={i + 1} text={text} options={FREQUENCY_OPTIONS}
              value={answers.gad7[i]} onChange={(v) => setItem("gad7", i, v)}
              invalid={showErrors && answers.gad7[i] === null} />
          ))}
        </div>
      )}

      {key === "asq" && (
        <div className="space-y-3">
          {ASQ_ITEMS.map((text, i) => (
            <Question key={i} number={i + 1} text={text} options={YES_NO}
              value={answers.asq[i]} onChange={(v) => setItem("asq", i, v)}
              invalid={showErrors && answers.asq[i] === null} />
          ))}
          {anyAsqYes && (
            <Question text={ASQ_NOW_TEXT} options={YES_NO}
              value={answers.asqNow} onChange={(v) => setField("asqNow", v)}
              invalid={showErrors && answers.asqNow === null} />
          )}
        </div>
      )}

      {key === "context" && (
        <div className="space-y-3">
          {CONTEXT_ITEMS.map((q) => (
            <Question key={q.id} text={q.text} options={q.options}
              value={answers.context[q.id] ?? null}
              onChange={(v) => setContext(q.id, answers.context[q.id] === v ? null : v)} />
          ))}
        </div>
      )}
    </ModalShell>
  );
}