import api from "../utils/axiosInstance";
import { ENDPOINTS } from "../utils/constants";
 
/**
 * Send a chat message to the backend.
 *
 * Backend endpoint : POST /api/chat/message
 * Request body     : { message: string, session_id?: string }
 * Response shape   : {
 *   emotion    : string   — detected emotion (e.g. "anxiety", "calm")
 *   skill      : string   — mapped SEEK skill (e.g. "Self-awareness")
 *   response   : string   — Gemini-generated reply text
 *   risk_level : string   — "low" | "moderate" | "high"
 *   confidence : number   — 0.0 – 1.0
 * }
 *
 * NOTE: The backend does NOT accept a `history` array — it handles
 * conversation context via session_id + its own DB chat_history.
 * We pass session_id so the backend can group messages per session.
 */
export async function sendMessage(message, sessionId = "default") {
  const payload = {
    message,
    session_id: sessionId,
  };
 
  const { data } = await api.post(ENDPOINTS.CHAT_SEND, payload);
 
  // Normalise to the shape ChatPage expects:
  // { message: string, emotion: string, risk_level: string, skill: string, confidence: number }
  return {
    message:    data.response,    // ← backend key is "response", not "message"
    emotion:    data.emotion,
    skill:      data.skill,
    risk_level: data.risk_level,
    confidence: data.confidence,
  };
}
 
/**
 * Fetch chat history for the current user.
 * GET /api/chat/history
 */
export async function getChatHistory() {
  const { data } = await api.get(ENDPOINTS.CHAT_HISTORY);
  return data; // array of chat_history documents
}
 
/**
 * Get emotion statistics for the current user.
 * GET /api/chat/stats
 */
export async function getEmotionStats() {
  const { data } = await api.get("/api/chat/stats");
  return data; // { emotion_name: count, ... }
}
 
/**
 * Get crisis support resources.
 * GET /api/chat/crisis-resources  (public, no auth required)
 */
export async function getCrisisResources() {
  const { data } = await api.get("/api/chat/crisis-resources");
  return data;
}
 
/**
 * Submit feedback on a response.
 * POST /api/chat/feedback
 */
export async function submitFeedback(feedbackData) {
  const { data } = await api.post("/api/chat/feedback", feedbackData);
  return data;
}