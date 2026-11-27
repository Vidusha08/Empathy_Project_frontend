//src/components/chat/chatMessage.jsx
import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Lightbulb,
  Play,
  Sparkles,
  X,
} from "lucide-react";

function ActionButton({
  children,
  onClick,
  secondary = false,
  disabled = false,
  isChosen = false,
  hasChosen = false,
  isAnswer = false,
  variant,
  ariaLabel,
  buttonType = "button",
  className = "",
}) {
  let styleClasses = "";

  if (isChosen) {
    styleClasses = "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400 ring-offset-1";
  } else if (hasChosen) {
    styleClasses = "cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200";
  } else if (variant === "yes") {
    styleClasses = "chat-action-btn--yes bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-600 shadow-sm";
  } else if (variant === "no" || secondary) {
    styleClasses = "chat-action-btn--no bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm";
  } else if (isAnswer) {
    styleClasses = "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
  } else {
    styleClasses = "bg-indigo-600 text-white hover:bg-indigo-700";
  }

  return (
    <button
      type={buttonType}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`chat-action-btn inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold min-w-[76px] transition-all ${styleClasses} ${className}`}
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
    const hasTitle = Boolean(step.activity?.title && step.activity.title !== "No activity selected");
    const sectionTitle = hasTitle ? step.activity.title : "Reflection";
    const sectionBadge = hasTitle ? "Try this" : "Reflection";
    const scenario = step.activity?.scenario;

    return (
      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
            <Play size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">{sectionBadge}</p>
            <h3 className="mt-1 text-sm font-semibold text-gray-900">{sectionTitle}</h3>
          </div>
        </div>
        {scenario && (
          <div className="mt-3 rounded-lg border border-emerald-200/80 bg-white p-3 text-sm text-gray-800 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">Situation</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-800">{scenario}</p>
          </div>
        )}
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">{step.content}</p>
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

export default function ChatMessage({
  message,
  isLoading,
  onFlowMessage,
  selectedAnswers,
}) {
  const [activityResponse, setActivityResponse] = useState("");
  const [activityConfirmed, setActivityConfirmed] = useState(false);
  const [selectedActivityOption, setSelectedActivityOption] = useState(null);
  const { role, content, timestamp, flowAction, step, skill, flowHandled } = message;
  const isUser = role === "user";
  const selectedAnswer = selectedAnswers?.[message.id];
  const hasChosen = Boolean(selectedAnswer);
  const emit = (text, options) => onFlowMessage?.(text, flowAction, message, options);
  const normalizedQuestionType = String(step?.question_type ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2");
  const isYesNoQuestion = normalizedQuestionType === "yes_no" || normalizedQuestionType === "yesno";
  const isMultipleChoiceQuestion = normalizedQuestionType === "multiple_choice";
  const hasApprovedActivity = Boolean(step?.activity?.id);
  const hasScenarioOptions = Array.isArray(step?.activity?.options) && step.activity.options.length > 0;
  const activityMode = step?.activity?.interaction_type
    || (step?.activity?.type === "reflection" ? "reflective" : "practical");

  if (isUser) {
    return (
      <div className="flex justify-end px-3 sm:px-4 py-2">
        <div className="chat-bubble-user max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-br-xs px-4 py-3 text-white shadow-sm">
          <p className="whitespace-pre-line text-sm leading-relaxed">{content}</p>
          {timestamp && <p className="mt-1.5 text-[10px] text-indigo-100/90 text-right">{timestamp}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start items-start gap-2 sm:gap-2.5 px-3 sm:px-4 py-2">
      <div
        className="chat-ai-avatar flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xs mt-0.5"
        aria-hidden="true"
      >
        <Sparkles size={15} />
      </div>
      <div className="chat-bubble-ai w-full min-w-0 max-w-[86%] sm:max-w-[74%] rounded-2xl rounded-tl-xs backdrop-blur-md text-gray-800 shadow-sm overflow-hidden">
        {content && <div className="px-4 pt-4"><p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{content}</p></div>}
        <div className="px-4 pb-4">
          <StepContent step={step} skill={skill} />

          {flowAction === "learn" && <p className="mt-4 text-sm font-medium text-gray-800">Does this answer your question so far? Choose Yes to explore the learning objective, or No to ask for clarification.</p>}
          {flowAction === "understanding" && <p className="mt-4 text-sm font-medium text-gray-800">Does this explanation make sense so far? Choose Yes to continue, or No to ask for clarification.</p>}
          {(flowAction === "learn" || flowAction === "understanding") && (
            <div className="chat-choice-group mt-4 flex items-center gap-3">
              <ActionButton
                disabled={flowHandled || hasChosen || isLoading}
                isChosen={selectedAnswer === "Yes"}
                hasChosen={hasChosen}
                variant="yes"
                ariaLabel="Yes, continue"
                onClick={() => emit("Yes")}
              >
                <Check size={14} className="shrink-0" />Yes
              </ActionButton>
              <span className="sr-only"> </span>
              <ActionButton
                disabled={flowHandled || hasChosen || isLoading}
                secondary
                isChosen={selectedAnswer === "No"}
                hasChosen={hasChosen}
                variant="no"
                ariaLabel="No, ask for clarification"
                onClick={() => emit("No")}
              >
                <X size={14} className="shrink-0" />No
              </ActionButton>
            </div>
          )}

          {flowAction === "activity" && (
            <p className="mt-4 text-sm font-medium text-gray-800">
              {hasApprovedActivity
                ? hasScenarioOptions
                  ? "Read the scenario above and choose the response that shows the most empathy."
                  : activityMode === "practical"
                    ? "Try this short practice, then confirm when you've finished."
                    : activityMode === "combined"
                      ? "Complete the practice, then share a short reflection and confirm when you're finished."
                      : "Think about the prompt and share a short reflection."
                : "Think about the prompt and share a short reflection."}
            </p>
          )}
          {flowAction === "activity" && hasApprovedActivity && activityMode === "practical" && (
            hasScenarioOptions ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-col gap-2" role="group" aria-label="Activity choices">
                  {step.activity.options.map((opt) => {
                    const isOptSelected = selectedActivityOption === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={flowHandled || hasChosen || isLoading}
                        onClick={() => setSelectedActivityOption(opt.id)}
                        className={`flex items-start gap-2.5 rounded-lg border p-3 text-left text-xs transition-all ${
                          isOptSelected
                            ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-950 ring-1 ring-emerald-500"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                          isOptSelected ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}>
                          {opt.id}
                        </span>
                        <span className="leading-5">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedActivityOption && (
                  <div className={`rounded-lg p-3 text-xs leading-relaxed ${
                    selectedActivityOption === step.activity.best_answer
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border border-amber-200 bg-amber-50 text-amber-800"
                  }`}>
                    <p className="font-semibold">
                      {selectedActivityOption === step.activity.best_answer ? "✓ Best choice" : "Consider this:"}
                    </p>
                    <p className="mt-1">
                      {selectedActivityOption === step.activity.best_answer
                        ? (step.activity.feedback?.correct || step.activity.feedback?.[selectedActivityOption])
                        : (step.activity.feedback?.[selectedActivityOption] || step.activity.feedback?.correct)}
                    </p>
                  </div>
                )}

                <div className="pt-1">
                  <ActionButton
                    disabled={flowHandled || hasChosen || isLoading || !selectedActivityOption}
                    isChosen={hasChosen}
                    hasChosen={hasChosen}
                    isAnswer
                    onClick={() => {
                      const opt = step.activity.options.find((o) => o.id === selectedActivityOption);
                      emit(
                        `Option ${selectedActivityOption}: "${opt?.text || selectedActivityOption}"`,
                        {
                          activitySubmission: true,
                          activityConfirmation: true,
                          activityResponse: `Option ${selectedActivityOption}: "${opt?.text || selectedActivityOption}"`,
                        },
                      );
                    }}
                  >
                    <Check size={14} />I&apos;ve completed this activity
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <ActionButton
                  disabled={flowHandled || hasChosen || isLoading}
                  isChosen={hasChosen}
                  hasChosen={hasChosen}
                  isAnswer
                  onClick={() => emit(
                    "I've completed this activity.",
                    { activitySubmission: true, activityConfirmation: true },
                  )}
                >
                  <Check size={14} />I've completed this activity
                </ActionButton>
              </div>
            )
          )}
          {flowAction === "activity"
            && (
              (hasApprovedActivity && ["reflective", "combined"].includes(activityMode))
              || !hasApprovedActivity
            ) && (
              <form
                className="mt-4 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const response = activityResponse.trim();
                  if (!response || (activityMode === "combined" && !activityConfirmed)) return;
                  emit(response, {
                    activitySubmission: hasApprovedActivity,
                    activityResponse: response,
                    activityConfirmation: (activityMode === "combined" && activityConfirmed) || !hasApprovedActivity,
                  });
                }}
              >
                <label className="sr-only" htmlFor={`activity-response-${message.id}`}>
                  Your reflection
                </label>
                <textarea
                  id={`activity-response-${message.id}`}
                  value={activityResponse}
                  onChange={(event) => setActivityResponse(event.target.value)}
                  disabled={flowHandled || isLoading}
                  required={hasApprovedActivity}
                  rows={3}
                  maxLength={1000}
                  placeholder="Write a short reflection..."
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm leading-6 text-gray-700 focus:border-indigo-400 focus:outline-none"
                />
                {activityMode === "combined" && hasApprovedActivity && (
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={activityConfirmed}
                      onChange={(event) => setActivityConfirmed(event.target.checked)}
                      disabled={flowHandled || isLoading}
                    />
                    I&apos;ve completed the practice
                  </label>
                )}
                <div className="flex items-center gap-2">
                  <ActionButton
                    buttonType="submit"
                    disabled={flowHandled || isLoading || !activityResponse.trim() || (activityMode === "combined" && hasApprovedActivity && !activityConfirmed)}
                    isAnswer
                  >
                    <Check size={14} />Submit reflection
                  </ActionButton>
                  {!hasApprovedActivity && (
                    <ActionButton
                      disabled={flowHandled || hasChosen || isLoading}
                      secondary
                      variant="no"
                      onClick={() => emit("Continue to quick check")}
                    >
                      Continue
                    </ActionButton>
                  )}
                </div>
              </form>
            )}

          {flowAction === "complete" && (
            <ActionButton disabled={flowHandled || isLoading} onClick={() => emit("I've completed it.")}><CheckCircle2 size={14} />I&apos;ve completed it</ActionButton>
          )}

          {flowAction === "objective" && (
            <ActionButton disabled={flowHandled || isLoading} onClick={() => emit("Explore next objective")}>
              <Sparkles size={14} />Explore next objective
            </ActionButton>
          )}

          {flowAction === "practice" && (
            isMultipleChoiceQuestion ? (
              <div className="mt-4 flex flex-col gap-2" role="group" aria-label="Multiple-choice answer">
                {(Array.isArray(step?.options) ? step.options : []).map((option) => (
                  <ActionButton
                    key={option}
                    disabled={flowHandled || hasChosen || isLoading}
                    isChosen={selectedAnswer === option}
                    hasChosen={hasChosen}
                    isAnswer
                    onClick={() => emit(option)}
                  >
                    {option}
                  </ActionButton>
                ))}
              </div>
            ) : (
              <div className="chat-choice-group mt-4 flex items-center gap-3" role="group" aria-label={isYesNoQuestion ? "Yes or no answer" : "True or false answer"}>
                <ActionButton
                  disabled={flowHandled || hasChosen || isLoading}
                  isChosen={selectedAnswer === (isYesNoQuestion ? "Yes" : "True")}
                  hasChosen={hasChosen}
                  variant="yes"
                  ariaLabel={isYesNoQuestion ? "Answer Yes" : "Answer True"}
                  onClick={() => emit(isYesNoQuestion ? "Yes" : "True")}
                >
                  <Check size={14} className="shrink-0" />{isYesNoQuestion ? "Yes" : "True"}
                </ActionButton>
                <span className="sr-only"> </span>
                <ActionButton
                  disabled={flowHandled || hasChosen || isLoading}
                  secondary
                  isChosen={selectedAnswer === (isYesNoQuestion ? "No" : "False")}
                  hasChosen={hasChosen}
                  variant="no"
                  ariaLabel={isYesNoQuestion ? "Answer No" : "Answer False"}
                  onClick={() => emit(isYesNoQuestion ? "No" : "False")}
                >
                  <X size={14} className="shrink-0" />{isYesNoQuestion ? "No" : "False"}
                </ActionButton>
              </div>
            )
          )}

          {timestamp && <p className="mt-2 text-[10px] text-gray-400">{timestamp}</p>}
        </div>
      </div>
    </div>
  );
}
