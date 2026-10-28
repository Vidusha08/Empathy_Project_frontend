import api from "../utils/axiosInstance";

export async function sendGeneralEmpathyMessage(message, history = []) {
  const { data } = await api.post(
    "/api/general-empathy-chat",
    { message, history },
    { skipAuthRedirect: true }
  );

  if (typeof data?.response !== "string" || !data.response.trim()) {
    throw new Error("The chat service returned an empty response.");
  }

  return data.response.trim();
}
