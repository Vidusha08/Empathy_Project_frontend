const listOf = (value) => (Array.isArray(value) ? value : []);

export const idOf = (item) =>
  typeof item === "string"
    ? item
    : item?.skill_id
      || item?.chapter_id
      || item?.objective_id
      || item?.id
      || item?.objectiveId;

export const titleOf = (item) =>
  typeof item === "string"
    ? item
    : item?.title
      || item?.objective_title
      || item?.name
      || item?.label
      || "";

const objectivesOf = (skill) =>
  listOf(skill?.objectives || skill?.learning_objectives || skill?.learningObjectives);

const completedObjectiveIdsOf = (progress) => new Set(
  listOf(
    progress?.completed_objective_ids
      || progress?.completed_objectives
      || progress?.completedObjectives,
  ).map((item) => (typeof item === "object" ? idOf(item) : item)).filter(Boolean),
);

const isCompleted = (objective, progress) => {
  const objectiveId = idOf(objective);
  return objectiveId
    ? completedObjectiveIdsOf(progress).has(objectiveId)
    : false;
};

const firstIncomplete = (skill, progress) =>
  objectivesOf(skill).find((objective) => idOf(objective) && !isCompleted(objective, progress));

export function findNextObjective(currentSkill, currentProgress, nextSkills = []) {
  const currentObjective = firstIncomplete(
    {
      objectives: objectivesOf(currentSkill).slice(
        Math.max(
          0,
          objectivesOf(currentSkill).findIndex(
            (objective) => idOf(objective) === idOf(currentSkill.currentObjective),
          ) + 1,
        ),
      ),
    },
    currentProgress,
  );
  if (currentObjective) return { skill: currentSkill, objective: currentObjective };

  for (const skill of nextSkills) {
    const objective = firstIncomplete(skill, skill.progress);
    if (objective) return { skill, objective };
  }

  return null;
}

export function objectiveItems(objective) {
  return listOf(objective?.items || objective?.learning_items);
}
