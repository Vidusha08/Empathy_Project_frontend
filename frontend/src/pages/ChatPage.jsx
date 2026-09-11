//src/pages/ChatPage.jsx
import { useState, useCallback, useRef, useEffect } from "react";
import ChatWindow from "../components/chat/ChatWindow";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import { sendMessage } from "../api/chatApi";
import { completeObjective } from "../api/progressApi";
import { Mic, Send } from "lucide-react";

// Backend returns the student's full name at user.name (e.g. "Jane Doe").
// This pulls just the first token for the greeting store, falling back
// to username, then null.
function getFirstName(user) {
  if (user?.name) {
    const first = user.name.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return user?.username ?? null;
}

// Chat Input

function ChatInputArea({ onSend, isLoading }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  const submit = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="px-5 pb-4 pt-1">
      <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2.5 shadow-sm focus-within:border-indigo-300 transition-colors">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
          placeholder="Type a message…"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent leading-relaxed max-h-28 overflow-y-auto"
          style={{ minHeight: 24 }}
        />
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <Mic size={16} />
          </button>
          <button
            onClick={submit}
            disabled={!text.trim() || isLoading}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
              ${text.trim() && !isLoading
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Page

export default function ChatPage() {
  const user = useAuthStore((state) => state.user);
  const { messages, addMessage, isLoading, setLoading, setGreetingName } = useChatStore();

  const firstName = getFirstName(user);

  // Personalize the seeded greeting once the user's name is known
  // (it's created generically at store-init time, before login happens).
  useEffect(() => {
    if (firstName) setGreetingName(firstName);
  }, [firstName, setGreetingName]);

  const ts = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleSend = useCallback(async (text) => {
    addMessage({
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: ts(),
    });

    setLoading(true);

    try {
      const res = await sendMessage(text);

      addMessage({
        id:        Date.now() + 1,
        role:      "assistant",
        content:   res.message,
        timestamp: ts(),
        emotion:   res.emotion ?? "calm",
        status:    res.status,
        skill:     res.skill,
        topic:     res.topic,
        learningObjective: res.learningObjective,
        recommendedActivity: res.recommendedActivity,
        sourcePage: res.sourcePage,
        steps: res.steps,
        interactionId: res.interactionId,
      });
    } catch (err) {
      const isUnauth = err?.response?.status === 401;
      addMessage({
        id:        Date.now() + 1,
        role:      "assistant",
        content:   isUnauth
          ? "Your session has expired. Please log in again."
          : "I'm here to listen. It seems there was a connection issue. Please try again.",
        timestamp: ts(),
        emotion:   "calm",
      });
    } finally {
      setLoading(false);
    }
  }, [addMessage, setLoading]);

  const handleCompleteObjective = async (objectiveId, skillId) => {
    try {
      await completeObjective(objectiveId, skillId);
      addMessage({
        id: Date.now(),
        role: "assistant",
        content: "Objective marked as completed.",
        timestamp: ts(),
      });
    } catch {
      addMessage({
        id: Date.now(),
        role: "assistant",
        content: "I couldn't mark that objective as completed. Please try again.",
        timestamp: ts(),
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💬</span>
            <h1 className="text-xl font-bold text-gray-800">Chat With Your Empathy Buddy</h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 mx-5 mb-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onCompleteObjective={handleCompleteObjective}
          />
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          <ChatInputArea onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
