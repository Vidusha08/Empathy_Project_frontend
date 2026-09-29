import api from "../utils/axiosInstance";

const unwrap = (response) => response?.data ?? response;

export async function getSkills() {
  const response = await api.get("/api/content/skills");
  const data = unwrap(response);
  return Array.isArray(data) ? data : data?.skills || [];
}

export async function getSkill(skillId) {
  if (!skillId) throw new Error("skillId is required.");
  const response = await api.get(`/api/content/skills/${encodeURIComponent(skillId)}`);
  const data = unwrap(response);
  return data?.skill || data;
}

export default { getSkills, getSkill };