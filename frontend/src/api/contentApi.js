import api from "../utils/axiosInstance";

const unwrap = (response) => response?.data ?? response;

const listOf = (value) => Array.isArray(value) ? value : [];

const normalizeItem = (item, type) => ({
  ...item,
  type,
  item_id: item?.item_id,
  title: item?.title || item?.question || type,
  content: item?.content || item?.description || item?.question || '',
});

const normalizeSkill = (skill) => ({
  ...skill,
  title: skill?.title || skill?.skill_title || '',
  objectives: listOf(skill?.objectives).map((objective) => {
    const items = [
      ...listOf(objective.learning_content).map((item) => normalizeItem(item, 'text')),
      ...listOf(objective.activities).map((item) => normalizeItem(item, 'activity')),
      ...listOf(objective.videos).map((item) => normalizeItem(item, 'video')),
      ...(objective.quiz ? [normalizeItem(objective.quiz, 'quiz')] : []),
      ...(objective.reflection ? [normalizeItem(objective.reflection, 'reflection')] : []),
    ];

    return {
      ...objective,
      objective_id: objective.objective_id || objective.id,
      title: objective.objective_title || objective.title || '',
      content: objective.objective_title || objective.content || '',
      items,
    };
  }),
});

export async function getSkills() {
  const response = await api.get("/api/content/skills");
  const data = unwrap(response);
  const skills = Array.isArray(data) ? data : data?.skills || [];
  return skills.map(normalizeSkill);
}

export async function getSkill(skillId) {
  if (!skillId) throw new Error("skillId is required.");
  const response = await api.get(`/api/content/skills/${encodeURIComponent(skillId)}`);
  return normalizeSkill(unwrap(response)?.skill || unwrap(response));
}

export default { getSkills, getSkill };