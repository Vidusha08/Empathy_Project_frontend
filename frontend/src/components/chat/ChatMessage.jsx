import { useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Lightbulb,
  Play,
  Sparkles,
  X,
} from "lucide-react";

export default function ChatMessage({ message }) {
  const { role, content, timestamp, status, skill, steps } = message;
  const isUser = role === "user";
  const hasSteps = Array.isArray(steps) && steps.length > 0;
  const showLearningCard =
    !isUser && status === "learning_path_selected" && skill && hasSteps;
  const skillTitle = skill?.title?.replace(/^Skill\s*\d+\s*:\s*/i, "");

  const [currentStep, setCurrentStep] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState(null);
  const activeStep = hasSteps ? steps[currentStep] : null;
  const isLastStep = hasSteps && currentStep === steps.length - 1;
  const stepType = activeStep?.type;
  const questionAnswer = activeStep?.question?.match(
    /\bAnswer:\s*(true|false)\b/i
  );
  const questionText = questionAnswer
    ? activeStep.question.slice(0, questionAnswer.index).trim()
    : activeStep?.question;
  const correctAnswer =
    activeStep?.correct_answer ??
    (questionAnswer ? questionAnswer[1].toLowerCase() === "true" : undefined);
  const isCorrect =
    correctAnswer !== undefined && practiceAnswer === correctAnswer;
  const hasKnownAnswer = correctAnswer !== undefined;

  const handleContinue = () => {
    if (!isLastStep) setCurrentStep((previous) => previous + 1);
  };

  const handlePracticeAnswer = (answer) => {
    setPracticeAnswer(answer);
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} px-4 py-2`}
    >
      <div
        className={`w-full max-w-[72%] ${
          isUser ? "flex justify-end" : "flex justify-start"
        }`}
      >
        <div
          className={`rounded-2xl shadow-sm ${
            isUser
              ? "max-w-full rounded-br-sm bg-indigo-600 px-4 py-3 text-white"
              : "w-full rounded-bl-sm border border-gray-100 bg-white text-gray-800"
          }`}
        >
          <div className={isUser ? "" : "px-4 pt-4"}>
            {content && (
              <p className="whitespace-pre-line text-sm leading-6">{content}</p>
            )}

            {timestamp && (
              <p
                className={`mt-2 text-[10px] ${
                  isUser ? "text-indigo-200" : "text-gray-400"
                }`}
              >
                {timestamp}
              </p>
            )}
          </div>

          {showLearningCard && (
            <div className="mt-4 border-t border-gray-100 px-4 pb-4">
              <div className="flex items-center gap-2 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                  <Sparkles size={17} className="text-indigo-600" />
                </div>
                <p className="text-base font-semibold text-gray-800">
                  {skillTitle}
                </p>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500">
                  Step {currentStep + 1} of {steps.length}
                </p>
                <div className="ml-4 flex flex-1 gap-1.5">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full ${
                        index <= currentStep ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {(stepType === "answer" || stepType === "direct_answer") && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-sm leading-6 text-gray-700">
                    {activeStep.content}
                  </p>
                  <button
                    onClick={handleContinue}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Continue
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {(stepType === "objective" ||
                stepType === "explanation" ||
                stepType === "learning_objective") && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb
                      size={18}
                      className="mt-0.5 shrink-0 text-indigo-600"
                    />
                    <div>
                      <p className="text-xs font-semibold text-indigo-700">
                        What you're learning
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {activeStep.content}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    I understand
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {activeStep?.type === "activity" && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex items-start gap-2.5">
                    <Play
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <div>
                      <p className="text-xs font-semibold text-emerald-700">
                        Try this
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {activeStep.content}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 size={14} />
                    I've completed it
                  </button>
                </div>
              )}

              {(stepType === "question" || stepType === "practice_check") && (
                <div
                  className={`rounded-xl border p-4 ${
                    practiceAnswer !== null && isCorrect
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-amber-100 bg-amber-50/60"
                  }`}
                >
                  {practiceAnswer !== null && isCorrect ? (
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-emerald-700">
                          Correct!
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-700">
                          Well done. You understood the main idea.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-amber-700">
                        Quick Check
                      </p>
                      <p className="mt-3 text-sm font-medium leading-6 text-gray-800">
                        {questionText}
                      </p>
                      <div className="mt-4 flex gap-2">
                        {(activeStep.question_type === "true_false" ||
                          activeStep.question_type === "yes_no") && (
                          <>
                            <button
                              onClick={() => handlePracticeAnswer(true)}
                              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold ${
                                practiceAnswer === true
                                  ? "bg-emerald-600 text-white"
                                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <Check size={14} />
                              {activeStep.question_type === "yes_no"
                                ? "Yes"
                                : "True"}
                            </button>
                            <button
                              onClick={() => handlePracticeAnswer(false)}
                              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold ${
                                practiceAnswer === false
                                  ? "bg-red-500 text-white"
                                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <X size={14} />
                              {activeStep.question_type === "yes_no"
                                ? "No"
                                : "False"}
                            </button>
                          </>
                        )}
                      </div>
                      {practiceAnswer !== null && (
                        <p
                          className={`mt-3 text-xs font-medium ${
                            hasKnownAnswer ? "text-red-600" : "text-emerald-700"
                          }`}
                        >
                          {hasKnownAnswer
                            ? "Not quite. Try again."
                            : "Answer recorded. Well done for checking your understanding."}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
