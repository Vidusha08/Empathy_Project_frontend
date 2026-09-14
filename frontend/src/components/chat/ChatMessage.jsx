import {
  Check,
  CheckCircle2,
  Lightbulb,
  Play,
  Sparkles,
  X,
} from "lucide-react";

function ActionButton({ children, onClick, secondary = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={secondary
        ? "inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
        : "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"}
    >
      {children}
    </button>
  );
}

function StepContent({ step, skill }) {
  const skillTitle = skill?.title?.replace(/^Skill\s*\d+\s*:\s*/i, "").trim();

  if (step?.type === "objective" || step?.type === "explanation" || step?.type === "learning_objective") {
    return (
      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
            <Sparkles size={17} className="text-indigo-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-600">Let&apos;s explore</p>
            <h3 className="mt-1 text-sm font-semibold text-gray-900">{skillTitle || "A helpful skill"}</h3>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-white/80 p-3">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-indigo-600" />
            <p className="text-sm leading-6 text-gray-600">{step.content}</p>
          </div>
        </div>
      </div>
    );
  }

  if (step?.type === "activity") {
    return (
      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
            <Play size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">Try this</p>
            <h3 className="mt-1 text-sm font-semibold text-gray-900">{step.activity?.title || "Grounding Activity"}</h3>
          </div>
        </div>
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-700">{step.content}</p>
      </div>
    );
  }

  if (step?.type === "question" || step?.type === "practice_check") {
    const answerMatch = step.question?.match(/\bAnswer:\s*(true|false)\b/i);
    const question = answerMatch ? step.question.slice(0, answerMatch.index).trim() : step.question;

    return (
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-indigo-600" />
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Quick Check</p>
        </div>
        <p className="mt-4 text-sm font-medium leading-6 text-gray-800">{question}</p>
      </div>
    );
  }

  return step?.content ? (
    <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-700">{step.content}</p>
  ) : null;
}

export default function ChatMessage({ message, onFlowMessage }) {
  const { role, content, timestamp, flowAction, step, skill, flowHandled } = message;
  const isUser = role === "user";
  const emit = (text) => onFlowMessage?.(text, flowAction, message);

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[72%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-3 text-white shadow-sm">
          <p className="whitespace-pre-line text-sm leading-6">{content}</p>
          {timestamp && <p className="mt-2 text-[10px] text-indigo-200">{timestamp}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start px-4 py-2">
      <div className="w-full max-w-[72%] rounded-2xl rounded-bl-sm border border-gray-100 bg-white text-gray-800 shadow-sm">
        {content && <div className="px-4 pt-4"><p className="whitespace-pre-line text-sm leading-6 text-gray-700">{content}</p></div>}
        <div className="px-4 pb-4">
          <StepContent step={step} skill={skill} />

          {flowAction === "learn" && <p className="mt-4 text-sm font-medium text-gray-800">Would you like to learn a skill that could help with this?</p>}
          {flowAction === "learn" && (
            <div className="mt-4 flex gap-2">
              <ActionButton disabled={flowHandled} onClick={() => emit("Yes")}><Check size={14} />Yes</ActionButton>
              <ActionButton disabled={flowHandled} secondary onClick={() => emit("No")}><X size={14} />Not now</ActionButton>
            </div>
          )}

          {flowAction === "activity" && <p className="mt-4 text-sm font-medium text-gray-800">Would you like to try a short activity?</p>}
          {flowAction === "activity" && (
            <div className="mt-4 flex gap-2">
              <ActionButton disabled={flowHandled} onClick={() => emit("Yes")}><Check size={14} />Yes</ActionButton>
              <ActionButton disabled={flowHandled} secondary onClick={() => emit("No")}><X size={14} />Not now</ActionButton>
            </div>
          )}

          {flowAction === "complete" && (
            <ActionButton disabled={flowHandled} onClick={() => emit("I've completed it.")}><CheckCircle2 size={14} />I&apos;ve completed it</ActionButton>
          )}

          {flowAction === "practice" && (
            <div className="mt-4 flex gap-2">
              <ActionButton disabled={flowHandled} onClick={() => emit(step?.question_type === "yes_no" ? "Yes" : "True")}><Check size={14} />{step?.question_type === "yes_no" ? "Yes" : "True"}</ActionButton>
              <ActionButton disabled={flowHandled} secondary onClick={() => emit(step?.question_type === "yes_no" ? "No" : "False")}><X size={14} />{step?.question_type === "yes_no" ? "No" : "False"}</ActionButton>
            </div>
          )}

          {timestamp && <p className="mt-2 text-[10px] text-gray-400">{timestamp}</p>}
        </div>
      </div>
    </div>
  );
}
