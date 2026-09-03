import api from "../utils/axiosInstance";

export async function sendMessage(question) {
  const { data } = await api.post("/api/learning-response", {
    question,
  });

  const context = data.learning_context ?? data;

  return {
    message: data.educational_response ?? context.message,
    emotion: context.detected_emotion ?? "calm",
    skill: context.skill ?? null,
    interactionId: data.interaction_id ?? null,
  };
}