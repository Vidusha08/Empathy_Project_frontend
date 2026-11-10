import { useMemo, useState } from "react";
import {
  ASQ_ITEMS,
  ASQ_NOW_TEXT,
  CONTEXT_ITEMS,
  FREQUENCY_OPTIONS,
  FUNCTION_OPTIONS,
  GAD7_ITEMS,
  PHQ9_FUNCTION_TEXT,
  PHQ9_ITEMS,
  YES_NO,
} from "../../utils/screeningData";
import { CrisisPanel, ModalShell, Question, primaryBtn } from "../assessment/TestParts";

const initialAnswers = {
  phq9: Array(9).fill(null),
  functional: null,
  gad7: Array(7).fill(null),
  asq: Array(4).fill(null),
  asqNow: null,
  context: {},
};

function ContactList({ contacts }) {
  if (!contacts?.length) return null;
  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
      <p className="font-semibold text-indigo-900 text-sm mb-2">Counsellor support</p>
      {contacts.map((contact) => (
        <p key={`${contact.name}-${contact.contact}`} className="text-sm text-indigo-800">
          {contact.name}: {contact.contact}
        </p>
      ))}
    </div>
  );
}

export default function SafetyGate({ mode, status, onSubmit, loading, error }) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [showErrors, setShowErrors] = useState(false);
  const phqTotal = useMemo(
    () => answers.phq9.reduce((total, value) => total + (value ?? 0), 0),
    [answers.phq9],
  );
  const anyAsqYes = answers.asq.some((value) => value === true);
  const complete = answers.phq9.every((value) => value !== null)
    && (phqTotal === 0 || answers.functional !== null)
    && answers.gad7.every((value) => value !== null)
    && answers.asq.every((value) => value !== null)
    && (!anyAsqYes || answers.asqNow !== null);

  const setItem = (key, index, value) =>
    setAnswers((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  const setField = (key, value) => setAnswers((current) => ({ ...current, [key]: value }));
  const setContext = (key, value) =>
    setAnswers((current) => ({ ...current, context: { ...current.context, [key]: value } }));

  if (mode === "restricted") {
    return (
      <ModalShell title="Chat temporarily paused" scrollKey="restricted">
        <p className="text-gray-700 leading-relaxed">
          {status?.message || "Chat access is temporarily paused for your safety."}
        </p>
        {status?.restriction_expires_at && (
          <p className="text-sm text-gray-500">
            Access can be reviewed after {new Date(status.restriction_expires_at).toLocaleString()}.
          </p>
        )}
        <ContactList contacts={status?.counsellor_contacts} />
        <CrisisPanel />
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title="Screening required"
      subtitle="Complete this safety screening before chat access can be restored."
      scrollKey="screening"
      footer={(
        <button
          type="button"
          className={`${primaryBtn} w-full`}
          disabled={!complete || loading}
          onClick={() => {
            if (!complete) {
              setShowErrors(true);
              return;
            }
            onSubmit(answers);
          }}
        >
          {loading ? "Saving..." : "Submit screening"}
        </button>
      )}
    >
      <p className="text-sm text-gray-600">
        This is not a diagnosis. Answer honestly so the system can verify whether access may be restored.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="space-y-3">
        {PHQ9_ITEMS.map((text, index) => (
          <Question key={text} number={index + 1} text={text} options={FREQUENCY_OPTIONS}
            value={answers.phq9[index]} onChange={(value) => setItem("phq9", index, value)}
            invalid={showErrors && answers.phq9[index] === null} />
        ))}
        {phqTotal > 0 && (
          <Question text={PHQ9_FUNCTION_TEXT} options={FUNCTION_OPTIONS}
            value={answers.functional} onChange={(value) => setField("functional", value)}
            invalid={showErrors && answers.functional === null} />
        )}
        {GAD7_ITEMS.map((text, index) => (
          <Question key={text} number={index + 1} text={text} options={FREQUENCY_OPTIONS}
            value={answers.gad7[index]} onChange={(value) => setItem("gad7", index, value)}
            invalid={showErrors && answers.gad7[index] === null} />
        ))}
        {ASQ_ITEMS.map((text, index) => (
          <Question key={text} number={index + 1} text={text} options={YES_NO}
            value={answers.asq[index]} onChange={(value) => setItem("asq", index, value)}
            invalid={showErrors && answers.asq[index] === null} />
        ))}
        {anyAsqYes && (
          <Question text={ASQ_NOW_TEXT} options={YES_NO} value={answers.asqNow}
            onChange={(value) => setField("asqNow", value)}
            invalid={showErrors && answers.asqNow === null} />
        )}
        {CONTEXT_ITEMS.map((item) => (
          <Question key={item.id} text={item.text} options={item.options}
            value={answers.context[item.id] ?? null}
            onChange={(value) => setContext(item.id, value)} />
        ))}
      </div>
      <ContactList contacts={status?.counsellor_contacts} />
    </ModalShell>
  );
}
