//src/components/chat/chatMessage.jsx
import { useState } from "react";
import {
  Target,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Play,
} from "lucide-react";

export default function ChatMessage({ message, onCompleteObjective }) {
  const {
    role,
    content,
    timestamp,
    status,
    skill,
    learningObjective,
    recommendedActivity,
    sourcePage,
  } = message;

  const isUser = role === "user";

  const showLearningCard =
    !isUser && status === "learning_path_selected" && skill;

  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } px-4 py-2`}
    >
      <div
        className={`w-full max-w-[72%] ${
          isUser
            ? "flex justify-end"
            : "flex justify-start"
        }`}
      >
        <div
          className={`rounded-2xl shadow-sm ${
            isUser
              ? "bg-indigo-600 text-white rounded-br-sm px-4 py-3 max-w-full"
              : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm w-full"
          }`}
        >
          {/* ─────────────────────────────────────
              CHAT MESSAGE
          ───────────────────────────────────── */}
          <div className={isUser ? "" : "px-4 pt-4"}>
            <p className="text-sm leading-6 whitespace-pre-line">
              {content}
            </p>

            {timestamp && (
              <p
                className={`text-[10px] mt-2 ${
                  isUser
                    ? "text-indigo-200"
                    : "text-gray-400"
                }`}
              >
                {timestamp}
              </p>
            )}
          </div>

          {/* ─────────────────────────────────────
              LEARNING SECTION
          ───────────────────────────────────── */}
          {showLearningCard && (
            <div className="mt-4 border-t border-gray-100">
              
              {/* Skill header */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                    <Sparkles
                      size={16}
                      className="text-indigo-600"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-500">
                      Your learning path
                    </p>

                    <p className="text-sm font-semibold text-gray-800">
                      {skill.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setShowDetails((prev) => !prev)
                  }
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
                >
                  {showDetails ? "Hide" : "Details"}

                  {showDetails ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                </button>
              </div>

              {/* ─────────────────────────────────
                  DETAILS
              ───────────────────────────────── */}
              {showDetails && (
                <div className="px-4 pb-4 space-y-3">

                  {/* Learning Objective */}
                  {learningObjective?.title && (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          <Target
                            size={17}
                            className="text-indigo-600"
                          />
                        </div>

                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                            What you're learning
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {learningObjective.title}
                          </p>

                          {learningObjective.content && (
                            <p className="mt-1.5 text-xs leading-5 text-gray-600 line-clamp-3">
                              {learningObjective.content}
                            </p>
                          )}

                          {learningObjective.id && (
                            <button
                              onClick={() =>
                                onCompleteObjective(
                                  learningObjective.id,
                                  skill.id
                                )
                              }
                              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                            >
                              <CheckCircle2 size={14} />
                              Mark as completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recommended Activity */}
                  {recommendedActivity?.title && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          <Play
                            size={17}
                            className="text-emerald-600"
                          />
                        </div>

                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                            Try this
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {recommendedActivity.title}
                          </p>

                          {recommendedActivity.content && (
                            <p className="mt-1.5 text-xs leading-5 text-gray-600 line-clamp-3">
                              {recommendedActivity.content}
                            </p>
                          )}

                          <button
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                            onClick={() =>
                              alert(
                                `Activity: ${recommendedActivity.title}`
                              )
                            }
                          >
                            Start activity
                            <Play size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Source */}
                  {sourcePage && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <BookOpen
                        size={12}
                        className="text-gray-400"
                      />

                      <p className="text-[10px] text-gray-400">
                        SEEK guide · Page {sourcePage}
                      </p>
                    </div>
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
