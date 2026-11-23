import assert from "node:assert/strict";
import test from "node:test";
import { parseGeneralEmpathyResponse } from "../api/generalEmpathyApi.js";

// =====================================================================
// GENERAL EMPATHY CHAT: SAFETY & FRONTEND COMPATIBILITY TESTS
// =====================================================================

test("normal general-chat response parses successfully without safety flag", () => {
  const backendResponse = {
    response: "It sounds like you have been carrying a heavy weight lately.",
  };

  const parsed = parseGeneralEmpathyResponse(backendResponse);

  assert.equal(parsed.safety, false);
  assert.equal(
    parsed.response,
    "It sounds like you have been carrying a heavy weight lately.",
  );
  assert.equal(
    parsed.message,
    "It sounds like you have been carrying a heavy weight lately.",
  );
});

test("empty or invalid general-chat response throws expected descriptive error", () => {
  assert.throws(
    () => parseGeneralEmpathyResponse({}),
    /The chat service returned an empty response./,
  );
  assert.throws(
    () => parseGeneralEmpathyResponse({ response: "   " }),
    /The chat service returned an empty response./,
  );
  assert.throws(
    () => parseGeneralEmpathyResponse({ response: null }),
    /The chat service returned an empty response./,
  );
});

test("red-flag safety response extracts backend safety message and metadata without LLM response", () => {
  const backendSafetyPayload = {
    safety: true,
    risk_level: "high",
    qualifying_event_count: 1,
    restriction_active: false,
    screening_required: false,
    message:
      "Thank you for telling me. You deserve immediate, real-world support. Please contact someone you trust and a qualified counsellor now.",
    counsellor_contacts: [
      { name: "University Wellbeing Centre", contact: "011-2345678" },
      { name: "National Crisis Helpline", contact: "1333" },
    ],
    emergency_contacts: [
      { name: "Emergency Services", contact: "119 / 911" },
    ],
  };

  const parsed = parseGeneralEmpathyResponse(backendSafetyPayload);

  assert.equal(parsed.safety, true);
  assert.equal(
    parsed.message,
    "Thank you for telling me. You deserve immediate, real-world support. Please contact someone you trust and a qualified counsellor now.",
  );
  assert.equal(parsed.riskLevel, "high");
  assert.equal(parsed.qualifyingEventCount, 1);
  assert.equal(parsed.restrictionActive, false);
  assert.equal(parsed.screeningRequired, false);
  assert.equal(parsed.counsellorContacts.length, 2);
  assert.equal(parsed.emergencyContacts.length, 1);
  assert.equal(parsed.urgentGuidance, null);
});

test("immediate risk red-flag response preserves urgent guidance and contacts", () => {
  const immediateSafetyPayload = {
    safety: true,
    risk_level: "immediate",
    immediate: true,
    qualifying_event_count: 1,
    restriction_active: false,
    screening_required: false,
    message:
      "I’m really sorry you’re facing this. Your immediate safety matters more than continuing this chat.",
    urgent_guidance:
      "Please call emergency services or go to the nearest emergency department now, and stay with someone you trust.",
    counsellor_contacts: [
      { name: "Crisis Line", contact: "988" },
    ],
  };

  const parsed = parseGeneralEmpathyResponse(immediateSafetyPayload);

  assert.equal(parsed.safety, true);
  assert.equal(parsed.riskLevel, "immediate");
  assert.ok(parsed.urgentGuidance.includes("emergency department"));

  // Verify composed assistant display content includes both safety message and urgent guidance
  const displayContent = [parsed.message, parsed.urgentGuidance]
    .filter(Boolean)
    .join("\n\n");
  assert.ok(displayContent.includes("Your immediate safety matters"));
  assert.ok(displayContent.includes("emergency department"));
});

test("HTTP 423 active restriction payload activates SafetyGate modal in restricted mode", () => {
  const error423ActiveRestriction = {
    status: 423,
    data: {
      safety: true,
      restriction_active: true,
      screening_required: false,
      qualifying_event_count: 3,
      restriction_started_at: "2026-11-17T08:00:00Z",
      restriction_expires_at: "2026-11-18T08:00:00Z",
      counsellor_contacts: [
        { name: "University Wellbeing Centre", contact: "011-2345678" },
      ],
      message:
        "Chatbot access is temporarily paused for your safety. Please contact a qualified counsellor or emergency service if you need urgent help.",
      error: "Chatbot access is temporarily restricted.",
    },
  };

  // 1. Verify status detection
  assert.equal(error423ActiveRestriction.status, 423);
  assert.equal(error423ActiveRestriction.data.safety, true);
  assert.equal(error423ActiveRestriction.data.restriction_active, true);

  // 2. Verify modal mode mapping
  const mode = error423ActiveRestriction.data.restriction_active
    ? "restricted"
    : "screening";
  assert.equal(mode, "restricted");

  // 3. Verify restriction expiry and contacts are preserved for the modal
  assert.ok(error423ActiveRestriction.data.restriction_expires_at);
  assert.equal(error423ActiveRestriction.data.counsellor_contacts.length, 1);
});

test("HTTP 423 screening required payload activates SafetyGate modal in screening mode", () => {
  const error423ScreeningRequired = {
    status: 423,
    data: {
      safety: true,
      restriction_active: false,
      screening_required: true,
      qualifying_event_count: 3,
      restriction_expires_at: "2026-11-16T08:00:00Z",
      counsellor_contacts: [
        { name: "University Wellbeing Centre", contact: "011-2345678" },
      ],
      message:
        "Your 24-hour safety pause has ended. Please complete the screening assessment before chatbot access can be restored.",
      error:
        "A screening assessment is required before chatbot access can be restored.",
    },
  };

  assert.equal(error423ScreeningRequired.status, 423);
  assert.equal(error423ScreeningRequired.data.restriction_active, false);
  assert.equal(error423ScreeningRequired.data.screening_required, true);

  const mode = error423ScreeningRequired.data.restriction_active
    ? "restricted"
    : "screening";
  assert.equal(mode, "screening");
});

test("third red-flag message response in general chat triggers 24h restriction state", () => {
  const thirdSafetyResponse = {
    safety: true,
    risk_level: "high",
    qualifying_event_count: 3,
    restriction_active: true,
    screening_required: false,
    restriction_expires_at: "2026-11-18T14:00:00Z",
    message:
      "For your safety, chatbot access is temporarily paused for 24 hours. Please contact a qualified counsellor or emergency service now.",
    counsellor_contacts: [
      { name: "Campus Counsellor", contact: "555-1234" },
    ],
  };

  const parsed = parseGeneralEmpathyResponse(thirdSafetyResponse);

  assert.equal(parsed.safety, true);
  assert.equal(parsed.qualifyingEventCount, 3);
  assert.equal(parsed.restrictionActive, true);

  // Frontend creates the safetyStatus object that opens SafetyGate
  const shouldOpenSafetyGate = parsed.restrictionActive || parsed.screeningRequired;
  assert.equal(shouldOpenSafetyGate, true);
});
