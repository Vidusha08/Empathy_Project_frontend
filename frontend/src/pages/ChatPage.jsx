//src/pages/ChatPage.jsx
import { useState, useRef, useEffect } from "react";
import ChatWindow from "../components/chat/ChatWindow";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import { sendMessage } from "../api/chatApi";
import { completeItem, completeObjective, getProgress } from "../api/progressApi";
import { getSkill, getSkills } from "../api/contentApi";
import { findNextObjective, idOf, titleOf } from "../utils/nextObjective";
import { verifyQuickCheckAnswer } from "../utils/quickCheck";
import { Mic, Send } from "lucide-react";

// Backend returns the student's full name at user.name (e.g. "Jane Doe").
// This pulls just the first token for the greeting store, falling back
// to username, then null.
function getFirstName(user) {
  if (user?.name) {
    const first = user.name.trim().split(/\s+/)[0];
    if (first) return first;
  } 
}

function fallbackObjectiveQuestions(objective) {
  const items = Array.isArray(objective?.items) ? objective.items : [];
  const source = items.find((item) => typeof item?.content === "string" && item.content.trim());
  const title = titleOf(objective);
  const topic = (source?.title || source?.content || objective?.content || title || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)[0]
    .slice(0, 72)
    .replace(/[.,;:]$/, "");
  if (!topic) return [];

  const objectiveTitle = title || topic;
  return [
    `What does the approved SEEK content say about ${topic}?`,
    `How does ${topic} relate to ${objectiveTitle}?`,
    `Which part of ${objectiveTitle} would you like to understand better?`,
  ];
}

// Chat Input 

function ChatInputArea({ onSend, isLoading, disabled, answerStyle, onAnswerStyleChange }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  const submit = () => {
    if (!text.trim() || isLoading) return;
    onSend(text.trim(), answerStyle);
    setText("");
  };

  return (
    <div className="px-5 pb-4 pt-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-gray-500">Response style:</span>
        <div className="flex rounded-lg bg-gray-100 p-0.5" role="group" aria-label="Response style">
          {[
            { value: "short", label: "Short" },
            { value: "long", label: "Long" },
          ].map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onAnswerStyleChange(style.value)}
              aria-pressed={answerStyle === style.value}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                answerStyle === style.value
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
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
          disabled={isLoading || disabled}
          className="flex-1 resize-none outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent leading-relaxed max-h-28 overflow-y-auto"
          style={{ minHeight: 24 }}
        />
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <Mic size={16} />
          </button>
          <button
            onClick={submit}
            disabled={!text.trim() || isLoading || disabled}
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
  const [answerStyle, setAnswerStyle] = useState("short");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const recommendationKeys = useRef(new Set());
  const activityCompletionInFlight = useRef(new Set());
  const requestInFlight = useRef(false);
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

  const addLearningResponse = (res, introduction = "") => {
    const learningContext = res.learning_context || res;
    const skill = learningContext.skill;
    const learningObjective = learningContext.learning_objective
      || learningContext.learningObjective;
    const recommendedActivity = learningContext.recommended_activity
      || learningContext.recommendedActivity
      || res.recommendedActivity
      || null;
    const progressRecommendation = learningContext.progress_recommendation
      || learningContext.progressRecommendation;
    const steps = Array.isArray(res.steps) ? res.steps : [];
    const hasLearningFlow = steps.length > 0 && skill?.id;

    addMessage({
      id: createId(),
      role: "assistant",
      content: [
        introduction,
        res.message || steps[0]?.content || learningContext.message,
      ].filter(Boolean).join("\n\n"),
      timestamp: ts(),
      emotion: res.emotion ?? "calm",
      status: res.status,
      skill,
      topic: learningContext.topic,
      learningObjective,
      nextIncompleteObjective: learningContext.next_incomplete_objective
        || learningContext.nextIncompleteObjective,
      progressRecommendation,
      recommendedActivity,
      progressItemId: recommendedActivity?.progress_item_id
        ?? res.progressItemId
        ?? null,
      progressObjectiveId: recommendedActivity?.progress_objective_id
        ?? res.progressObjectiveId
        ?? null,
      progressItemType: recommendedActivity?.progress_item_type
        ?? res.progressItemType
        ?? null,
      sourcePage: learningContext.source_page || learningContext.sourcePage,
      interactionId: res.interactionId,
      flowAction: hasLearningFlow ? "learn" : undefined,
      flowIndex: hasLearningFlow ? 0 : undefined,
      learningSteps: hasLearningFlow ? steps : undefined,
    });

    return learningObjective;
  };

  const getNextObjective = async (sourceMessage) => {
    const currentSkillId = sourceMessage.skill?.id
      || sourceMessage.skill?.skill_id
      || sourceMessage.skill?.chapter_id;
    if (!currentSkillId) return null;

    const currentSkill = await getSkill(currentSkillId);
    const currentObjectiveId = idOf(sourceMessage.learningObjective);
    const currentSkillWithContext = { ...currentSkill, currentObjective: { id: currentObjectiveId } };
    const currentProgress = await getProgress(currentSkillId);
    const objectiveProgress = currentProgress?.skill?.objectives?.find(
      (objective) => idOf(objective) === currentObjectiveId,
    );
    const missingRequiredItemIds = objectiveProgress?.missing_required_item_ids;
    if (!currentObjectiveId || objectiveProgress?.completed !== true) {
      const objective = currentSkill.objectives?.find(
        (item) => idOf(item) === currentObjectiveId,
      );
      const incompleteItems = Array.isArray(missingRequiredItemIds)
        ? missingRequiredItemIds.map((itemId) => {
          const item = objective?.items?.find(
            (candidate) => candidate.item_id === itemId,
          );
          const type = item?.type || "learning item";
          const actionByType = {
            text: "open and complete the lesson",
            activity: "complete the activity",
            practice: "complete the activity",
            video: "watch the video",
            reflection: "complete the reflection",
          };
          return {
            id: itemId,
            title: item?.title || item?.question || itemId,
            instruction: actionByType[type] || "complete this learning item",
            type,
          };
        })
        : [];
      return {
        objectiveCompleted: false,
        incompleteItems,
        objective,
        objectiveProgress,
      };
    }

    const skills = (await getSkills())
      .sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
    const currentIndex = skills.findIndex((skill) => idOf(skill) === currentSkillId);
    const nextSkills = [];
    for (const skill of skills.slice(currentIndex + 1)) {
      const skillId = idOf(skill);
      if (!skillId) continue;
      try {
        const [detail, progress] = await Promise.all([getSkill(skillId), getProgress(skillId)]);
        nextSkills.push({ ...detail, progress });
      } catch (error) {
        console.warn(`[chatbot-next-objective] unable to load skill "${skillId}"`, error);
      }
    }

    return {
      objectiveCompleted: true,
      ...findNextObjective(currentSkillWithContext, currentProgress, nextSkills),
    };
  };

  const recommendNextObjective = async (sourceMessage, answerWasCorrect) => {
    const recommendationKey = `${sourceMessage.id}:${sourceMessage.learningObjective?.id || sourceMessage.learningObjective?.objective_id || "objective"}`;
    if (recommendationKeys.current.has(recommendationKey)) return;
    recommendationKeys.current.add(recommendationKey);

    const feedback = answerWasCorrect === null
      ? "Your saved progress has been updated."
      : answerWasCorrect
        ? "Correct! Good work checking your understanding."
        : "Not quite. Review the learning guidance below and keep practising.";

    requestInFlight.current = true;
    setLoading(true);
    setSuggestedQuestions((current) => answerWasCorrect === null
      ? []
      : current.length
        ? current
        : fallbackObjectiveQuestions(sourceMessage.learningObjective));

    try {
      const recommendation = await getNextObjective(sourceMessage);
      if (!recommendation?.objectiveCompleted) {
        const objective = recommendation?.objective
          || sourceMessage.learningObjective;
        const objectiveTitle = titleOf(objective)
          || titleOf(sourceMessage.learningObjective)
          || "This learning objective";
        const objectiveItems = Array.isArray(objective?.items) ? objective.items : [];
        const activityMissing = recommendation?.objectiveProgress?.activity_completed !== true;
        const activity = activityMissing && objectiveItems.find(
          (item) => ["activity", "practice"].includes(item.type),
        );
        const itemTitle = activity?.title
          || activity?.item_id
          || "the remaining required learning item";
        const nextStepText = activity
          ? `Next, complete the approved activity "${itemTitle}".`
          : "Saved progress still shows this objective as incomplete. Continue with its remaining learning items.";
        const requiredActivity = activity
          ? {
            ...activity,
            progress_item_id: activity.item_id,
            progress_item_type: activity.type,
            progress_objective_id: idOf(objective),
          }
          : null;
        addMessage({
          id: createId(),
          role: "assistant",
          content: `${feedback} "${objectiveTitle}" is not complete yet. ${nextStepText}${activity?.content ? `\n\n${activity.content}` : ""}`,
          timestamp: ts(),
          skill: recommendation.skill || sourceMessage.skill,
          learningObjective: objective,
          objectiveProgress: recommendation.objectiveProgress,
          ...(activity
            ? {
              requiredObjectiveItem: true,
              recommendedActivity: requiredActivity,
              progressItemId: activity.item_id,
              progressObjectiveId: idOf(objective),
              progressItemType: activity.type,
              flowAction: "complete",
            }
            : {}),
        });
        setSuggestedQuestions(fallbackObjectiveQuestions(objective));
        return;
      }
      if (!recommendation?.objective || !idOf(recommendation.objective) || !titleOf(recommendation.objective)) {
        addMessage({
          id: createId(),
          role: "assistant",
          content: `${feedback} Your saved progress confirms this objective is complete. I couldn't find another incomplete objective to recommend right now.`,
          timestamp: ts(),
        });
        return;
      }

      const targetObjective = recommendation.objective;
      const fallbackQuestions = fallbackObjectiveQuestions(targetObjective);
      const targetTitle = titleOf(targetObjective);
      const targetObjectiveId = idOf(targetObjective);

      try {
        const response = await sendMessage(
          `I'd like to learn about ${targetTitle}.`,
          answerStyle,
        );
        const responseContext = response.learning_context || response;
        const responseObjective = responseContext.learning_objective
          || responseContext.learningObjective;
        if (idOf(responseObjective) !== targetObjectiveId) {
          throw new Error("The learning response did not match the next incomplete objective.");
        }

        const responseQuestions = Array.isArray(response.suggested_questions)
          ? response.suggested_questions
          : [];
        setSuggestedQuestions(
          responseQuestions.length ? responseQuestions : fallbackQuestions,
        );
        addLearningResponse(response, feedback);
      } catch (error) {
        console.error("[chatbot-next-objective] guidance generation failed", error);
        setSuggestedQuestions(fallbackQuestions);
        addMessage({
          id: createId(),
          role: "assistant",
          content: `${feedback} Your next incomplete objective is "${targetTitle}". ${targetObjective.content || "Start with the approved SEEK content for this objective."}`,
          timestamp: ts(),
          skill: recommendation.skill,
          learningObjective: targetObjective,
          step: {
            type: "objective",
            content: targetObjective.content || `Approved learning objective: ${targetTitle}.`,
          },
        });
      }
    } catch (error) {
      console.error("[chatbot-next-objective] recommendation failed", error);
      addMessage({
        id: createId(),
        role: "assistant",
        content: `${feedback} I couldn't verify your saved progress or load the next objective right now. You can keep chatting whenever you're ready.`,
        timestamp: ts(),
      });
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  };

  const handleSend = async (text, style = answerStyle) => {
    const question = text?.trim();
    if (!question || requestInFlight.current || isLoading) return;

    requestInFlight.current = true;
    setSuggestedQuestions([]);
    addUserMessage(question);
    setLoading(true);

    try {
      const res = await sendMessage(question, style);
      const questions = Array.isArray(res.suggested_questions)
        ? res.suggested_questions
        : [];
      setSuggestedQuestions([...new Set(
        questions
          .filter((question) => typeof question === "string" && question.trim())
          .map((question) => question.trim()),
      )].slice(0, 4));
      addLearningResponse(res);
    } catch (err) {
      setSuggestedQuestions([]);
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
      requestInFlight.current = false;
      setLoading(false);
    }
  };

  const handleFlowMessage = async (text, action, sourceMessage, options = {}) => {
    if (
      !sourceMessage
      || sourceMessage.flowHandled
      || requestInFlight.current
      || isLoading
    ) return;

    const isActivityConfirmation = action === "activity"
      && options.activityConfirmation === true
      && Boolean(sourceMessage.recommendedActivity);
    if (isActivityConfirmation) {
      if (activityCompletionInFlight.current.has(sourceMessage.id)) return;
      activityCompletionInFlight.current.add(sourceMessage.id);
      setLoading(true);
    } else {
      markMessageHandled(sourceMessage.id);
      setSelectedAnswers((prev) => ({ ...prev, [sourceMessage.id]: text }));
    }
    if (action === "practice") {
      setSuggestedQuestions((current) => current.length
        ? current
        : fallbackObjectiveQuestions(sourceMessage.learningObjective));
    } else {
      setSuggestedQuestions([]);
    }
    if (action === "objective") {
      const objectiveTitle = titleOf(sourceMessage.nextObjective);
      await handleSend(
        objectiveTitle
          ? `I'd like to learn about ${objectiveTitle}.`
          : "I'd like to explore the next learning objective.",
        answerStyle,
      );
      return;
    }
    if (!isActivityConfirmation) addUserMessage(text);

    if (text === "No" && ["learn", "understanding"].includes(action)) {
      addMessage({
        id: createId(),
        role: "assistant",
        content: "That's okay. What part would you like me to explain differently? We'll stay here until it makes sense.",
        timestamp: ts(),
        skill: sourceMessage.skill,
        flowAction: action,
        flowIndex: sourceMessage.flowIndex,
        learningSteps: sourceMessage.learningSteps,
        learningObjective: sourceMessage.learningObjective,
      });
      return;
    }

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
    const recommendedActivity = sourceMessage.recommendedActivity
      || sourceMessage.recommended_activity
      || {};
    const itemId = sourceMessage.progressItemId
      || recommendedActivity.progress_item_id;
    const rawItemType = sourceMessage.progressItemType
      || recommendedActivity.progress_item_type;
    const itemType = { practice: "activity", assessment: "quiz" }[rawItemType] || rawItemType;

    const flowSteps = sourceMessage.learningSteps || [];
    const nextIndex = (sourceMessage.flowIndex ?? -1) + 1;
    const nextStep = flowSteps[nextIndex];
    if (
      action === "complete"
      || isActivityConfirmation
    ) {
      if (!skillId || !itemId || !itemType) {
        console.error("[chatbot-progress] missing completion metadata", {
          action,
          skillId,
          recommendedActivity,
          progress_item_id: itemId,
          progress_item_type: itemType,
          source: "chatbot",
        });
        addMessage({
          id: createId(),
          role: "assistant",
          content: "I could not identify the recommended curriculum item to save your progress.",
          timestamp: ts(),
        });
        if (isActivityConfirmation) {
          activityCompletionInFlight.current.delete(sourceMessage.id);
          setLoading(false);
        }
        return;
      }
      try {
        const completionPayload = {
          skill_id: String(skillId).trim(),
          item_id: String(itemId).trim(),
          item_type: itemType ? String(itemType).trim().toLowerCase() : undefined,
          source: "chatbot",
        };
        console.info("[chatbot-progress] completing recommended item", {
          action,
          skillId,
          recommendedActivity,
          progress_item_id: itemId,
          progress_item_type: itemType,
          source: completionPayload.source,
        });
        const completionResponse = await completeItem(skillId, itemId, itemType, "chatbot");
        console.info("[chatbot-progress] completion response", completionResponse);
        if (isActivityConfirmation) {
          markMessageHandled(sourceMessage.id);
          setSelectedAnswers((prev) => ({ ...prev, [sourceMessage.id]: text }));
          addUserMessage(text);
          activityCompletionInFlight.current.delete(sourceMessage.id);
          setLoading(false);
        }
        if (!completionResponse.objective_completed && !sourceMessage.requiredObjectiveItem) {
          const missingItems = completionResponse.missing_completion_items || [];
          const missingActivity = missingItems.find(
            (item) => ["activity", "practice"].includes(item.type),
          );
          const missingConditions = completionResponse.missing_completion_conditions || [];
          const objectiveTitle = titleOf(sourceMessage.learningObjective)
            || "This learning objective";
          const remaining = missingConditions.includes("activity")
            ? ` Please complete the activity${missingActivity?.title ? ` "${missingActivity.title}"` : ""}.`
            : " Saved progress still shows this objective as incomplete. Continue with its remaining learning items.";
          addMessage({
            id: createId(),
            role: "assistant",
            content: `"${objectiveTitle}" is not complete yet.${remaining}`,
            timestamp: ts(),
          });
        }
      } catch (error) {
        if (isActivityConfirmation) {
          activityCompletionInFlight.current.delete(sourceMessage.id);
          setLoading(false);
        }
        console.error("[chatbot-progress] completion failed", {
          action,
          skillId,
          recommendedActivity,
          progress_item_id: itemId,
          progress_item_type: itemType,
          source: "chatbot",
          status: error?.status,
          response: error?.data,
          message: error?.message,
        });
        addMessage({
          id: createId(),
          role: "assistant",
          content: error.message || "I could not save your learning progress yet.",
          timestamp: ts(),
        });
        return;
      }
    }

    if (sourceMessage.requiredObjectiveItem) {
      await recommendNextObjective(sourceMessage, null);
      return;
    }

    if (!nextStep) {
      const result = verifyQuickCheckAnswer(sourceMessage.step, text);

      if (action === "practice") {
        if (result === null) {
          addMessage({
            id: createId(),
            role: "assistant",
            content: "I couldn't verify that answer, so I won't mark the objective complete. Let's keep practising.",
            timestamp: ts(),
          });
          return;
        }
        if (result === true) {
          try {
            await completeObjective(
              skillId,
              idOf(sourceMessage.learningObjective),
              {
                source: "chatbot",
                interaction_id: sourceMessage.interactionId,
                quick_check_answer: ["true", "yes"].includes(text.trim().toLowerCase()),
              },
            );
          } catch (error) {
            console.error("[chatbot-progress] objective completion failed", error);
            addMessage({
              id: createId(),
              role: "assistant",
              content: error.message || "I could not save your learning objective progress yet.",
              timestamp: ts(),
            });
            return;
          }
        }
        await recommendNextObjective(sourceMessage, result);
      } else {
        addMessage({
          id: createId(),
          role: "assistant",
          content: result === null
            ? "I couldn't verify that answer yet. Let's keep practising together."
            : result
              ? "Correct! Great job. Let's continue learning."
              : "Not quite. The correct answer is worth remembering, and we can keep practicing together.",
          timestamp: ts(),
        });
      }
      return;
    }

    const nextAction = action === "learn"
      ? "understanding"
      : action === "understanding"
        ? "activity"
        : action === "activity"
          ? "practice"
        : action === "complete"
          ? "practice"
          : undefined;
    const nextContent = nextAction === "understanding"
      ? "Before we continue, let's check that the explanation is clear."
      : nextAction === "activity"
        ? "Great. Let's continue with the approved activity."
      : nextAction === "complete"
          ? "Let's try the activity step."
        : nextAction === "practice"
            ? "Thanks for trying the first step. Let's check one idea from what we explored."
          : "Let's continue.";

    addMessage({
      id: createId(),
      role: "assistant",
      content: nextContent,
      timestamp: ts(),
      skill: sourceMessage.skill,
      step: nextStep,
      flowAction: nextAction,
      flowIndex: nextIndex,
      learningSteps: flowSteps,
      recommendedActivity: sourceMessage.recommendedActivity,
      learningObjective: sourceMessage.learningObjective,
      interactionId: sourceMessage.interactionId,
      progressItemId: sourceMessage.progressItemId,
      progressObjectiveId: sourceMessage.progressObjectiveId,
      progressItemType: sourceMessage.progressItemType,
    });
  };

  return (
    <div className="chat-page flex flex-col h-full overflow-hidden">

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="chat-page__header px-6 pt-5 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">💬</span>
            <h1 className="text-xl font-bold text-gray-800">Chat With EmpathyGuru</h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 mx-5 mb-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onFlowMessage={handleFlowMessage}
            selectedAnswers={selectedAnswers}
            suggestedQuestions={suggestedQuestions}
            onSuggestedQuestionSelect={(question) => handleSend(question)}
          />
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          <ChatInputArea
            onSend={handleSend}
            isLoading={isLoading}
            answerStyle={answerStyle}
            onAnswerStyleChange={setAnswerStyle}
          />
        </div>
      </div>
    </div>
  );
}
