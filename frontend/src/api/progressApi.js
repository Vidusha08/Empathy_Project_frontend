
const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () => {
  try {
    const rawAuthStorage = localStorage.getItem('auth-storage');
    if (rawAuthStorage) {
      const authStorage = JSON.parse(rawAuthStorage);
      if (authStorage?.state?.token) {
        return authStorage.state.token;
      }
    }
  } catch {
  }

  return (
    localStorage.getItem('token') ||
    localStorage.getItem('access_token')
  );
};

/**
 * Common request helper.
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMessage =
      data.error ||
      data.message ||
      `Request failed with status ${response.status}`;

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

const normalizeProgress = (response) => {
  const progress = response?.progress || response?.data || response || {};
  const completedObjectives =
    progress.completed_objective_ids ||
    progress.completed_objectives ||
    progress.completedObjectives ||
    progress.completed ||
    [];

  const completedObjectiveIds = Array.isArray(completedObjectives)
    ? completedObjectives.map((objective) =>
        typeof objective === 'object'
          ? objective.id || objective.objective_id
          : objective
      )
    : [];

  return {
    ...progress,
    completed_objective_ids: completedObjectiveIds,
  };
};

/**
 * Get progress for one skill.
 *
 * Backend:
 * GET /api/progress/<skill_id>
 *
 * Returns data similar to:
 * {
 *   skill_id: "...",
 *   completed_objective_ids: [...],
 *   next_recommended_learning_objective: {...} | null
 * }
 */
const getProgress = async (skillId) => {
  if (!skillId) {
    throw new Error('skillId is required.');
  }

  const response = await apiRequest(
    `/progress/${encodeURIComponent(skillId)}`
  );

  return normalizeProgress(response);
};

/**
 * Alias used by ContentPage while the API is being developed.
 */
const getSkillProgress = async (skillId) => {
  return getProgress(skillId);
};

/**
 * Get progress for all skills.
 *
 * The backend currently exposes progress per skill,
 * so this function calls the endpoint once for each skill.
 *
 * Expected input:
 * [
 *   'skill_1',
 *   'skill_2',
 *   ...
 * ]
 *
 * Returns:
 * {
 *   skill_1: {...},
 *   skill_2: {...},
 *   ...
 * }
 */
const getAllSkillProgress = async (skillIds = []) => {
  if (!Array.isArray(skillIds) || skillIds.length === 0) {
    return {};
  }

  const results = await Promise.all(
    skillIds.map(async (skillId) => {
      try {
        const progress = await getProgress(skillId);

        return {
          skillId,
          progress,
        };
      } catch (error) {
        console.error(
          `Could not load progress for skill "${skillId}":`,
          error
        );

        return {
          skillId,
          progress: null,
          error,
        };
      }
    })
  );

  return results.reduce((acc, item) => {
    if (item.progress) {
      acc[item.skillId] = item.progress;
    }

    return acc;
  }, {});
};

/**
 * Complete a learning objective.
 *
 * Backend:
 * POST /api/objectives/<objective_id>/complete
 *
 * Body:
 * {
 *   skill_id: "..."
 * }
 */
const completeObjective = async (objectiveId, skillId) => {
  if (!objectiveId) {
    throw new Error('objectiveId is required.');
  }

  if (!skillId) {
    throw new Error('skillId is required.');
  }

  return apiRequest(
    `/objectives/${encodeURIComponent(objectiveId)}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({
        skill_id: skillId,
      }),
    }
  );
};

/**
 * Check whether a particular objective has been completed.
 */
const isObjectiveCompleted = (progress, objectiveId) => {
  if (!progress || !objectiveId) {
    return false;
  }

  return Array.isArray(progress.completed_objective_ids)
    ? progress.completed_objective_ids.includes(objectiveId)
    : false;
};

/**
 * Calculate the completion percentage for a skill.
 *
 * This is calculated on the frontend from:
 * - completed_objective_ids
 * - total number of objectives for that skill
 *
 * Example:
 * 3 completed / 5 total = 60%
 */
const calculateSkillPercentage = (
  progress,
  totalObjectives
) => {
  if (!progress || !totalObjectives || totalObjectives <= 0) {
    return 0;
  }

  const completedCount = Array.isArray(
    progress.completed_objective_ids
  )
    ? progress.completed_objective_ids.length
    : 0;

  return Math.min(
    100,
    Math.round((completedCount / totalObjectives) * 100)
  );
};

const progressApi = {
  getProgress,
  getSkillProgress,
  getAllSkillProgress,
  completeObjective,
  isObjectiveCompleted,
  calculateSkillPercentage,
};

export default progressApi;

// Also export named functions if you prefer:
// import { getProgress } from '../api/progressApi';
export {
  getProgress,
  getSkillProgress,
  getAllSkillProgress,
  completeObjective,
  isObjectiveCompleted,
  calculateSkillPercentage,
};

