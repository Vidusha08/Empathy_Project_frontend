import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Heart, LoaderCircle, LogOut, Send, Sparkles, X } from "lucide-react";
import { sendGeneralEmpathyMessage, getLearningRecommendations } from "../api/generalEmpathyApi";
import { getSafetyStatus, submitSafetyScreening } from "../api/chatApi";
import SafetyGate from "../components/chat/SafetyGate";
import "./ChatPages.css";

const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi, I’m here to listen. What’s on your mind today?",
};

function getErrorMessage(error) {
  const status = error.response?.status;

  if (status === 401) {
    return "Your session may have expired. Please sign in again to continue.";
  }
  if (status === 403) {
    return "You don’t have access to this chat. Please check your account or contact support.";
  }
  if (status === 423) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Chatbot access is temporarily restricted."
    );
  }
  if (status === 429) {
    return "The chat service is busy right now. Please try again shortly.";
  }
  if (status >= 500 || error.message === "The chat service returned an empty response.") {
    return "I’m having trouble preparing a reply right now. Please try again in a moment.";
  }
  if (!error.response) {
    return "I can’t reach the chat service right now. Please check your connection and try again.";
  }
  return "I couldn’t send that message. Please try again.";
}

export default function GeneralEmpathyChatPage() {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [safetyStatus, setSafetyStatus] = useState(null);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screeningError, setScreeningError] = useState("");
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [recommendationError, setRecommendationError] = useState("");
  const [conversationFinished, setConversationFinished] = useState(false);
  const requestInFlight = useRef(false);
  const endOfMessagesRef = useRef(null);

  const hasUserMessages = messages.some((m) => m.role === "user");

  const handleOpenCompletion = () => {
    setCompletionModalOpen(true);
    setRecommendations(null);
    setRecommendationError("");
  };

  const handleFinishConversation = () => {
    setCompletionModalOpen(false);
    setRecommendations(null);
    setRecommendationError("");
    setConversationFinished(true);
  };

  const handleRestartConversation = () => {
    setMessages([welcomeMessage]);
    setHistory([]);
    setDraft("");
    setErrorMessage("");
    setCompletionModalOpen(false);
    setRecommendations(null);
    setRecommendationError("");
    setConversationFinished(false);
  };

  const handleExploreRecommendations = async () => {
    setIsRecommending(true);
    setRecommendationError("");
    try {
      const result = await getLearningRecommendations(history);
      if (result?.safety) {
        setCompletionModalOpen(false);
        setRecommendations(null);
        if (result.restrictionActive || result.screeningRequired) {
          setSafetyStatus({
            message: result.message,
            restriction_active: result.restrictionActive,
            screening_required: result.screeningRequired,
            restriction_expires_at: result.restrictionExpiresAt,
            counsellor_contacts: result.counsellorContacts,
            emergency_contacts: result.emergencyContacts,
            urgent_guidance: result.urgentGuidance,
          });
        }
        return;
      }
      setRecommendations(result?.recommendations || []);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 423) {
        setCompletionModalOpen(false);
        setRecommendations(null);
        const safetyPayload = error?.response?.data || {};
        setSafetyStatus({
          message: safetyPayload.message,
          error: safetyPayload.error,
          restriction_active: Boolean(safetyPayload.restriction_active),
          screening_required: Boolean(safetyPayload.screening_required),
          restriction_expires_at: safetyPayload.restriction_expires_at,
          counsellor_contacts: safetyPayload.counsellor_contacts,
          urgent_guidance: safetyPayload.urgent_guidance,
        });
        return;
      }
      setRecommendationError(
        error?.response?.data?.error ||
          "Unable to load learning recommendations right now. Please try again."
      );
    } finally {
      setIsRecommending(false);
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  useEffect(() => {
    let active = true;
    getSafetyStatus()
      .then((status) => {
        if (active && (status?.restriction_active || status?.screening_required)) {
          setSafetyStatus(status);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleSafetyScreening = async (answers) => {
    setScreeningLoading(true);
    setScreeningError("");
    try {
      const status = await submitSafetyScreening(answers);
      if (status?.access_restored) {
        setSafetyStatus(null);
      } else {
        setSafetyStatus(status);
      }
    } catch (error) {
      setScreeningError(
        error?.response?.data?.error || "The screening could not be saved. Please try again."
      );
    } finally {
      setScreeningLoading(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const message = draft.trim();

    if (!message) {
      setErrorMessage("Write a message before sending.");
      return;
    }
    if (requestInFlight.current) return;
    if (safetyStatus?.restriction_active) return;

    requestInFlight.current = true;
    setIsLoading(true);
    setErrorMessage("");

    const userMessage = { id: `${Date.now()}-user`, role: "user", content: message };
    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const result = await sendGeneralEmpathyMessage(message, history);

      if (result?.safety) {
        const assistantText = [result.message, result.urgentGuidance]
          .filter(Boolean)
          .join("\n\n");

        const assistantMessage = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: assistantText,
        };

        setMessages((currentMessages) => [...currentMessages, assistantMessage]);
        setHistory((currentHistory) => [
          ...currentHistory,
          { role: "user", content: message },
          { role: "assistant", content: assistantText },
        ]);
        setDraft("");

        if (result.restrictionActive || result.screeningRequired) {
          setSafetyStatus({
            message: result.message,
            restriction_active: result.restrictionActive,
            screening_required: result.screeningRequired,
            restriction_expires_at: result.restrictionExpiresAt,
            counsellor_contacts: result.counsellorContacts,
            emergency_contacts: result.emergencyContacts,
            urgent_guidance: result.urgentGuidance,
          });
        }
        return;
      }

      const responseText =
        typeof result === "string" ? result : result?.response || result?.message || "";
      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: responseText,
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
      setHistory((currentHistory) => [
        ...currentHistory,
        { role: "user", content: message },
        { role: "assistant", content: responseText },
      ]);
      setDraft("");
    } catch (error) {
      setMessages((currentMessages) =>
        currentMessages.filter((currentMessage) => currentMessage.id !== userMessage.id)
      );

      const status = error?.response?.status;
      if (status === 423) {
        const safetyPayload = error?.response?.data || {};
        setSafetyStatus({
          message: safetyPayload.message,
          error: safetyPayload.error,
          restriction_active: Boolean(safetyPayload.restriction_active),
          screening_required: Boolean(safetyPayload.screening_required),
          restriction_expires_at: safetyPayload.restriction_expires_at,
          counsellor_contacts: safetyPayload.counsellor_contacts,
          urgent_guidance: safetyPayload.urgent_guidance,
        });
        return;
      }

      setErrorMessage(getErrorMessage(error));
    } finally {
      requestInFlight.current = false;
      setIsLoading(false);
    }
  };

  return (
    <section className="chat-page chat-page--general mx-auto flex min-h-full w-full max-w-5xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
          <Heart size={21} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Empathy Chat</h1>
          <p className="mt-1 text-sm text-gray-600">
            A supportive space to talk things through.
          </p>
        </div>
      </header>

      <div className="chat-surface flex min-h-[440px] flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">General Empathy Support</p>
              <p className="text-xs text-gray-500">Here to listen, without judgment</p>
            </div>
          </div>
          {hasUserMessages && !conversationFinished && (
            <button
              type="button"
              onClick={handleOpenCompletion}
              data-testid="end-conversation-button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <LogOut size={13} className="text-gray-500" />
              <span>End Conversation</span>
            </button>
          )}
        </div>

        <div
          className="flex-1 space-y-4 overflow-y-auto px-3 py-5 sm:px-6"
          aria-live="polite"
          aria-label="Conversation"
        >
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                    isUser
                      ? "rounded-br-sm bg-indigo-600 text-white"
                      : "rounded-bl-sm border border-gray-100 bg-gray-50 text-gray-800"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start" role="status" aria-label="Assistant is responding">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                <LoaderCircle size={16} className="animate-spin text-indigo-600" />
                <span>Thinking…</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="border-t border-gray-100 px-3 py-3 sm:px-5 sm:py-4">
          {errorMessage && (
            <div
              className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
              role="alert"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <div>
                <p>{errorMessage}</p>
                {errorMessage.startsWith("Your session") && (
                  <Link className="mt-1 inline-block font-semibold underline" to="/login">
                    Sign in again
                  </Link>
                )}
              </div>
            </div>
          )}

          {conversationFinished ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs text-gray-600">
              <span>This conversation has finished. Thank you for sharing your thoughts today.</span>
              <button
                type="button"
                onClick={handleRestartConversation}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 font-medium text-white shadow-sm transition hover:bg-indigo-700"
              >
                Start New Chat
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <label htmlFor="general-empathy-message" className="sr-only">
                  Your message
                </label>
                <textarea
                  id="general-empathy-message"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Share what’s on your mind…"
                  rows={2}
                  disabled={isLoading || Boolean(safetyStatus?.restriction_active)}
                  className="max-h-36 min-h-12 flex-1 resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !draft.trim() || Boolean(safetyStatus?.restriction_active)}
                  aria-label={isLoading ? "Sending message" : "Send message"}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isLoading ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
              <p className="mt-2 text-center text-xs text-gray-400">
                Press Enter to send · Shift + Enter for a new line
              </p>
            </>
          )}
        </div>
      </div>

      {completionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completion-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xl transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles size={16} />
                </div>
                <h2 id="completion-modal-title" className="text-base font-semibold text-gray-900">
                  {recommendations !== null ? "Learning Opportunities" : "End Conversation"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCompletionModalOpen(false);
                  setRecommendations(null);
                  setRecommendationError("");
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {isRecommending ? (
              <div className="flex flex-col items-center justify-center py-8 text-center" role="status">
                <LoaderCircle size={28} className="animate-spin text-indigo-600 mb-3" />
                <p className="text-sm font-medium text-gray-800">Reviewing conversation themes…</p>
                <p className="text-xs text-gray-500 mt-1">Finding relevant SEEK learning opportunities for you</p>
              </div>
            ) : recommendations !== null ? (
              <div className="py-4 space-y-4">
                {recommendations.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-600">
                      Based on what you shared, here are learning areas from the SEEK curriculum that connect with your conversation:
                    </p>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.skill_id}
                          className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 transition"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                              {rec.skill_title}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs leading-5 text-gray-700">
                            {rec.relevance_explanation}
                          </p>
                          <p className="mt-2 text-[11px] leading-4 text-gray-500 italic">
                            {rec.learning_opportunity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm font-medium text-gray-800">No specific learning recommendations found.</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Thank you for taking time to reflect and talk things through today.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCompletionModalOpen(false);
                      setRecommendations(null);
                      setConversationFinished(true);
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Finish conversation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCompletionModalOpen(false);
                      setRecommendations(null);
                    }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-5 space-y-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Would you like to explore SEEK learning opportunities related to what you shared today, or finish this conversation?
                </p>

                {recommendationError && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="alert">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{recommendationError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleFinishConversation}
                    className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Finish Conversation
                  </button>
                  <button
                    type="button"
                    onClick={handleExploreRecommendations}
                    className="w-full sm:w-auto rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    Explore Learning Opportunities
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {safetyStatus && (
        <SafetyGate
          mode={safetyStatus.restriction_active ? "restricted" : "screening"}
          status={safetyStatus}
          onSubmit={handleSafetyScreening}
          loading={screeningLoading}
          error={screeningError}
        />
      )}
    </section>
  );
}
