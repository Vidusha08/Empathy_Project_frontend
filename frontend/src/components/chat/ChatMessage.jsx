import { useState } from "react";
import {
  Check,
  CheckCircle2,
  Lightbulb,
  Play,
  Sparkles,
  X,
} from "lucide-react";

export default function ChatMessage({ message, onFlowMessage }) {
  const {
    role,
    content,
    timestamp,
    status,
    skill,
    steps,
  } = message;

  const isUser = role === "user";

  const hasSteps =
    Array.isArray(steps) && steps.length > 0;

  const showLearningFlow =
    !isUser &&
    status === "learning_path_selected" &&
    skill &&
    hasSteps;

  const skillTitle =
    skill?.title?.replace(
      /^Skill\s*\d+\s*:\s*/i,
      ""
    );

  // ---------------------------------------------------------
  // Learning flow state
  // ---------------------------------------------------------

  const [currentStep, setCurrentStep] = useState(0);

  const [learningChoice, setLearningChoice] =
    useState(null);

  const [activityChoice, setActivityChoice] =
    useState(null);

  const [activityCompleted, setActivityCompleted] =
    useState(false);

  const [practiceAnswer, setPracticeAnswer] =
    useState(null);

  const [finished, setFinished] =
    useState(false);

  // ---------------------------------------------------------
  // Current backend step
  // ---------------------------------------------------------

  const activeStep =
    hasSteps ? steps[currentStep] : null;

  const stepType =
    activeStep?.type;

  // ---------------------------------------------------------
  // Practice question
  // ---------------------------------------------------------

  const questionAnswer =
    activeStep?.question?.match(
      /\bAnswer:\s*(true|false)\b/i
    );

  const questionText =
    questionAnswer
      ? activeStep.question
          .slice(
            0,
            questionAnswer.index
          )
          .trim()
      : activeStep?.question;

  const correctAnswer =
    activeStep?.correct_answer ??
    (
      questionAnswer
        ? questionAnswer[1]
            .toLowerCase() === "true"
        : undefined
    );

  const isCorrect =
    correctAnswer !== undefined &&
    practiceAnswer === correctAnswer;

  const hasKnownAnswer =
    correctAnswer !== undefined;

  // ---------------------------------------------------------
  // Helper: tell parent about chat event
  // ---------------------------------------------------------

  const sendFlowMessage = (
    messageText,
    messageType = "user"
  ) => {
    if (typeof onFlowMessage === "function") {
      onFlowMessage({
        role: messageType,
        content: messageText,
        timestamp: new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
      });
    }
  };

  // ---------------------------------------------------------
  // YES - Learn skill
  // ---------------------------------------------------------

  const handleLearningYes = () => {
    setLearningChoice(true);

    // Add user's choice to chat
    sendFlowMessage(
      "Yes",
      "user"
    );

    // Move to learning objective
    setTimeout(() => {
      if (
        currentStep <
        steps.length - 1
      ) {
        setCurrentStep(
          (previous) =>
            previous + 1
        );
      }
    }, 200);
  };

  // ---------------------------------------------------------
  // NO - Learn skill
  // ---------------------------------------------------------

  const handleLearningNo = () => {
    setLearningChoice(false);

    // Add user's choice to chat
    sendFlowMessage(
      "No",
      "user"
    );

    // End learning flow
    setFinished(true);
  };

  // ---------------------------------------------------------
  // YES - Try activity
  // ---------------------------------------------------------

  const handleActivityYes = () => {
    setActivityChoice(true);

    sendFlowMessage(
      "Yes",
      "user"
    );

    // Move to activity
    setTimeout(() => {
      if (
        currentStep <
        steps.length - 1
      ) {
        setCurrentStep(
          (previous) =>
            previous + 1
        );
      }
    }, 200);
  };

  // ---------------------------------------------------------
  // NO - Try activity
  // ---------------------------------------------------------

  const handleActivityNo = () => {
    setActivityChoice(false);

    sendFlowMessage(
      "No",
      "user"
    );

    setFinished(true);
  };

  // ---------------------------------------------------------
  // Activity completed
  // ---------------------------------------------------------

  const handleActivityComplete = () => {
    setActivityCompleted(true);

    sendFlowMessage(
      "I've completed it",
      "user"
    );

    // Move to practice check
    setTimeout(() => {
      if (
        currentStep <
        steps.length - 1
      ) {
        setCurrentStep(
          (previous) =>
            previous + 1
        );
      }
    }, 200);
  };

  // ---------------------------------------------------------
  // Practice answer
  // ---------------------------------------------------------

  const handlePracticeAnswer = (
    answer
  ) => {
    setPracticeAnswer(answer);

    sendFlowMessage(
      answer === true
        ? activeStep?.question_type ===
          "yes_no"
          ? "Yes"
          : "True"
        : activeStep?.question_type ===
          "yes_no"
        ? "No"
        : "False",
      "user"
    );
  };

  // ---------------------------------------------------------
  // Normal USER message
  // ---------------------------------------------------------

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[72%]">
          <div className="rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-3 text-white shadow-sm">
            <p className="whitespace-pre-line text-sm leading-6">
              {content}
            </p>

            {timestamp && (
              <p className="mt-2 text-[10px] text-indigo-200">
                {timestamp}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // NORMAL AI MESSAGE
  // ---------------------------------------------------------

  return (
    <div className="flex justify-start px-4 py-2">
      <div className="w-full max-w-[72%]">
        <div className="rounded-2xl rounded-bl-sm border border-gray-100 bg-white text-gray-800 shadow-sm">

          {/* -------------------------------------------------
              Main AI response
          -------------------------------------------------- */}

          <div className="px-4 pt-4">
            {content && (
              <p className="whitespace-pre-line text-sm leading-6">
                {content}
              </p>
            )}

            {timestamp && (
              <p className="mt-2 text-[10px] text-gray-400">
                {timestamp}
              </p>
            )}
          </div>

          {/* -------------------------------------------------
              CHAT-WISE LEARNING FLOW
          -------------------------------------------------- */}

          {showLearningFlow &&
            !finished && (
              <div className="mt-4 border-t border-gray-100 px-4 pb-4">

                {/* =================================================
                    STEP 1
                    DIRECT ANSWER + LEARNING INVITATION
                ================================================== */}

                {(stepType === "answer" ||
                  stepType ===
                    "direct_answer") && (
                  <div className="mt-4">

                    {/* Skill header */}
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                        <Sparkles
                          size={17}
                          className="text-indigo-600"
                        />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Suggested skill
                        </p>

                        <p className="text-sm font-semibold text-gray-800">
                          {skillTitle}
                        </p>
                      </div>
                    </div>

                    {/* Direct answer */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                      <p className="text-sm leading-6 text-gray-700">
                        {activeStep.content}
                      </p>
                    </div>

                    {/* Invitation */}
                    {learningChoice === null && (
                      <div className="mt-4 rounded-xl bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-800">
                          Would you like to learn a skill that can help with this?
                        </p>

                        <div className="mt-3 flex gap-2">

                          <button
                            onClick={
                              handleLearningYes
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                          >
                            <Check
                              size={14}
                            />
                            Yes
                          </button>

                          <button
                            onClick={
                              handleLearningNo
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            <X
                              size={14}
                            />
                            No
                          </button>

                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* =================================================
                    STEP 2
                    LEARNING OBJECTIVE
                ================================================== */}

                {(stepType ===
                  "objective" ||
                  stepType ===
                    "explanation" ||
                  stepType ===
                    "learning_objective") &&
                  learningChoice === true && (
                    <div className="mt-4">

                      <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">

                        <div className="flex items-start gap-3">

                          <div className="mt-0.5">
                            <Lightbulb
                              size={19}
                              className="text-indigo-600"
                            />
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-indigo-700">
                              {skillTitle}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-700">
                              {activeStep.content}
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Activity invitation */}
                      {activityChoice === null && (
                        <div className="mt-4 rounded-xl bg-gray-50 p-4">

                          <p className="text-sm font-semibold text-gray-800">
                            Would you like to try a short activity?
                          </p>

                          <div className="mt-3 flex gap-2">

                            <button
                              onClick={
                                handleActivityYes
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                            >
                              <Check
                                size={14}
                              />
                              Yes
                            </button>

                            <button
                              onClick={
                                handleActivityNo
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                              <X
                                size={14}
                              />
                              No
                            </button>

                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* =================================================
                    STEP 3
                    ACTIVITY
                ================================================== */}

                {stepType ===
                  "activity" &&
                  learningChoice === true &&
                  activityChoice === true && (
                    <div className="mt-4">

                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">

                        <div className="flex items-start gap-3">

                          <Play
                            size={19}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />

                          <div>
                            <p className="text-xs font-semibold text-emerald-700">
                              Try this activity
                            </p>

                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                              {activeStep.content}
                            </p>
                          </div>

                        </div>

                        {!activityCompleted && (
                          <button
                            onClick={
                              handleActivityComplete
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                          >
                            <CheckCircle2
                              size={14}
                            />
                            I've completed it
                          </button>
                        )}

                        {activityCompleted && (
                          <div className="mt-4 rounded-lg bg-white p-3">
                            <p className="text-xs font-semibold text-emerald-700">
                              Activity completed!
                            </p>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                {/* =================================================
                    STEP 4
                    PRACTICE CHECK
                ================================================== */}

                {(stepType ===
                  "question" ||
                  stepType ===
                    "practice_check") &&
                  learningChoice === true &&
                  activityChoice === true &&
                  activityCompleted && (
                    <div className="mt-4">

                      <div
                        className={`rounded-xl border p-4 ${
                          practiceAnswer !==
                            null &&
                          isCorrect
                            ? "border-emerald-100 bg-emerald-50/60"
                            : "border-amber-100 bg-amber-50/60"
                        }`}
                      >

                        {practiceAnswer !==
                          null &&
                        isCorrect ? (
                          /* -----------------------------
                             CORRECT
                          ------------------------------ */
                          <div className="flex items-start gap-3">

                            <CheckCircle2
                              size={21}
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
                          /* -----------------------------
                             QUESTION
                          ------------------------------ */
                          <>
                            <p className="text-xs font-semibold text-amber-700">
                              Quick Check
                            </p>

                            <p className="mt-3 text-sm font-medium leading-6 text-gray-800">
                              {questionText}
                            </p>

                            <div className="mt-4 flex gap-2">

                              {(
                                activeStep.question_type ===
                                  "true_false" ||
                                activeStep.question_type ===
                                  "yes_no"
                              ) && (
                                <>
                                  {/* TRUE / YES */}
                                  <button
                                    onClick={() =>
                                      handlePracticeAnswer(
                                        true
                                      )
                                    }
                                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                                      practiceAnswer ===
                                      true
                                        ? "bg-emerald-600 text-white"
                                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <Check
                                      size={14}
                                    />

                                    {activeStep.question_type ===
                                    "yes_no"
                                      ? "Yes"
                                      : "True"}
                                  </button>

                                  {/* FALSE / NO */}
                                  <button
                                    onClick={() =>
                                      handlePracticeAnswer(
                                        false
                                      )
                                    }
                                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                                      practiceAnswer ===
                                      false
                                        ? "bg-red-500 text-white"
                                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <X
                                      size={14}
                                    />

                                    {activeStep.question_type ===
                                    "yes_no"
                                      ? "No"
                                      : "False"}
                                  </button>
                                </>
                              )}

                            </div>

                            {/* Answer feedback */}
                            {practiceAnswer !==
                              null && (
                              <p
                                className={`mt-3 text-xs font-medium ${
                                  hasKnownAnswer
                                    ? isCorrect
                                      ? "text-emerald-700"
                                      : "text-red-600"
                                    : "text-emerald-700"
                                }`}
                              >
                                {hasKnownAnswer
                                  ? isCorrect
                                    ? "Correct! Great job."
                                    : "Not quite. Try again."
                                  : "Answer recorded. Well done for checking your understanding."}
                              </p>
                            )}
                          </>
                        )}

                      </div>
                    </div>
                  )}

              </div>
            )}

          {/* -------------------------------------------------
              Learning flow ended
          -------------------------------------------------- */}

          {showLearningFlow &&
            finished && (
              <div className="mt-4 border-t border-gray-100 px-4 pb-4">
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    No problem. We can continue chatting whenever you're ready.
                  </p>
                </div>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}
