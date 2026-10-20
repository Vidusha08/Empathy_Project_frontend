// src/api/chatApi.js
import api from "../utils/axiosInstance";

export async function sendMessage(question, answerStyle = "short") {
  const { data } = await api.post("/api/learning-response", {
    question,
    answer_style: answerStyle,
  });

  const context = data.learning_context ?? data;

  return {
    // Keep the controller response available to consumers that need metadata
    // beyond the presentation fields below.
    learning_context: context,
    message: data.educational_response ?? context.message,
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
        .filter((question) => typeof question === "string" && question.trim())
        .map((question) => question.trim())
      : [],
    interactionId: data.interaction_id ?? null,
  };
}

export async function getLearningHistory() {
  const { data } = await api.get("/api/learning-history");
  return Array.isArray(data.interactions) ? data.interactions : [];
}
