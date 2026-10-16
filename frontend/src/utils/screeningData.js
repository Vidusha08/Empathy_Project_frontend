// src/utils/screeningData.js
// Questionnaire content. Replace the English wording with the validated
// Sinhala / Tamil PHQ-9 and GAD-7 versions before the real study.
 
export const FREQUENCY_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];
 
export const FUNCTION_OPTIONS = [
  { value: 0, label: "Not difficult" },
  { value: 1, label: "Somewhat difficult" },
  { value: 2, label: "Very difficult" },
  { value: 3, label: "Extremely difficult" },
];
 
export const PHQ9_ITEMS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself, or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things",
  "Moving or speaking so slowly that others noticed, or being so fidgety or restless that you move around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];
 
export const PHQ9_FUNCTION_TEXT =
  "How difficult have these problems made it to do your work, take care of things at home, or get along with people?";
 
export const GAD7_ITEMS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];
 
export const ASQ_ITEMS = [
  "In the past few weeks, have you wished you were dead?",
  "In the past few weeks, have you felt that you or your family would be better off if you were dead?",
  "In the past week, have you been having thoughts about killing yourself?",
  "Have you ever tried to kill yourself?",
];
 
export const ASQ_NOW_TEXT = "Are you having thoughts of killing yourself right now?";
 
export const YES_NO = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];
 
export const CONTEXT_ITEMS = [
  {
    id: "in_care",
    text: "Are you currently seeing a counselor, therapist, or doctor for your mental health?",
    options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
  },
  {
    id: "recent_crisis",
    text: "In the past month, have you experienced a major loss, trauma, or crisis?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not", label: "Prefer not to say" },
    ],
  },
  {
    id: "substance_coping",
    text: "Do you use alcohol or other substances to cope?",
    options: [
      { value: "never", label: "Never" },
      { value: "sometimes", label: "Sometimes" },
      { value: "often", label: "Often" },
    ],
  },
  {
    id: "feels_safe",
    text: "Do you feel safe in your current living situation?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "prefer_not", label: "Prefer not to say" },
    ],
  },
];
 
// VERIFY every number below with the service before shipping.
export const CRISIS_RESOURCES = [
  { name: "National Mental Health Helpline", contact: "1333" },
  { name: "Sumithrayo (emotional support)", contact: "011 2682 535" },
  { name: "Emergency ambulance (Suwa Seriya)", contact: "1990" },
  { name: "Police emergency", contact: "119" },
];

// ---- Screening risk rule (must match backend/registration_assessment.py) ----
export const RED_PHQ9_MIN = 20;
export const RED_GAD7_MIN = 15;

const sum = (arr) => arr.reduce((a, v) => a + (v ?? 0), 0);

// true => the student should be shown counseling support instead of continuing
export const isNotSuitable = ({ phq9, gad7, asq }) =>
  asq.some((v) => v === true) ||
  sum(phq9) >= RED_PHQ9_MIN ||
  sum(gad7) >= RED_GAD7_MIN;