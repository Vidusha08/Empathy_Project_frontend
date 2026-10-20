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

  if (uniqueQuestions.length === 0 && !isLoading) return null;

  return (
    <section
      aria-label="Suggested questions"
      className="flex flex-shrink-0 justify-end border-t border-gray-100 px-3 py-2 sm:px-5"
    >
      <div className="w-full sm:max-w-[85%]">
        <p className="mb-2 flex items-center justify-end gap-1.5 text-xs font-semibold text-indigo-700">
          <Sparkles size={14} aria-hidden="true" />
          Suggested questions
        </p>
        {uniqueQuestions.length === 0 ? (
          <p className="text-right text-xs text-gray-500" role="status">
            Updating suggestions…
          </p>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            {uniqueQuestions.map((question) => (
              <button
                key={question}
                type="button"
                disabled={isLoading}
                onClick={() => onSelect?.(question)}
                className="max-w-full rounded-full border border-indigo-100 bg-indigo-50 px-3 py-2 text-left text-xs text-indigo-800 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-[75%]"
              >
                {question}
              </button>
            ))}
          </div>
        )}
        {isLoading && uniqueQuestions.length > 0 && (
          <p className="mt-2 text-right text-xs text-gray-500" role="status">
            Updating suggestions…
          </p>
        )}
      </div>
    </section>
  );
}
