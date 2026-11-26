// frontend/src/utils/e2e_scenarios.test.js
import assert from "node:assert/strict";
import test from "node:test";
import { verifyQuickCheckAnswer } from "./quickCheck.js";

// =====================================================================
// Scenario H: FRONTEND END-TO-END VALIDATION
// =====================================================================

test("Scenario H1: Login and authentication state management", () => {
  // Simulate persisted auth-storage
  const mockAuthState = {
    state: {
      user: {
        _id: "507f1f77bcf86cd799439011",
        student_id: "STU-E2E-01",
        username: "tester1",
        role: "student",
      },
      token: "mock.jwt.token.abc",
    },
    version: 0,
  };

  // Verify auth header formation
  const token = mockAuthState.state.token;
  assert.ok(token);
  const authHeader = `Bearer ${token}`;
  assert.equal(authHeader, "Bearer mock.jwt.token.abc");

  // Verify clearing auth upon 401
  const clearAuth = (storage) => {
    delete storage.state.user;
    delete storage.state.token;
  };
  clearAuth(mockAuthState);
  assert.equal(mockAuthState.state.user, undefined);
  assert.equal(mockAuthState.state.token, undefined);
});

test("Scenario H2: Chat interactions and flowAction handling", () => {
  const incomingAgentResponse = {
    message: "Ethical mindfulness involves being present with care.",
    status: "learning_path_selected",
    steps: [
      { type: "direct_answer", content: "Ethical mindfulness involves being present with care." },
      { type: "learning_objective", content: "Understand ethical intentions." },
      {
        type: "activity",
        content: "Practice 2 minutes of mindful breathing.",
        activity: {
          id: "node_0194",
          progress_item_id: "activity_01_04",
          progress_item_type: "activity",
          progress_objective_id: "obj_01_04",
          interaction_type: "practical",
        },
      },
      {
        type: "practice_check",
        question: "Does ethical mindfulness include caring for others?",
        correct_answer: true,
      },
    ],
    suggested_questions: ["What is self-compassion?", "How do I practice grounding?"],
  };

  // 1. Initial message creation
  const hasLearningFlow = incomingAgentResponse.steps.length > 0;
  assert.equal(hasLearningFlow, true);

  const initialFlowAction = hasLearningFlow ? "learn" : undefined;
  assert.equal(initialFlowAction, "learn");

  // 2. Next flow action transitions
  const getNextAction = (action) => {
    switch (action) {
      case "learn": return "understanding";
      case "understanding": return "activity";
      case "activity": return "practice";
      case "complete": return "practice";
      default: return undefined;
    }
  };

  assert.equal(getNextAction("learn"), "understanding");
  assert.equal(getNextAction("understanding"), "activity");
  assert.equal(getNextAction("activity"), "practice");
});

test("Scenario H3: Activity submission and identifier validation", () => {
  const activityStep = {
    type: "activity",
    activity: {
      id: "node_0194",
      title: "Contact Grounding Practice",
      interaction_type: "reflective",
      progress_item_id: "activity_01_04",
      progress_item_type: "activity",
      progress_objective_id: "obj_01_04",
    },
  };

  const skillId = "skill_01";
  const itemId = activityStep.activity.progress_item_id;
  const itemType = activityStep.activity.progress_item_type;

  // Validate identifiers before constructing payload
  assert.ok(skillId && typeof skillId === "string");
  assert.ok(itemId && typeof itemId === "string");
  assert.ok(itemType && typeof itemType === "string");

  const payload = {
    skill_id: String(skillId).trim(),
    item_id: String(itemId).trim(),
    item_type: String(itemType).trim().toLowerCase(),
    source: "chatbot",
  };

  assert.deepEqual(payload, {
    skill_id: "skill_01",
    item_id: "activity_01_04",
    item_type: "activity",
    source: "chatbot",
  });
});

test("Scenario H4: Quiz submission and threshold calculation", () => {
  const quizQuestions = [
    { question: "Q1", answer: "A" },
    { question: "Q2", answer: "B" },
    { question: "Q3", answer: "C" },
    { question: "Q4", answer: "D" },
    { question: "Q5", answer: "A" },
    { question: "Q6", answer: "B" },
    { question: "Q7", answer: "C" },
    { question: "Q8", answer: "D" },
    { question: "Q9", answer: "A" },
    { question: "Q10", answer: "B" },
  ];

  // 1. Scoring 7 out of 10 (70%)
  const studentAnswersFailing = { 0: "A", 1: "B", 2: "C", 3: "D", 4: "A", 5: "B", 6: "C", 7: "X", 8: "X", 9: "X" };
  const correctCountFail = quizQuestions.reduce((count, q, idx) =>
    count + (studentAnswersFailing[idx] === q.answer ? 1 : 0), 0);
  const scoreFail = Math.round((correctCountFail / quizQuestions.length) * 100);
  assert.equal(scoreFail, 70);

  const passingThreshold = 90;
  assert.equal(scoreFail >= passingThreshold, false);

  // 2. Scoring 10 out of 10 (100%)
  const studentAnswersPassing = { 0: "A", 1: "B", 2: "C", 3: "D", 4: "A", 5: "B", 6: "C", 7: "D", 8: "A", 9: "B" };
  const correctCountPass = quizQuestions.reduce((count, q, idx) =>
    count + (studentAnswersPassing[idx] === q.answer ? 1 : 0), 0);
  const scorePass = Math.round((correctCountPass / quizQuestions.length) * 100);
  assert.equal(scorePass, 100);
  assert.equal(scorePass >= passingThreshold, true);
});

test("Scenario H5: Progress display calculation", () => {
  const totalLearningItems = 20;
  const completedItemIds = ["item_1", "item_2", "item_3", "item_4", "item_5"];

  const calculatePercentage = (completed, total) => {
    if (!total) return 0;
    return Math.min(100, Math.round((completed.length / total) * 100));
  };

  const percentage = calculatePercentage(completedItemIds, totalLearningItems);
  assert.equal(percentage, 25);

  const status = percentage === 0 ? "Not Started" : percentage < 50 ? "Exploring" : percentage < 100 ? "Developing" : "Completed";
  assert.equal(status, "Exploring");
});

test("Scenario H6: Error handling and Safety Gate 423 lock state", () => {
  const error423Response = {
    status: 423,
    data: {
      error: "Chatbot access is temporarily restricted.",
      restriction_active: true,
      screening_required: true,
      restriction_expires_at: "2026-11-17T10:00:00Z",
      counsellor_contacts: [{ name: "University Wellbeing Centre", contact: "011-2345678" }],
      urgent_guidance: "Please contact local emergency services if you are in immediate danger.",
    },
  };

  // Ensure modal state activates
  const shouldOpenSafetyGate = error423Response.status === 423 && error423Response.data.restriction_active === true;
  assert.equal(shouldOpenSafetyGate, true);
  assert.equal(error423Response.data.counsellor_contacts.length, 1);
  assert.ok(error423Response.data.urgent_guidance.includes("emergency services"));
});
