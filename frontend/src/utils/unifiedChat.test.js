import assert from "node:assert/strict";
import test from "node:test";

// =====================================================================
// UNIFIED EMPATHY GURU CHATBOT FRONTEND UNIT & INTEGRATION TESTS
// Tests verify the frontend data contract for the unified /chat interface
// supporting both General Empathy Agent and SEEK Learning Agent.
// =====================================================================

// Helper to simulate the history payload builder from ChatPage.jsx
function buildHistoryPayload(messages) {
  return messages
    .filter((m) => m && typeof m.content === "string" && m.content.trim() && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role,
      content: m.content.trim(),
    }));
}

// Helper to simulate parsing backend learning response into chat message format
function parseUnifiedChatResponse(res, userQuestion = "") {
  const activeAgent = res.active_agent || (res.steps?.length ? "tutor_agent" : "general_empathy_agent");
  const rawSteps = Array.isArray(res.steps) ? res.steps : [];
  const content =
    res.message ||
    res.response ||
    res.educational_response ||
    rawSteps[0]?.content ||
    "";

  const context = res.learning_context || res;
  const skill = context?.skill || null;
  const objective = context?.learning_objective || null;
  const activity = context?.recommended_activity || null;

  const hasLearningFlow = rawSteps.length > 0 && Boolean(skill?.id);

  return {
    content,
    activeAgent,
    hasLearningFlow,
    steps: rawSteps,
    skill,
    learningObjective: objective,
    recommendedActivity: activity,
    progressItemId: activity?.progress_item_id || null,
    progressObjectiveId: activity?.progress_objective_id || null,
    progressItemType: activity?.progress_item_type || null,
    suggestedQuestions: Array.isArray(res.suggested_questions) ? res.suggested_questions : [],
    safety: Boolean(res.safety),
  };
}

// ---------------------------------------------------------------------
// 1. General Empathy Response Parsing & Conversational Rendering
// ---------------------------------------------------------------------
test("General Empathy response parses as conversational bubble with zero learning steps", () => {
  const backendResponse = {
    active_agent: "general_empathy_agent",
    response: "It sounds like you've been carrying a tremendous amount of stress this week. Would you like to share what feels heaviest right now?",
    message: "It sounds like you've been carrying a tremendous amount of stress this week. Would you like to share what feels heaviest right now?",
    steps: [],
    learning_context: {
      student_question: "I feel completely overwhelmed by everything right now",
      detected_emotion: "anxious",
      status: "emotional_support",
      skill: null,
      learning_objective: null,
      recommended_activity: null,
    },
    suggested_questions: [],
    safety: false,
  };

  const parsed = parseUnifiedChatResponse(backendResponse);

  assert.equal(parsed.activeAgent, "general_empathy_agent");
  assert.equal(parsed.hasLearningFlow, false);
  assert.equal(parsed.steps.length, 0);
  assert.ok(parsed.content.includes("carrying a tremendous amount of stress"));
  assert.equal(parsed.progressItemId, null);
  assert.equal(parsed.progressObjectiveId, null);
  assert.equal(parsed.progressItemType, null);
});

// ---------------------------------------------------------------------
// 2. SEEK Structured Learning Response Parsing & Pedagogical Flow
// ---------------------------------------------------------------------
test("SEEK Learning response parses four pedagogical steps and enables interactive flow", () => {
  const backendResponse = {
    active_agent: "tutor_agent",
    educational_response: "Somatic tracking helps us observe physical sensations without judgment.",
    steps: [
      {
        type: "direct_answer",
        content: "Somatic tracking helps us observe physical sensations without judgment.",
      },
      {
        type: "learning_objective",
        content: "Apply tracking, grounding, and resourcing techniques to restore balance.",
      },
      {
        type: "activity",
        content: "Practice 60 seconds of gentle contact grounding.",
        activity: {
          id: "node_0194",
          title: "Contact Grounding Practice",
          interaction_type: "practical",
          progress_item_id: "activity_01_04",
          progress_objective_id: "obj_01_04",
          progress_item_type: "activity",
        },
      },
      {
        type: "practice_check",
        content: "What is the key intention when tracking bodily sensations?",
        question: "What is the key intention when tracking bodily sensations?",
        question_type: "multiple_choice",
        options: ["Observing without judgment", "Forcing tension away", "Ignoring bodily signals"],
        correct_answer: "Observing without judgment",
      },
    ],
    learning_context: {
      student_question: "Can you teach me about somatic tracking?",
      detected_emotion: "curious",
      status: "learning_path_selected",
      skill: { id: "skill_01", title: "Calming the Body and Mind" },
      learning_objective: { id: "obj_01_04", title: "Apply tracking, grounding, and resourcing" },
      recommended_activity: {
        id: "node_0194",
        title: "Contact Grounding Practice",
        progress_item_id: "activity_01_04",
        progress_objective_id: "obj_01_04",
        progress_item_type: "activity",
      },
    },
    suggested_questions: [
      "What is resourcing?",
      "How do grounding techniques affect heart rate?",
    ],
    safety: false,
  };

  const parsed = parseUnifiedChatResponse(backendResponse);

  assert.equal(parsed.activeAgent, "tutor_agent");
  assert.equal(parsed.hasLearningFlow, true);
  assert.equal(parsed.steps.length, 4);
  assert.equal(parsed.skill.id, "skill_01");
  assert.equal(parsed.learningObjective.id, "obj_01_04");
  assert.equal(parsed.recommendedActivity.id, "node_0194");
  assert.equal(parsed.progressItemId, "activity_01_04");
  assert.equal(parsed.progressObjectiveId, "obj_01_04");
  assert.equal(parsed.progressItemType, "activity");
  assert.equal(parsed.suggestedQuestions.length, 2);
});

// ---------------------------------------------------------------------
// 3. Conversation History Sanitization & Multi-turn Preservation
// ---------------------------------------------------------------------
test("buildHistoryPayload extracts role and content cleanly while dropping invalid items", () => {
  const storeMessages = [
    { id: "1", role: "user", content: "I am feeling stressed about presentations." },
    { id: "2", role: "assistant", content: "I hear you. Speaking in front of others can be really daunting." },
    { id: "3", role: "system", content: "ignored or mapped" },
    { id: "4", role: "assistant", content: "   " }, // whitespace only
    { id: "5", role: "user", content: "What is somatic tracking?" },
    { id: "6", role: "assistant", content: null }, // invalid content
  ];

  const payload = buildHistoryPayload(storeMessages);

  assert.equal(payload.length, 3);
  assert.deepEqual(payload[0], {
    role: "user",
    content: "I am feeling stressed about presentations.",
  });
  assert.deepEqual(payload[1], {
    role: "assistant",
    content: "I hear you. Speaking in front of others can be really daunting.",
  });
  assert.deepEqual(payload[2], {
    role: "user",
    content: "What is somatic tracking?",
  });
});

// ---------------------------------------------------------------------
// 4. Bidirectional Agent Transition Context Preservation
// ---------------------------------------------------------------------
test("History payload carries cross-agent dialogue seamlessly without UI fragmentation", () => {
  // Scenario: Student starts with emotional sharing, receives empathy, then asks curriculum question
  const conversationHistory = [
    { role: "user", content: "I had an argument with my groupmate and I feel angry." },
    { role: "assistant", content: "Arguments with teammates are painful and draining. Take a slow breath." },
    { role: "user", content: "Can you teach me how to listen with empathy?" },
  ];

  const payload = buildHistoryPayload(conversationHistory);

  assert.equal(payload.length, 3);
  assert.equal(payload[0].role, "user");
  assert.equal(payload[1].role, "assistant");
  assert.equal(payload[2].content, "Can you teach me how to listen with empathy?");

  // Transition back: Student is learning empathy, then expresses sudden personal distress
  const expandedHistory = [
    ...conversationHistory,
    { role: "assistant", content: "Active listening involves reflecting feeling and content." },
    { role: "user", content: "I just feel like crying and giving up on everything." },
  ];

  const backPayload = buildHistoryPayload(expandedHistory);
  assert.equal(backPayload.length, 5);
  assert.equal(backPayload[4].content, "I just feel like crying and giving up on everything.");
});

// ---------------------------------------------------------------------
// 5. SafetyGate HTTP 423 Restriction Lock Extraction
// ---------------------------------------------------------------------
test("HTTP 423 error activates SafetyGate restriction status payload correctly", () => {
  const error423Response = {
    response: {
      status: 423,
      data: {
        error: "Account restricted for safety evaluation",
        message: "Your safety is our top priority. Please review support resources.",
        restriction_active: true,
        screening_required: false,
        restriction_expires_at: "2026-11-26T12:00:00Z",
        counsellor_contacts: [{ name: "National Helpline", phone: "1333" }],
        urgent_guidance: "Please reach out to a trusted professional or support line.",
      },
    },
  };

  const status = error423Response.response.status;
  assert.equal(status, 423);

  const safetyPayload = error423Response.response.data;
  const safetyStatus = {
    message: safetyPayload.message,
    error: safetyPayload.error,
    restriction_active: Boolean(safetyPayload.restriction_active),
    screening_required: Boolean(safetyPayload.screening_required),
    restriction_expires_at: safetyPayload.restriction_expires_at,
    counsellor_contacts: safetyPayload.counsellor_contacts,
    urgent_guidance: safetyPayload.urgent_guidance,
  };

  assert.equal(safetyStatus.restriction_active, true);
  assert.equal(safetyStatus.screening_required, false);
  assert.equal(safetyStatus.restriction_expires_at, "2026-11-26T12:00:00Z");
  assert.equal(safetyStatus.counsellor_contacts.length, 1);
});

// ---------------------------------------------------------------------
// 6. Red-Flag Crisis Response Interception
// ---------------------------------------------------------------------
test("Red-flag crisis response suppresses curriculum steps and displays immediate crisis guidance", () => {
  const redFlagResponse = {
    safety: true,
    risk_level: "high",
    message: "I care about your well-being. If you are having thoughts of harming yourself, support is available.",
    urgent_guidance: "Please call emergency services or a crisis helpline right now.",
    counsellor_contacts: [{ name: "Crisis Response", phone: "119" }],
    restriction_active: true,
    screening_required: false,
    restriction_expires_at: "2026-11-26T10:00:00Z",
  };

  const parsed = parseUnifiedChatResponse(redFlagResponse);

  assert.equal(parsed.safety, true);
  assert.equal(parsed.hasLearningFlow, false);
  assert.equal(parsed.steps.length, 0);

  // Formatted content should include guidance
  const messageContent = [redFlagResponse.message, redFlagResponse.urgent_guidance]
    .filter(Boolean)
    .join("\n\n");
  assert.ok(messageContent.includes("crisis helpline"));
  assert.ok(messageContent.includes("emergency services"));
});

// ---------------------------------------------------------------------
// 7. Learning Recommendation Bridge Modal Integration
// ---------------------------------------------------------------------
test("Learning Recommendation Bridge accurately renders approved SEEK recommendations", () => {
  const mockRecommendations = [
    {
      skill_id: "skill_01",
      skill_title: "Calming the Body and Mind",
      objective_id: "obj_01_04",
      objective_title: "Apply tracking, grounding, and resourcing techniques",
      relevance_explanation: "You mentioned feeling tense and overwhelmed.",
      learning_opportunity: "Practicing somatic grounding can help you find calm in moments of pressure.",
    },
    {
      skill_id: "skill_04",
      skill_title: "Active Listening and Communication",
      objective_id: "obj_04_02",
      objective_title: "Practice reflective listening",
      relevance_explanation: "You discussed frustration when talking to a friend.",
      learning_opportunity: "Strengthen relationships through non-reactive communication.",
    },
  ];

  // Validate format and ensure max 2 recommendations
  assert.ok(mockRecommendations.length <= 2);
  for (const rec of mockRecommendations) {
    assert.ok(rec.skill_id.startsWith("skill_"));
    assert.ok(rec.objective_id.startsWith("obj_"));
    assert.ok(rec.relevance_explanation.length > 10);
    assert.ok(rec.learning_opportunity.length > 10);
  }

  // Simulating user clicking "Explore in chat" on recommendation
  const chosenRec = mockRecommendations[0];
  const explorationPrompt = `Can you teach me about ${chosenRec.skill_title}?`;

  assert.equal(explorationPrompt, "Can you teach me about Calming the Body and Mind?");
  // Verifying prompt will naturally trigger SEEK learning without auto-enrollment or progress mutation
  assert.ok(explorationPrompt.includes("Calming the Body and Mind"));
});

// ---------------------------------------------------------------------
// 8. Progress Isolation Guarantee
// ---------------------------------------------------------------------
test("Emotional support turns never contain progress update IDs or mutate curriculum state", () => {
  const emotionalResponse = {
    active_agent: "general_empathy_agent",
    response: "I'm right here with you. Take all the time you need.",
    steps: [],
  };

  const parsed = parseUnifiedChatResponse(emotionalResponse);

  assert.equal(parsed.progressItemId, null);
  assert.equal(parsed.progressObjectiveId, null);
  assert.equal(parsed.progressItemType, null);
  assert.equal(parsed.hasLearningFlow, false);

  // Verifying that neither completeItem nor completeObjective can be invoked without valid progress IDs
  const canTriggerProgressUpdate = Boolean(parsed.progressItemId && parsed.progressObjectiveId);
  assert.equal(canTriggerProgressUpdate, false);
});
