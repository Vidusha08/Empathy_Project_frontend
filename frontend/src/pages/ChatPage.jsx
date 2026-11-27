//src/pages/ChatPage.jsx
import { useState, useRef, useEffect } from "react";
import ChatWindow from "../components/chat/ChatWindow";
import useAuthStore from "../store/authStore";
import useChatStore from "../store/chatStore";
import { getSafetyStatus, sendMessage, submitSafetyScreening } from "../api/chatApi";
import { completeItem, completeObjective, getProgress } from "../api/progressApi";
import { getSkill, getSkills } from "../api/contentApi";
import { findNextObjective, idOf, titleOf } from "../utils/nextObjective";
import { verifyQuickCheckAnswer } from "../utils/quickCheck";
import {
  AlignJustify,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Maximize2,
  MessageSquare,
  Mic,
  Minimize2,
  Paperclip,
  Send,
} from "lucide-react";
import "./ChatPages.css";
import SafetyGate from "../components/chat/SafetyGate";

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
  const title = titleOf(objective);
  const topic = title || "";
  if (!topic) return [];

  const objectiveTitle = topic;
  return [
    `What does the approved SEEK content say about ${topic}?`,
    `How does ${topic} relate to ${objectiveTitle}?`,
    `Which part of ${objectiveTitle} would you like to understand better?`,
  ];
}

// Redesigned Slim Message Composer with integrated Short/Long controls
function ChatInputArea({ onSend, isLoading, disabled, answerStyle, onAnswerStyleChange }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const submit = () => {
    if (!text.trim() || isLoading || disabled) return;
    onSend(text.trim(), answerStyle);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="chat-composer-box w-full rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 transition-all">
      {/* Multiline textarea with auto-expansion */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Chat with EmpathyGuru..."
        rows={1}
        disabled={isLoading || disabled}
        className="w-full resize-none outline-none text-sm font-normal sm:font-medium text-gray-900 placeholder-gray-500 bg-transparent leading-relaxed max-h-24 overflow-y-auto px-1 py-0"
        style={{ minHeight: 22 }}
        aria-label="Chat message"
      />

      {/* Inside composer controls row: Short/Long selector on left, Attachment + Mic + Send on right */}
      <div className="flex items-center justify-between pt-1 mt-0.5 border-t border-white/40">
        {/* Integrated Response Length Selector */}
        <div className="chat-response-style flex items-center gap-1.5" role="group" aria-label="Response style">
          <span className="chat-response-style__label text-[10px] font-semibold text-gray-500 hidden sm:inline uppercase tracking-wider">
            Response:
          </span>
          <div className="chat-response-style__options inline-flex items-center gap-1 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => onAnswerStyleChange("short")}
              aria-pressed={answerStyle === "short"}
              title="Short responses: concise and direct"
              className={`chat-response-style__option flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                answerStyle === "short"
                  ? "chat-response-style__option--active"
                  : ""
              }`}
            >
              <AlignLeft size={12} className="shrink-0" />
              <span>Short</span>
            </button>
            <span className="sr-only"> </span>
            <button
              type="button"
              onClick={() => onAnswerStyleChange("long")}
              aria-pressed={answerStyle === "long"}
              title="Long responses: detailed and comprehensive"
              className={`chat-response-style__option flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                answerStyle === "long"
                  ? "chat-response-style__option--active"
                  : ""
              }`}
            >
              <AlignJustify size={12} className="shrink-0" />
              <span>Long</span>
            </button>
          </div>
        </div>

        {/* Action icons: Attachment, Microphone, and Send */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="chat-input-row__attach inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-white/50 transition-colors"
            aria-label="Attach file"
            title="Attach file"
          >
            <Paperclip size={14} />
          </button>
          <button
            type="button"
            className="chat-input-row__mic inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-white/50 transition-colors"
            aria-label="Use microphone"
            title="Use microphone"
          >
            <Mic size={14} />
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim() || isLoading || disabled}
            aria-label="Send message"
            title="Send message"
            className={`chat-input-row__send inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
              text.trim() && !isLoading && !disabled
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-xs active:scale-95 cursor-pointer"
                : "bg-gray-200/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send size={13} className="translate-x-px" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Page

export default function ChatPage() {
  const [answerStyle, setAnswerStyle] = useState("short");
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [safetyStatus, setSafetyStatus] = useState(null);
  const [screeningLoading, setScreeningLoading] = useState(false);
  const [screeningError, setScreeningError] = useState("");
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

  useEffect(() => {
    let active = true;
    getSafetyStatus()
      .then((status) => {
        if (active && (status.restriction_active || status.screening_required)) {
          setSafetyStatus(status);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const handleSafetyScreening = async (answers) => {
    setScreeningLoading(true);
    setScreeningError("");
    try {
      const status = await submitSafetyScreening(answers);
      if (status.access_restored) {
        setSafetyStatus(null);
      } else {
        setSafetyStatus(status);
      }
    } catch (error) {
      setScreeningError(
        error?.response?.data?.error || "The screening could not be saved. Please try again.",
      );
    } finally {
      setScreeningLoading(false);
    }
  };

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
    const hasLearningFlow = steps.length > 0 && Boolean(skill?.id);

    addMessage({
      id: createId(),
      role: "assistant",
      content: [
        introduction,
        res.message || res.response || res.educational_response || steps[0]?.content || learningContext.message,
      ].filter(Boolean).join("\n\n"),
      timestamp: ts(),
      emotion: res.emotion ?? "calm",
      status: res.status,
      activeAgent: res.active_agent,
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
      const historyPayload = messages
        .filter((m) => m && typeof m.content === "string" && m.content.trim() && (m.role === "user" || m.role === "assistant"))
        .map((m) => ({
          role: m.role,
          content: m.content.trim(),
        }));

      const res = await sendMessage(question, style, historyPayload, "default");
      if (res.safety) {
        addMessage({
          id: createId(),
          role: "assistant",
          content: [res.message, res.urgentGuidance].filter(Boolean).join("\n\n"),
          timestamp: ts(),
          emotion: "concerned",
        });
        if (res.restrictionActive || res.screeningRequired) {
          setSafetyStatus({
            message: res.message,
            restriction_active: res.restrictionActive,
            screening_required: res.screeningRequired,
            restriction_expires_at: res.restrictionExpiresAt,
            counsellor_contacts: res.counsellorContacts,
            urgent_guidance: res.urgentGuidance,
          });
        }
        return;
      }
      const context = res.learning_context || res;

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
      const status = err?.response?.status;
      if (status === 423) {
        const safetyPayload = err?.response?.data || {};
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

    const activityMode = sourceMessage.step?.activity?.interaction_type
      || (sourceMessage.step?.activity?.type === "reflection" ? "reflective" : "practical");
    const hasActivityResponse = typeof options.activityResponse === "string"
      && Boolean(options.activityResponse.trim());
    const isActivitySubmission = action === "activity"
      && options.activitySubmission === true
      && Boolean(sourceMessage.recommendedActivity?.id)
      && (
        (activityMode === "practical" && options.activityConfirmation === true)
        || (activityMode === "reflective" && hasActivityResponse)
        || (activityMode === "combined" && hasActivityResponse && options.activityConfirmation === true)
      );
    if (isActivitySubmission) {
      if (activityCompletionInFlight.current.has(sourceMessage.id)) return;
      activityCompletionInFlight.current.add(sourceMessage.id);
      setLoading(true);
    } else {
      const hasRecommendedActivity = Boolean(
        sourceMessage.recommendedActivity?.id || sourceMessage.recommended_activity?.id
      );
      if (action === "activity" && hasRecommendedActivity) {
        addMessage({
          id: createId(),
          role: "assistant",
          content: "Please complete the activity response before continuing.",
          timestamp: ts(),
        });
        return;
      }
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
    if (!isActivitySubmission) addUserMessage(text);

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
      || isActivitySubmission
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
        if (isActivitySubmission) {
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
        if (isActivitySubmission) {
          markMessageHandled(sourceMessage.id);
          setSelectedAnswers((prev) => ({ ...prev, [sourceMessage.id]: text }));
          addUserMessage(hasActivityResponse
            ? `Reflection: ${options.activityResponse.trim()}`
            : text);
          activityCompletionInFlight.current.delete(sourceMessage.id);
          setLoading(false);
        }
        if (
          !completionResponse.objective_completed
          && !sourceMessage.requiredObjectiveItem
          && !nextStep
        ) {
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
        if (isActivitySubmission) {
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
                quick_check_answer: typeof sourceMessage.step?.correct_answer === "string"
                  ? text.trim()
                  : ["true", "yes"].includes(text.trim().toLowerCase()),
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
        } else {
          const conceptStep = flowSteps.find(
            (step) => step?.type === "learning_objective",
          );
          addMessage({
            id: createId(),
            role: "assistant",
            content: `Not quite. Let's explain the idea another way:\n\n${conceptStep?.content || "Review the concept once more, then try the check again."}`,
            timestamp: ts(),
            skill: sourceMessage.skill,
            step: sourceMessage.step,
            flowAction: "practice",
            flowIndex: sourceMessage.flowIndex,
            learningSteps: flowSteps,
            recommendedActivity: sourceMessage.recommendedActivity,
            learningObjective: sourceMessage.learningObjective,
            interactionId: sourceMessage.interactionId,
            progressItemId: sourceMessage.progressItemId,
            progressObjectiveId: sourceMessage.progressObjectiveId,
            progressItemType: sourceMessage.progressItemType,
          });
          return;
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
    <div className="chat-page chat-page--seek flex h-full min-h-0 flex-col overflow-hidden p-2 sm:p-4">
      {/* Unified Glassmorphism Chat & Message Composer Container */}
      <div className="chat-unified-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl backdrop-blur-md">
        
        {/* Chat Header - Integrated in panel's top header with collapse toggle */}
        <div
          className={`chat-panel__header shrink-0 backdrop-blur-md transition-all duration-300 ease-in-out ${
            headerExpanded ? "py-2.5 px-4" : "py-1.5 px-3 chat-panel__header--collapsed"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            {headerExpanded ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[var(--app-accent-subtle)] text-[var(--app-accent)] flex items-center justify-center shrink-0 shadow-xs border border-[var(--app-border)]">
                  <MessageSquare size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h1 className="text-sm sm:text-base font-semibold text-[var(--app-text)] truncate">
                      Chat With EmpathyGuru
                    </h1>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50/90 text-emerald-700 border border-emerald-200/80 shrink-0 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online Companion
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--app-text-muted)] truncate hidden sm:block">
                    SEEK Learning &amp; Emotional Support
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)] min-w-0">
                <div className="w-6 h-6 rounded-lg bg-[var(--app-accent-subtle)] text-[var(--app-accent)] flex items-center justify-center shrink-0">
                  <MessageSquare size={13} />
                </div>
                <span className="font-semibold text-xs text-[var(--app-text)] truncate">Chat With EmpathyGuru</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Online" />
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setHeaderExpanded((prev) => !prev)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-colors"
                title={headerExpanded ? "Collapse chat header" : "Expand chat header"}
                aria-label={headerExpanded ? "Collapse chat header" : "Expand chat header"}
              >
                {headerExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Messages History - Central flexible area, scrolls independently */}
        <div className="chat-messages-area flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onFlowMessage={handleFlowMessage}
            selectedAnswers={selectedAnswers}
            suggestedQuestions={suggestedQuestions}
            onSuggestedQuestionSelect={(question) => handleSend(question)}
          />
        </div>

        {/* Message Input Composer - Fixed at the bottom of the chat panel, matching message width */}
        <div className="chat-composer-container shrink-0 px-3 sm:px-4 pb-2 sm:pb-2.5 pt-0">
          <ChatInputArea
            onSend={handleSend}
            isLoading={isLoading}
            answerStyle={answerStyle}
            onAnswerStyleChange={setAnswerStyle}
          />
        </div>
      </div>

      {safetyStatus && (
        <SafetyGate
          mode={safetyStatus.restriction_active ? "restricted" : "screening"}
          status={safetyStatus}
          onSubmit={handleSafetyScreening}
          loading={screeningLoading}
          error={screeningError}
        />
      )}
    </div>
  );
}
