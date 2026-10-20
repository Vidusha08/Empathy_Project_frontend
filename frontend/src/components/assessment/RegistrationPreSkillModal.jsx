// src/components/assessment/RegistrationPreSkillModal.jsx
import { useState } from "react";
import { PRE_SKILL_NOTE, PRE_SKILL_QUESTIONS, QUESTIONS_PER_PAGE } from "../../utils/assessmentData";
import { Question, ModalShell, primaryBtn, ghostBtn, plainBtn } from "./TestParts";

const TOTAL_PAGES = Math.ceil(PRE_SKILL_QUESTIONS.length / QUESTIONS_PER_PAGE);

/**
 * Props
 *  onSubmit(answers) – answers = { q01: "a", ... }
 *  submitting, error – controlled by the registration page
 *  onCancel()        – back to the registration form
 */
export default function RegistrationPreSkillModal({ onSubmit, submitting, error, onCancel }) {
  const [page, setPage] = useState(-1); // -1 = intro / note screen
  const [answers, setAnswers] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const pageQuestions =
    page >= 0
      ? PRE_SKILL_QUESTIONS.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE)
      : [];
  const pageComplete = pageQuestions.every((q) => answers[q.id]);
  const isLast = page === TOTAL_PAGES - 1;

  const next = () => {
    if (page >= 0 && !pageComplete) { setShowErrors(true); return; }
    setShowErrors(false);
    if (isLast) { onSubmit(answers); return; }
    setPage((p) => p + 1);
  };

  const back = () => { setShowErrors(false); setPage((p) => Math.max(-1, p - 1)); };

  return (
    <ModalShell
      title="Pre-skill assessment"
      subtitle={page < 0 ? "Part 2 of 2" : `Part 2 of 2 · Page ${page + 1} of ${TOTAL_PAGES}`}
      progress={page < 0 ? 0 : ((page + 1) / TOTAL_PAGES) * 100}
      scrollKey={page}
      footer={
        <div className="space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={back} disabled={page < 0 || submitting} className={ghostBtn}>Back</button>
            <button type="button" onClick={onCancel} disabled={submitting} className={plainBtn}>Cancel registration</button>
            <button type="button" onClick={next} disabled={submitting} className={primaryBtn}>
              {submitting ? "Saving..." : page < 0 ? "Start" : isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      }
    >
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">{error}</div>
      )}

      {page < 0 ? (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-indigo-100 bg-indigo-50/50 p-4">
            <p className="text-sm font-semibold text-indigo-800 mb-1">Please note</p>
            <p className="text-sm text-gray-700 leading-relaxed">{PRE_SKILL_NOTE}</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            There are {PRE_SKILL_QUESTIONS.length} multiple-choice questions about empathy skills. Choose the one answer you think is best for each question. It takes about 2 minutes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pageQuestions.map((q, i) => (
            <Question
              key={q.id}
              stacked
              number={page * QUESTIONS_PER_PAGE + i + 1}
              text={q.text}
              options={q.options.map((o) => ({ value: o.id, label: o.label }))}
              value={answers[q.id] ?? null}
              onChange={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))}
              invalid={showErrors && !answers[q.id]}
            />
          ))}
        </div>
      )}
    </ModalShell>
  );
}