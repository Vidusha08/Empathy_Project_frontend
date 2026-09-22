const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () => {
  try {
    const rawAuthStorage = localStorage.getItem('auth-storage');
    const authStorage = rawAuthStorage ? JSON.parse(rawAuthStorage) : null;
    if (authStorage?.state?.token) return authStorage.state.token;
  } catch {
    // Ignore malformed persisted auth state.
  }
  return localStorage.getItem('token') || localStorage.getItem('access_token');
};

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  let data = {};
  try {
    data = await response.json();
  } catch {
    // Successful empty responses are valid for completion requests.
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      window.location.assign('/login');
    }
    const error = new Error(data.error || data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

const normalizeProgress = (response) => {
  const progress = response?.progress || response?.data || response || {};
  const completed = progress.completed_objective_ids || progress.completed_objectives || progress.completedObjectives || [];
  return {
    ...progress,
    completed_objective_ids: Array.isArray(completed)
      ? completed.map((item) => typeof item === 'object' ? item.id || item.objective_id : item)
      : [],
    completed_item_ids: Array.isArray(progress.completed_item_ids) ? progress.completed_item_ids : [],
  };
};

const getProgress = async (skillId) => {
  if (!skillId) throw new Error('skillId is required.');
  return normalizeProgress(await apiRequest(`/progress/${encodeURIComponent(skillId)}`));
};

const getSkillProgress = getProgress;
const getProgressStructure = () => apiRequest('/progress/structure');
const getOverallProgress = () => apiRequest('/progress');

const getAllSkillProgress = async (skillIds = []) => {
  if (!Array.isArray(skillIds) || skillIds.length === 0) return {};
  const results = await Promise.all(skillIds.map(async (skillId) => {
    try {
      return { skillId, progress: await getProgress(skillId) };
    } catch (error) {
      console.error(`Could not load progress for skill "${skillId}":`, error);
      return { skillId, progress: null };
    }
  }));
  return results.reduce((result, item) => {
    if (item.progress) result[item.skillId] = item.progress;
    return result;
  }, {});
};

const completeItem = (skillId, itemId) => {
  if (!skillId) throw new Error('skillId is required.');
  if (!itemId) throw new Error('itemId is required.');
  return apiRequest('/progress/item-complete', {
    method: 'POST',
    body: JSON.stringify({ skill_id: skillId, item_id: itemId }),
  });
};

const isObjectiveCompleted = (progress, objectiveId) =>
  Array.isArray(progress?.completed_objective_ids) && progress.completed_objective_ids.includes(objectiveId);

const calculateSkillPercentage = (progress, totalObjectives) => {
  if (!progress || !totalObjectives) return 0;
  const completed = Array.isArray(progress.completed_objective_ids) ? progress.completed_objective_ids.length : 0;
  return Math.min(100, Math.round((completed / totalObjectives) * 100));
};

const progressApi = {
  getProgress, getSkillProgress, getProgressStructure, getOverallProgress,
  getAllSkillProgress, completeItem,
  isObjectiveCompleted, calculateSkillPercentage,
};

export default progressApi;
export {
  getProgress, getSkillProgress, getProgressStructure, getOverallProgress,
  getAllSkillProgress, completeItem,
  isObjectiveCompleted, calculateSkillPercentage,
};
