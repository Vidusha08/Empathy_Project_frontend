import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Heart, LoaderCircle, Send, Sparkles } from "lucide-react";
import { sendGeneralEmpathyMessage } from "../api/generalEmpathyApi";

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
  const requestInFlight = useRef(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  const handleSend = async (event) => {
    event.preventDefault();
    const message = draft.trim();

    if (!message) {
      setErrorMessage("Write a message before sending.");
      return;
    }
    if (requestInFlight.current) return;

    requestInFlight.current = true;
    setIsLoading(true);
    setErrorMessage("");

    const userMessage = { id: `${Date.now()}-user`, role: "user", content: message };
    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const response = await sendGeneralEmpathyMessage(message, history);
      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: response,
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
      setHistory((currentHistory) => [
        ...currentHistory,
        { role: "user", content: message },
        { role: "assistant", content: response },
      ]);
      setDraft("");
    } catch (error) {
      setMessages((currentMessages) =>
        currentMessages.filter((currentMessage) => currentMessage.id !== userMessage.id)
      );
      setErrorMessage(getErrorMessage(error));
    } finally {
      requestInFlight.current = false;
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-4 p-4 sm:p-6">
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

      <div className="flex min-h-[440px] flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">General Empathy Support</p>
            <p className="text-xs text-gray-500">Here to listen, without judgment</p>
          </div>
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
              disabled={isLoading}
              className="max-h-36 min-h-12 flex-1 resize-y rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              aria-label={isLoading ? "Sending message" : "Send message"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isLoading ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-gray-400">
            Press Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </div>
    </section>
  );
}
