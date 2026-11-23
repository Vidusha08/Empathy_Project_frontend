import api from "../utils/axiosInstance.js";

export function parseGeneralEmpathyResponse(data) {
  if (data?.safety === true) {
    return {
      safety: true,
      message: typeof data.message === "string" ? data.message.trim() : "",
      riskLevel: data.risk_level ?? null,
      qualifyingEventCount: data.qualifying_event_count ?? null,
      restrictionActive: data.restriction_active === true,
      screeningRequired: data.screening_required === true,
      restrictionExpiresAt: data.restriction_expires_at ?? null,
      counsellorContacts: Array.isArray(data.counsellor_contacts) ? data.counsellor_contacts : [],
      emergencyContacts: Array.isArray(data.emergency_contacts) ? data.emergency_contacts : [],
      urgentGuidance: data.urgent_guidance ?? null,
      raw: data,
    };
  }

  if (typeof data?.response !== "string" || !data.response.trim()) {
    throw new Error("The chat service returned an empty response.");
  }

  return {
    safety: false,
    response: data.response.trim(),
    message: data.response.trim(),
  };
}

export async function sendGeneralEmpathyMessage(message, history = []) {
  const requestId =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const { data } = await api.post(
    "/api/general-empathy-chat",
    { message, history, request_id: requestId },
    { skipAuthRedirect: true }
  );

  return parseGeneralEmpathyResponse(data);
}

export function parseRecommendationResponse(data) {
  if (data?.safety === true) {
    return {
      safety: true,
      message: typeof data.message === "string" ? data.message.trim() : "",
      riskLevel: data.risk_level ?? null,
      qualifyingEventCount: data.qualifying_event_count ?? null,
      restrictionActive: data.restriction_active === true,
      screeningRequired: data.screening_required === true,
      restrictionExpiresAt: data.restriction_expires_at ?? null,
      counsellorContacts: Array.isArray(data.counsellor_contacts) ? data.counsellor_contacts : [],
      emergencyContacts: Array.isArray(data.emergency_contacts) ? data.emergency_contacts : [],
      urgentGuidance: data.urgent_guidance ?? null,
      raw: data,
    };
  }

  const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];
  return {
    safety: false,
    status: data?.status || (recommendations.length > 0 ? "success" : "no_recommendations"),
    recommendations,
  };
}

export async function getLearningRecommendations(history = []) {
  const requestId =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const { data } = await api.post(
    "/api/general-empathy-chat/recommendations",
    { history, request_id: requestId },
    { skipAuthRedirect: true }
  );

  return parseRecommendationResponse(data);
}


