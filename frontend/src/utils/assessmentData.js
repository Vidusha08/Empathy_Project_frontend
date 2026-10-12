// src/utils/assessmentData.js
// Pre-skill assessment content. Correct answers live ONLY on the backend
// (backend/registration_assessment.py) so they never reach the browser.

export const PRE_SKILL_NOTE =
  "This assessment is only for our research purposes. Please answer on your own, using your own knowledge. There are no marks shown and no one is judging your answers.";

export const QUESTIONS_PER_PAGE = 5;

export const PRE_SKILL_QUESTIONS = [
  // Calming the Body and Mind
  {
    id: "q01",
    text: "Before an exam you notice a racing heart and tense shoulders. Which first response best helps your body settle?",
    options: [
      { id: "a", label: "Tell yourself to simply stop feeling nervous" },
      { id: "b", label: "Drink a strong coffee to feel more alert" },
      { id: "c", label: "Slow your breathing, making the out-breath longer than the in-breath" },
      { id: "d", label: "Skip studying and distract yourself with your phone" },
    ],
  },
  {
    id: "q02",
    text: "Why is it helpful to calm your body before responding to someone who has upset you?",
    options: [
      { id: "a", label: "It gives you space to think instead of reacting automatically" },
      { id: "b", label: "It makes the other person realise they are wrong" },
      { id: "c", label: "It makes your feelings disappear completely" },
      { id: "d", label: "It lets you avoid the conversation altogether" },
    ],
  },
  {
    id: "q03",
    text: "Which of these is an example of a grounding practice?",
    options: [
      { id: "a", label: "Replaying the argument over and over in your mind" },
      { id: "b", label: "Pushing unpleasant thoughts away by force" },
      { id: "c", label: "Planning what you will say to win the next argument" },
      { id: "d", label: "Noticing five things you can see, hear or feel right now" },
    ],
  },
  // Ethical Mindfulness
  {
    id: "q04",
    text: "What does ethical mindfulness involve?",
    options: [
      { id: "a", label: "Focusing only on reaching your own goals" },
      { id: "b", label: "Noticing your thoughts and actions with awareness of how they affect yourself and others" },
      { id: "c", label: "Avoiding all difficult emotions" },
      { id: "d", label: "Following rules without thinking about them" },
    ],
  },
  {
    id: "q05",
    text: "You notice an urge to share a classmate's private secret to get a laugh. What is the most mindful and ethical response?",
    options: [
      { id: "a", label: "Share it quietly with just one person" },
      { id: "b", label: "Share it, because it is true" },
      { id: "c", label: "Pause, notice the urge, think about how it would affect them, and choose not to share it" },
      { id: "d", label: "Tell yourself it does not matter" },
    ],
  },
  {
    id: "q06",
    text: "Which best shows awareness of your values in daily life?",
    options: [
      { id: "a", label: "Acting on your first impulse" },
      { id: "b", label: "Doing whatever most people around you do" },
      { id: "c", label: "Avoiding decisions whenever possible" },
      { id: "d", label: "Pausing to ask whether a choice fits what you value and how it affects others" },
    ],
  },
  // Emotional Awareness
  {
    id: "q07",
    text: "A friend says \"I'm fine\" in a flat voice while looking at the floor. What is the best way to understand this?",
    options: [
      { id: "a", label: "Take their words at face value and move on" },
      { id: "b", label: "Their words and body language may not match, so gently check in" },
      { id: "c", label: "They are lying and should be confronted" },
      { id: "d", label: "Ignore it, because feelings are private" },
    ],
  },
  {
    id: "q08",
    text: "What is the main benefit of naming your emotion (for example, \"I feel disappointed\")?",
    options: [
      { id: "a", label: "It makes the emotion stronger" },
      { id: "b", label: "It proves you are weak" },
      { id: "c", label: "It helps you understand the feeling and respond more wisely" },
      { id: "d", label: "It stops other people from noticing how you feel" },
    ],
  },
  {
    id: "q09",
    text: "Which is an example of recognising a body signal of emotion?",
    options: [
      { id: "a", label: "Noticing a tight chest and realising you may be feeling anxious" },
      { id: "b", label: "Deciding that you never feel anything in your body" },
      { id: "c", label: "Believing emotions only happen in the mind" },
      { id: "d", label: "Ignoring a headache because you are busy" },
    ],
  },
  // Self-Compassion
  {
    id: "q10",
    text: "You failed a test you studied hard for. Which inner response is most self-compassionate?",
    options: [
      { id: "a", label: "\"I'm stupid and I'll never get this.\"" },
      { id: "b", label: "\"I shouldn't care about this at all.\"" },
      { id: "c", label: "\"This is painful, and many people struggle sometimes. What can I learn, and what do I need right now?\"" },
      { id: "d", label: "\"I'll pretend it never happened.\"" },
    ],
  },
  {
    id: "q11",
    text: "How is self-compassion different from self-indulgence?",
    options: [
      { id: "a", label: "It excuses every mistake" },
      { id: "b", label: "It means avoiding responsibility" },
      { id: "c", label: "It means lowering your goals" },
      { id: "d", label: "It treats you kindly while still caring about your growth" },
    ],
  },
  {
    id: "q12",
    text: "Which of these is a core part of self-compassion?",
    options: [
      { id: "a", label: "Recognising that struggling and making mistakes is part of being human" },
      { id: "b", label: "Believing you are the only one who fails" },
      { id: "c", label: "Criticising yourself so you do better next time" },
      { id: "d", label: "Hiding your feelings from everyone" },
    ],
  },
  // Impartiality and Common Humanity
  {
    id: "q13",
    text: "Which statement best reflects common humanity?",
    options: [
      { id: "a", label: "People I like deserve care, but others do not" },
      { id: "b", label: "Everyone, like me, wants to be happy and to avoid suffering" },
      { id: "c", label: "Only people from my own community share my feelings" },
      { id: "d", label: "Other people's problems are not related to me at all" },
    ],
  },
  {
    id: "q14",
    text: "A new student from a different background is sitting alone. What is the most impartial response?",
    options: [
      { id: "a", label: "Ignore them and assume they will adjust" },
      { id: "b", label: "Include them only if other popular students do" },
      { id: "c", label: "Judge them by your first impression" },
      { id: "d", label: "Include them as you would anyone, regardless of background" },
    ],
  },
  // Forgiveness and Gratitude
  {
    id: "q15",
    text: "Which best describes forgiveness?",
    options: [
      { id: "a", label: "Saying that what happened was perfectly fine" },
      { id: "b", label: "Forgetting that it ever happened" },
      { id: "c", label: "Letting go of resentment for your own wellbeing, without necessarily excusing the harm" },
      { id: "d", label: "Always going back to the same relationship as before" },
    ],
  },
  {
    id: "q16",
    text: "How can practising gratitude help us?",
    options: [
      { id: "a", label: "By helping us compare ourselves with others" },
      { id: "b", label: "By helping us ignore our problems" },
      { id: "c", label: "By creating a duty to repay everyone who helps us" },
      { id: "d", label: "By turning our attention to what is good and supportive, which can improve wellbeing and relationships" },
    ],
  },
  // Empathic Concern
  {
    id: "q17",
    text: "A friend tells you their pet has died. Which response best shows empathic concern?",
    options: [
      { id: "a", label: "\"It's just a pet.\"" },
      { id: "b", label: "\"At least you can get a new one.\"" },
      { id: "c", label: "\"I'm so sorry. That sounds really painful. I'm here if you want to talk.\"" },
      { id: "d", label: "Quickly change the subject to something cheerful" },
    ],
  },
  {
    id: "q18",
    text: "How does empathic concern differ from personal distress?",
    options: [
      { id: "a", label: "In empathic concern you feel overwhelmed and withdraw" },
      { id: "b", label: "In empathic concern you feel caring and want to help while staying balanced" },
      { id: "c", label: "In empathic concern you feel nothing at all" },
      { id: "d", label: "In empathic concern you take on the other person's pain completely" },
    ],
  },
  // Compassion
  {
    id: "q19",
    text: "Which best describes compassion?",
    options: [
      { id: "a", label: "Noticing suffering, wishing to relieve it, and taking helpful action where possible" },
      { id: "b", label: "Feeling sorry for someone from a distance" },
      { id: "c", label: "Solving other people's problems for them without asking" },
      { id: "d", label: "Avoiding people who are in pain" },
    ],
  },
  {
    id: "q20",
    text: "A classmate is being left out and teased in an online group chat. What is the most compassionate action?",
    options: [
      { id: "a", label: "Stay silent and watch" },
      { id: "b", label: "Join in so you are not the next target" },
      { id: "c", label: "Tell them to toughen up" },
      { id: "d", label: "Reach out to them privately, support them, and speak up or tell a trusted adult" },
    ],
  },
];