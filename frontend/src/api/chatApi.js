import api from "../utils/axiosInstance";

export async function sendMessage(question) {
  const { data } = await api.post("/api/learning-response", {
    question,
  });

  const context = data.learning_context ?? data;

  return {
    message: data.educational_response ?? context.message,
    status: context.status,
    emotion: context.detected_emotion ?? "calm",
    skill: context.skill ?? null,
    topic: context.topic ?? null,
    learningObjective: context.learning_objective ?? null,
    recommendedActivity: context.recommended_activity ?? null,
    sourcePage: context.source_page ?? null,
    interactionId: data.interaction_id ?? null,
  };
}