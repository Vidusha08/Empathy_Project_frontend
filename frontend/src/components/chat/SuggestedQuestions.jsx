import { Sparkles } from "lucide-react";

export default function SuggestedQuestions({
  questions,
  isLoading,
  onSelect,
}) {
  const uniqueQuestions = [...new Set(
    (Array.isArray(questions) ? questions : [])
      .filter((question) => typeof question === "string" && question.trim())
      .map((question) => question.trim())
  )].slice(0, 4);

  if (isLoading || uniqueQuestions.length === 0) return null;

  return (
    <section
      aria-label="Suggested questions"
      className="flex justify-start px-4 py-3"
    >
      <div className="w-full sm:max-w-[72%]">
        <p className="suggested-questions-title mb-2 flex items-center gap-1.5 text-xs font-semibold">
          <Sparkles size={14} aria-hidden="true" />
          Suggested questions
        </p>
        <div className="flex flex-col gap-2">
          {uniqueQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onSelect?.(question)}
              className="chat-suggested-question-btn w-full max-w-full whitespace-normal break-words rounded-lg border backdrop-blur-xs px-3 py-2 text-left text-sm leading-5 transition-all hover:shadow-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--app-accent)]"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
