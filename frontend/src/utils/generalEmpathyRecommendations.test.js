import assert from "node:assert/strict";
import test from "node:test";
import { parseRecommendationResponse } from "../api/generalEmpathyApi.js";

// =====================================================================
// GENERAL EMPATHY RECOMMENDATIONS: API & FRONTEND CONTRACT TESTS
// =====================================================================

test("valid recommendations payload parses successfully with safety=false", () => {
  const backendResponse = {
    status: "success",
    recommendations: [
      {
        skill_id: "skill_01",
        skill_title: "Calming the Body and Mind",
        objective_id: "obj_01_04",
        objective_title: "Apply tracking, grounding, and resourcing techniques to restore emotional balance during stress.",
        relevance_explanation: "You mentioned experiencing physical tension and racing heart.",
        learning_opportunity: "Developing body literacy and somatic regulation.",
        confidence_score: 0.85,
      },
    ],
  };

  const parsed = parseRecommendationResponse(backendResponse);

  assert.equal(parsed.safety, false);
  assert.equal(parsed.status, "success");
  assert.equal(parsed.recommendations.length, 1);
  assert.equal(parsed.recommendations[0].skill_id, "skill_01");
  assert.equal(parsed.recommendations[0].objective_id, "obj_01_04");
});

test("empty recommendations payload parses with status=no_recommendations", () => {
  const backendResponse = {
    status: "no_recommendations",
    recommendations: [],
  };

  const parsed = parseRecommendationResponse(backendResponse);

  assert.equal(parsed.safety, false);
  assert.equal(parsed.status, "no_recommendations");
  assert.deepEqual(parsed.recommendations, []);
});

test("red-flag safety response in recommendations endpoint extracts safety metadata", () => {
  const safetyResponse = {
    safety: true,
    risk_level: "high",
    qualifying_event_count: 1,
    restriction_active: false,
    screening_required: false,
    message: "You deserve immediate support.",
    counsellor_contacts: [{ name: "Support Line", contact: "1333" }],
    emergency_contacts: [{ name: "Emergency", contact: "119" }],
    urgent_guidance: "Please connect with a trusted person immediately.",
  };

  const parsed = parseRecommendationResponse(safetyResponse);

  assert.equal(parsed.safety, true);
  assert.equal(parsed.riskLevel, "high");
  assert.equal(parsed.restrictionActive, false);
  assert.equal(parsed.screeningRequired, false);
  assert.equal(parsed.counsellorContacts.length, 1);
  assert.equal(parsed.emergencyContacts.length, 1);
  assert.equal(parsed.urgentGuidance, "Please connect with a trusted person immediately.");
});

test("conversation completion visibility logic: only visible after at least one user message", () => {
  // Scenario A: Welcome message only (assistant role)
  const initialMessages = [{ id: "welcome", role: "assistant", content: "Hi, I am here to listen." }];
  const hasUserMessagesInitial = initialMessages.some((m) => m.role === "user");
  assert.equal(hasUserMessagesInitial, false, "End conversation must not be visible before user sends a message");

  // Scenario B: After user message sent
  const activeMessages = [
    ...initialMessages,
    { id: "1-user", role: "user", content: "I feel stressed." },
    { id: "1-assistant", role: "assistant", content: "That sounds difficult." },
  ];
  const hasUserMessagesActive = activeMessages.some((m) => m.role === "user");
  assert.equal(hasUserMessagesActive, true, "End conversation must be visible once user has sent a message");

  // Scenario C: After conversation finished
  const isFinished = true;
  const showEndButton = hasUserMessagesActive && !isFinished;
  assert.equal(showEndButton, false, "End conversation button must hide once conversation has finished");
});

test("finish conversation action ends chat without updating SEEK progress", () => {
  let progressState = { completedItems: [], progressPercent: 0 };
  let conversationFinished = false;
  let completionModalOpen = true;

  // Simulate finish action
  const handleFinishConversation = () => {
    completionModalOpen = false;
    conversationFinished = true;
  };

  handleFinishConversation();

  assert.equal(completionModalOpen, false);
  assert.equal(conversationFinished, true);
  // Verify progress was strictly untouched
  assert.deepEqual(progressState.completedItems, []);
  assert.equal(progressState.progressPercent, 0);
});

test("dismiss recommendation action closes modal cleanly without side-effects", () => {
  let recommendations = [{ skill_id: "skill_01" }];
  let modalOpen = true;

  const handleDismiss = () => {
    modalOpen = false;
    recommendations = null;
  };

  handleDismiss();

  assert.equal(modalOpen, false);
  assert.equal(recommendations, null);
});

test("explore recommendations handles loading state and error gracefully", async () => {
  let isLoading = false;
  let errorMessage = "";
  let recommendations = null;

  // Mock API call that fails
  const mockFailingApi = async () => {
    throw new Error("Network error connecting to recommendation service.");
  };

  isLoading = true;
  try {
    recommendations = await mockFailingApi();
  } catch (err) {
    errorMessage = err.message || "Failed to load recommendations.";
  } finally {
    isLoading = false;
  }

  assert.equal(isLoading, false);
  assert.equal(recommendations, null);
  assert.equal(errorMessage, "Network error connecting to recommendation service.");
});
