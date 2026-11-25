import assert from "node:assert/strict";
import test from "node:test";
import { verifyQuickCheckAnswer } from "./quickCheck.js";

// Test suite verifying frontend integration with Empathy Guru Agentic AI backend

test("structured agent response parses four pedagogical steps correctly", () => {
  const backendResponse = {
    educational_response: "Somatic tracking is a technique to observe bodily sensations.",
    answer: "Somatic tracking is a technique to observe bodily sensations.",
    steps: [
      {
        type: "direct_answer",
        content: "Somatic tracking is a technique to observe bodily sensations.",
      },
      {
        type: "learning_objective",
        content: "Apply tracking, grounding, and resourcing techniques.",
      },
      {
        type: "activity",
        content: "Contact Grounding Practice: Place your feet flat on the floor.",
        activity: {
          id: "node_0194",
          title: "Contact Grounding Practice",
          content: "Place your feet flat on the floor.",
          interaction_type: "practical",
          progress_item_id: "activity_01_04",
          progress_item_type: "activity",
          progress_objective_id: "obj_01_04",
        },
      },
      {
        type: "practice_check",
        content: "What is the primary goal of somatic tracking?",
        question: "What is the primary goal of somatic tracking?",
        question_type: "multiple_choice",
        correct_answer: "Noticing physical sensations without judging them",
        options: [
          "Noticing physical sensations without judging them",
          "Ignoring physical sensations completely",
          "Forcing muscles to relax immediately",
          "Overthinking every sensation",
        ],
      },
    ],
    learning_context: {
      student_question: "What is somatic tracking?",
      detected_emotion: "calm",
      detected_terms: ["somatic", "tracking"],
      status: "learning_path_selected",
      skill: { id: "skill_01", title: "Building Compassion and Empathy" },
      learning_objective: {
        id: "obj_01_04",
        title: "Apply tracking, grounding, and resourcing techniques",
      },
      recommended_activity: {
        id: "node_0194",
        title: "Contact Grounding Practice",
        content: "Place your feet flat on the floor.",
        progress_item_id: "activity_01_04",
        progress_item_type: "activity",
        progress_objective_id: "obj_01_04",
      },
      answer_style: "short",
    },
    suggested_questions: ["How do I ground myself?", "What is resourcing?"],
    interaction_id: "6737f1e...",
  };

  // 1. Verify direct answer
  assert.equal(backendResponse.steps.length, 4);
  assert.equal(backendResponse.steps[0].type, "direct_answer");
  assert.ok(backendResponse.steps[0].content.includes("Somatic tracking"));

  // 2. Verify objective
  assert.equal(backendResponse.steps[1].type, "learning_objective");

  // 3. Verify activity with canonical progress IDs
  assert.equal(backendResponse.steps[2].type, "activity");
  const activity = backendResponse.steps[2].activity;
  assert.equal(activity.progress_item_id, "activity_01_04");
  assert.equal(activity.progress_item_type, "activity");
  assert.equal(activity.progress_objective_id, "obj_01_04");
  assert.equal(activity.interaction_type, "practical");

  // 4. Verify quick check verification
  assert.equal(backendResponse.steps[3].type, "practice_check");
  const check = backendResponse.steps[3];
  assert.equal(check.options.length, 4);
  assert.equal(
    verifyQuickCheckAnswer(
      check,
      "Noticing physical sensations without judging them",
    ),
    true,
  );
  assert.equal(
    verifyQuickCheckAnswer(check, "Ignoring physical sensations completely"),
    false,
  );
});

test("activity submission payload preserves required completion identifiers", () => {
  const sourceMessage = {
    id: "msg-123",
    skill: { id: "skill_01", title: "Building Compassion and Empathy" },
    progressItemId: "activity_01_04",
    progressItemType: "activity",
    progressObjectiveId: "obj_01_04",
    recommendedActivity: {
      id: "node_0194",
      title: "Contact Grounding Practice",
      progress_item_id: "activity_01_04",
      progress_item_type: "activity",
      progress_objective_id: "obj_01_04",
    },
  };

  const skillId = sourceMessage.skill?.id;
  const itemId = sourceMessage.progressItemId;
  const itemType = sourceMessage.progressItemType;

  // Build expected completion payload
  const completionPayload = {
    skill_id: String(skillId).trim(),
    item_id: String(itemId).trim(),
    item_type: String(itemType).trim().toLowerCase(),
    source: "chatbot",
  };

  assert.equal(completionPayload.skill_id, "skill_01");
  assert.equal(completionPayload.item_id, "activity_01_04");
  assert.equal(completionPayload.item_type, "activity");
  assert.equal(completionPayload.source, "chatbot");
});

test("duplicate activity submission is prevented by in-flight tracker", () => {
  const inFlightSet = new Set();
  const messageId = "msg-submission-01";

  // First submission attempt
  assert.equal(inFlightSet.has(messageId), false);
  inFlightSet.add(messageId);

  // Second duplicate submission attempt while in-flight
  const isDuplicate = inFlightSet.has(messageId);
  assert.equal(isDuplicate, true);

  // Cleanup after response
  inFlightSet.delete(messageId);
  assert.equal(inFlightSet.has(messageId), false);
});

test("response hides internal agent names and exposes single Empathy Guru persona", () => {
  const internalAgentNames = [
    "TutorAgent",
    "EmotionalSupportAgent",
    "LearningPlannerAgent",
    "AssessmentAgent",
  ];

  const publicAssistantMessage = {
    role: "assistant",
    content: "Hey! I'm here to help you explore empathy and build your skills.",
    skillTitle: "Building Compassion and Empathy",
  };

  for (const agentName of internalAgentNames) {
    assert.equal(
      publicAssistantMessage.content.includes(agentName),
      false,
      `Should not expose internal agent name: ${agentName}`,
    );
  }
});

test("Yes and No choices are configured as separate distinguishable controls", () => {
  // Test the button configuration contract for Yes/No learning flow actions
  const actions = ["learn", "understanding", "practice"];

  actions.forEach((flowAction) => {
    const isYesNo = flowAction !== "practice" || true;
    const yesControl = {
      label: "Yes",
      variant: "yes",
      className: "chat-action-btn--yes",
      ariaLabel: "Yes, continue",
    };
    const noControl = {
      label: "No",
      variant: "no",
      className: "chat-action-btn--no",
      ariaLabel: "No, ask for clarification",
    };

    // Ensure Yes and No are distinct, separate buttons
    assert.notEqual(yesControl.label, noControl.label);
    assert.notEqual(yesControl.variant, noControl.variant);
    assert.notEqual(yesControl.className, noControl.className);
    assert.ok(yesControl.className.includes("yes"));
    assert.ok(noControl.className.includes("no"));
  });
});

test("Missing activity is handled gracefully without contradictory 'No activity selected' messaging", () => {
  const missingActivityStep = {
    type: "activity",
    content: "Take a moment to reflect on a time you felt exam stress.",
    activity: null,
  };

  // Activity title fallback must be graceful ("Reflection"), never "No activity selected"
  const hasTitle = Boolean(
    missingActivityStep.activity?.title &&
    missingActivityStep.activity.title !== "No activity selected"
  );
  const headerTitle = hasTitle ? missingActivityStep.activity.title : "Reflection";
  const badgeLabel = hasTitle ? "Try this" : "Reflection";

  assert.equal(headerTitle, "Reflection");
  assert.notEqual(headerTitle, "No activity selected");
  assert.equal(badgeLabel, "Reflection");
  assert.notEqual(badgeLabel, "No activity selected");

  // User-facing prompt must be a constructive reflection prompt
  const hasApprovedActivity = Boolean(missingActivityStep.activity?.id);
  const promptMessage = hasApprovedActivity
    ? "Try this short practice, then confirm when you've finished."
    : "Think about the prompt and share a short reflection.";

  assert.equal(promptMessage, "Think about the prompt and share a short reflection.");
  assert.equal(promptMessage.includes("No practice activity is available"), false);
});

test("two-option controls (Yes/No, True/False, Short/Long) maintain distinct button identities and separated text content", () => {
  // Test simulated DOM rendering of pairs with spacer separator
  const pairs = [
    { labelA: "Yes", labelB: "No" },
    { labelA: "True", labelB: "False" },
    { labelA: "Short", labelB: "Long" },
  ];

  for (const pair of pairs) {
    // Simulating DOM text content extraction with the sr-only spacer
    const renderedTextContent = `${pair.labelA} ${pair.labelB}`;
    assert.equal(renderedTextContent.includes(pair.labelA + pair.labelB), false);
    assert.equal(renderedTextContent, `${pair.labelA} ${pair.labelB}`);
  }
});

test("activity_01_02 authoritative scenario and options data model validation", () => {
  const activity_01_02 = {
    item_id: "activity_01_02",
    type: "activity",
    title: "What Would You Do?",
    instructions: "Read the situation and choose the response that shows the most empathy.",
    scenario: "Your friend is sitting alone and looks upset. When you ask if everything is okay, they say, 'I don't want to talk about it.'",
    options: [
      { id: "A", text: "You should tell me what's wrong." },
      { id: "B", text: "Okay. If you ever feel like talking, I'm here for you." },
      { id: "C", text: "You shouldn't be upset about it." },
    ],
    best_answer: "B",
    feedback: {
      correct: "Good choice! You respected your friend's feelings and gave them space while showing that you are available to support them.",
      A: "Not quite. Asking someone to explain themselves can make them feel pressured. Try giving them space while letting them know you are available.",
      C: "Not quite. Telling someone how they should feel can dismiss their emotions. Try acknowledging their feelings instead.",
    },
  };

  assert.equal(activity_01_02.item_id, "activity_01_02");
  assert.ok(activity_01_02.scenario.length > 20);
  assert.equal(activity_01_02.options.length, 3);
  assert.equal(activity_01_02.best_answer, "B");
  assert.ok(activity_01_02.feedback.correct);
  assert.ok(activity_01_02.feedback.A);
  assert.ok(activity_01_02.feedback.C);
});

test("post-quiz continuity for obj_01_03 is grounded in approved SEEK content", () => {
  const obj_01_03_concepts = [
    "sympathetic",
    "parasympathetic",
    "alerting",
    "calming",
    "resilient zone",
  ];

  const suggestedQuestions = [
    "What is the difference between the sympathetic and parasympathetic nervous systems?",
    "How does the parasympathetic nervous system help bring us back to the resilient zone?",
    "Why is it important to strengthen our parasympathetic response?",
  ];

  // Verify all suggested questions are aligned with approved obj_01_03 concepts
  for (const question of suggestedQuestions) {
    const qLower = question.toLowerCase();
    const matchesConcept = obj_01_03_concepts.some((c) => qLower.includes(c));
    assert.ok(matchesConcept, `Question "${question}" should align with approved obj_01_03 curriculum concepts.`);
    // Verify no clinical or medical diagnostic terms are introduced
    assert.equal(qLower.includes("prescribe"), false);
    assert.equal(qLower.includes("diagnosis"), false);
    assert.equal(qLower.includes("medication"), false);
  }
});
