export function verifyQuickCheckAnswer(step, response) {
  if (typeof step?.correct_answer !== "boolean") return null;

  const normalizedResponse = typeof response === "string"
    ? response.trim().toLowerCase()
    : "";
  let answer;
  if (["true", "yes"].includes(normalizedResponse)) {
    answer = true;
  } else if (["false", "no"].includes(normalizedResponse)) {
    answer = false;
  } else {
    return null;
  }

  return answer === step.correct_answer;
}
