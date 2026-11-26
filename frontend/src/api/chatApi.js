// src/api/chatApi.js
import api from "../utils/axiosInstance";

export async function sendMessage(
  question,
  answerStyleOrOptions = "short",
  historyParam = [],
  conversationIdParam = "default",
  requestIdParam = null,
) {
  let answerStyle = "short";
  let history = [];
  let conversationId = "default";
  let requestId = null;

  if (typeof answerStyleOrOptions === "object" && answerStyleOrOptions !== null) {
    answerStyle = answerStyleOrOptions.answerStyle || answerStyleOrOptions.answer_style || "short";
    history = answerStyleOrOptions.history || [];
    conversationId = answerStyleOrOptions.conversationId || answerStyleOrOptions.conversation_id || "default";
    requestId = answerStyleOrOptions.requestId || answerStyleOrOptions.request_id || null;
  } else {
    answerStyle = answerStyleOrOptions || "short";
    history = historyParam || [];
    conversationId = conversationIdParam || "default";
    requestId = requestIdParam;
  }

  const finalRequestId = requestId || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

  const { data } = await api.post("/api/learning-response", {
    question,
    answer_style: answerStyle,
    request_id: finalRequestId,
    conversation_id: conversationId,
    history: Array.isArray(history) ? history : [],
  });

  const context = data.learning_context ?? data;
  const messageText = data.response ?? data.educational_response ?? data.answer ?? context.message ?? "";

  return {
    // Keep the controller response available to consumers that need metadata
    // beyond the presentation fields below.
    learning_context: context,
    message: messageText,
    response: data.response ?? messageText,
    educational_response: data.educational_response ?? messageText,
    active_agent: data.active_agent ?? context.active_agent ?? (Array.isArray(data.steps) && data.steps.length > 0 ? "tutor_agent" : "general_empathy_agent"),
    role: data.role ?? "assistant",
    status: context.status,
    emotion: context.detected_emotion ?? "calm",
    skill: context.skill ?? null,
    topic: context.topic ?? null,
    learningObjective: context.learning_objective ?? null,
    nextIncompleteObjective: context.next_incomplete_objective ?? null,
    progressRecommendation: context.progress_recommendation ?? null,
    recommendedActivity: context.recommended_activity ?? null,
    progressItemId: context.recommended_activity?.progress_item_id ?? null,
    progressObjectiveId: context.recommended_activity?.progress_objective_id ?? null,
    progressItemType: context.recommended_activity?.progress_item_type ?? null,
    sourcePage: context.source_page ?? null,
    steps: Array.isArray(data.steps) ? data.steps : [],
    suggested_questions: Array.isArray(data.suggested_questions)
      ? data.suggested_questions
        .filter((q) => typeof q === "string" && q.trim())
        .map((q) => q.trim())
      : [],
    interactionId: data.interaction_id ?? null,
    safety: data.safety === true,
    riskLevel: data.risk_level ?? null,
    qualifyingEventCount: data.qualifying_event_count ?? null,
    restrictionActive: data.restriction_active === true,
    screeningRequired: data.screening_required === true,
    restrictionExpiresAt: data.restriction_expires_at ?? null,
    counsellorContacts: data.counsellor_contacts ?? [],
    urgentGuidance: data.urgent_guidance ?? null,
  };
}

export async function getSafetyStatus() {
  const { data } = await api.get("/api/safety/status");
  return data;
}

export async function submitSafetyScreening(answers) {
  const { data } = await api.post("/api/safety/screening", answers);
  return data;
}

export async function getLearningHistory() {
  const { data } = await api.get("/api/learning-history");
  return Array.isArray(data.interactions) ? data.interactions : [];
}
