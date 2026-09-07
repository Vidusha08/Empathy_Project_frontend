import api from "../utils/axiosInstance";

export async function completeObjective(objectiveId, skillId) {
	const { data } = await api.post(
		`/api/objectives/${objectiveId}/complete`,
		{ skill_id: skillId }
	);

	return data;
}
