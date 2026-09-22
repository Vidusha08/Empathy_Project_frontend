//src/pages/ChatPage.jsx
import { useState, useRef, useEffect } from "react";
import ChatWindow from "../components/chat/ChatWindow";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import { sendMessage } from "../api/chatApi";
import { completeItem } from "../api/progressApi";
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
  const {
    messages,
    addMessage,
    markMessageHandled,
    isLoading,
    setLoading,
    setGreetingName,
  } = useChatStore();

  const firstName = getFirstName(user);

  // Personalize the seeded greeting once the user's name is known
  // (it's created generically at store-init time, before login happens).
  useEffect(() => {
    if (firstName) setGreetingName(firstName);
  }, [firstName, setGreetingName]);

  const ts = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const createId = () => Date.now() + Math.random();

  const addUserMessage = (content) => {
    addMessage({ id: createId(), role: "user", content, timestamp: ts() });
  };

  const addFlowStep = (step, flowAction, flowSteps, flowIndex, skill, content, context = {}) => {
    addMessage({
      id: createId(),
      role: "assistant",
      content,
      timestamp: ts(),
      skill,
      step,
      flowAction,
      flowIndex,
      learningSteps: flowSteps,
      recommendedActivity: context.recommendedActivity,
      learningObjective: context.learningObjective,
    });
  };

  const handleSend = async (text) => {
    addUserMessage(text);

    setLoading(true);

    try {
      const res = await sendMessage(text);
      const learningContext = res.learning_context || res;
      const skill = learningContext.skill;
      const learningObjective = learningContext.learning_objective || learningContext.learningObjective;
      const recommendedActivity = learningContext.recommended_activity || learningContext.recommendedActivity;
      const progressRecommendation = learningContext.progress_recommendation || learningContext.progressRecommendation;
      const steps = Array.isArray(res.steps) ? res.steps : [];

      const hasLearningFlow = steps.length > 0 && skill?.id;
      const firstStep = steps[0];

      addMessage({
        id:        createId(),
        role:      "assistant",
        content:   [res.message || learningContext.message || firstStep?.content, progressRecommendation]
          .filter(Boolean)
          .join("\n\n"),
        timestamp: ts(),
        emotion:   res.emotion ?? "calm",
        status:    res.status,
        skill,
        topic:     learningContext.topic,
        learningObjective,
        nextIncompleteObjective: learningContext.next_incomplete_objective || learningContext.nextIncompleteObjective,
        progressRecommendation,
        recommendedActivity,
        sourcePage: learningContext.source_page || learningContext.sourcePage,
        interactionId: res.interactionId,
        flowAction: hasLearningFlow ? "learn" : undefined,
        flowIndex: hasLearningFlow ? 0 : undefined,
        learningSteps: hasLearningFlow ? steps : undefined,
      });
    } catch (err) {
      const isUnauth = err?.response?.status === 401;
      addMessage({
        id:        createId(),
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
  };

  const handleFlowMessage = async (text, action, sourceMessage) => {
    if (!sourceMessage || sourceMessage.flowHandled) return;

    markMessageHandled(sourceMessage.id);
    addUserMessage(text);

    if (text === "No") {
      addMessage({
        id: createId(),
        role: "assistant",
        content: "That's okay. We can continue chatting whenever you're ready.",
        timestamp: ts(),
      });
      return;
    }

    const skillId = sourceMessage.skill?.id || sourceMessage.skill?.skill_id || sourceMessage.skill?.chapter_id;
    const itemId = sourceMessage.recommendedActivity?.id
      || sourceMessage.recommendedActivity?.item_id
      || sourceMessage.recommendedActivity?.activity_id;

    if (action === "complete" && skillId && itemId) {
      try {
        await completeItem(skillId, itemId);
      } catch (error) {
        addMessage({
          id: createId(),
          role: "assistant",
          content: error.message || "I could not save that completion yet.",
          timestamp: ts(),
        });
        return;
      }
    }

    const flowSteps = sourceMessage.learningSteps || [];
    const nextIndex = (sourceMessage.flowIndex ?? -1) + 1;
    const nextStep = flowSteps[nextIndex];

    if (!nextStep) {
      const answerMatch = sourceMessage.step?.question?.match(/\bAnswer:\s*(true|false)\b/i);
      const correctAnswer = sourceMessage.step?.correct_answer ?? (answerMatch ? answerMatch[1].toLowerCase() === "true" : undefined);
      const answer = text.toLowerCase() === "true";
      const result = correctAnswer === undefined || answer === correctAnswer;

      addMessage({
        id: createId(),
        role: "assistant",
        content: result
          ? "Correct! Great job. You've understood the main idea."
          : "Not quite. The correct answer is worth remembering, and we can keep practicing together.",
        timestamp: ts(),
      });
      return;
    }

    const nextAction = action === "learn"
      ? "activity"
      : action === "activity"
        ? "complete"
        : action === "complete"
          ? "practice"
          : undefined;
    const nextContent = nextAction === "activity"
      ? "Great. Let's explore something that may help."
      : nextAction === "complete"
        ? "Let's try a grounding activity."
        : nextAction === "practice"
          ? "Great! Let's check your understanding."
          : "Let's continue.";

    addFlowStep(
      nextStep,
      nextAction,
      flowSteps,
      nextIndex,
      sourceMessage.skill,
      nextContent,
      sourceMessage,
    );
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
            onFlowMessage={handleFlowMessage}
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
