import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { getSkill } from "../api/contentApi";
import progressApi from "../api/progressApi";

const listOf = (value) => (Array.isArray(value) ? value : []);

const itemIdOf = (item) =>
  item?.item_id || item?.quiz_id || item?.id || item?.quizId;

const findQuiz = (skill, itemId) => {
  const objectives = listOf(skill?.objectives);
  return objectives
    .flatMap((objective) => listOf(objective?.items || objective?.learning_items))
    .find((item) => itemIdOf(item) === itemId && ["quiz", "assessment"].includes(item?.type || item?.item_type));
};

const answerOf = (question) =>
  question?.answer ?? question?.correct_answer ?? question?.correctAnswer;

function QuizPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const skillId = searchParams.get("skill") || location.state?.skillId;
  const itemId = searchParams.get("item") || itemIdOf(location.state?.quiz);
  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(!quiz && Boolean(skillId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (quiz || !skillId) return;

    let cancelled = false;
    async function loadQuiz() {
      try {
        const skill = await getSkill(skillId);
        const item = findQuiz(skill, itemId);
        if (!item) throw new Error("The requested quiz could not be found.");
        if (!cancelled) setQuiz(item);
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load this quiz.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadQuiz();
    return () => {
      cancelled = true;
    };
  }, [itemId, quiz, skillId]);

  const questions = useMemo(() => listOf(quiz?.questions), [quiz]);
  const quizId = itemIdOf(quiz) || itemId;

  const selectAnswer = (questionIndex, answer) => {
    setAnswers((current) => ({ ...current, [questionIndex]: answer }));
  };

  const submitQuiz = async (event) => {
    event.preventDefault();
    if (!questions.length || submitting) return;

    const correct = questions.reduce((count, question, index) =>
      count + (answers[index] === answerOf(question) ? 1 : 0), 0);
    const score = Math.round((correct / questions.length) * 100);
    setResult({ correct, total: questions.length, score, completed: false });
    setError("");

    if (score < 80) return;

    if (!skillId || !quizId) {
      setError("This quiz is missing a stable skill or item ID.");
      return;
    }

    try {
      setSubmitting(true);
      await progressApi.completeItem(skillId, quizId, "quiz", "skills_page", score);
      setResult((current) => ({ ...current, completed: true }));
    } catch (submitError) {
      setError(submitError?.data?.error || submitError.message || "Unable to save quiz progress.");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
    setError("");
  };

  if (loading) return <main className="p-6">Loading quiz...</main>;
  if (error && !quiz) return <main className="p-6"><p role="alert">{error}</p><Link to="/content">Back to content</Link></main>;
  if (!quiz) return <main className="p-6"><p role="alert">Quiz data is unavailable.</p><Link to="/content">Back to content</Link></main>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Link to="/content" className="text-indigo-600">← Back to content</Link>
      <h1 className="text-2xl font-bold mt-4">{quiz.title || "Quiz"}</h1>
      {quiz.description || quiz.content ? <p className="mt-2 text-gray-600">{quiz.description || quiz.content}</p> : null}

      {error && <p className="mt-4 text-red-600" role="alert">{error}</p>}

      {result && (
        <div className="mt-6 rounded-xl border p-4" role="status">
          <strong>Score: {result.score}% ({result.correct}/{result.total})</strong>
          {result.completed
            ? <p className="text-green-700 mt-1">Quiz completed and progress saved.</p>
            : result.score < 80
              ? <p className="text-amber-700 mt-1">You need at least 80% to complete this quiz.</p>
              : null}
        </div>
      )}

      {!result?.completed && (
        <form onSubmit={submitQuiz} className="mt-6 space-y-6">
          {questions.map((question, index) => (
            <fieldset key={question.question_id || index} className="rounded-xl border p-4">
              <legend className="font-semibold">{index + 1}. {question.question}</legend>
              <div className="mt-3 space-y-2">
                {listOf(question.options).map((option) => (
                  <label key={option} className="flex gap-2 items-center">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={answers[index] === option}
                      onChange={() => selectAnswer(index, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button type="submit" disabled={submitting || questions.some((_, index) => answers[index] === undefined)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">
            {submitting ? "Saving..." : "Submit quiz"}
          </button>
        </form>
      )}

      {result && !result.completed && result.score < 80 && (
        <button type="button" onClick={retry} className="mt-4 px-4 py-2 rounded-lg border">
          Retry quiz
        </button>
      )}
    </main>
  );
}

export default QuizPage;
