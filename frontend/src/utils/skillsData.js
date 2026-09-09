//utils/skillsData.js 
export const SKILLS = [
  {
    id: 'calm',
    order: 1,
    icon: 'calm',
    color: '#5E85A0',
    title: 'Calming the Body and Mind',
    summary:
      'Simple breathing and grounding practices that settle the nervous system before working with harder emotions.',
  },
  {
    id: 'ethics',
    order: 2,
    icon: 'ethics',
    color: '#3F7368',
    title: 'Ethical Mindfulness',
    summary:
      'Noticing your own values and intentions in the moment, so your actions stay aligned with what matters to you.',
  },
  {
    id: 'awareness',
    order: 3,
    icon: 'awareness',
    color: '#C1694F',
    title: 'Emotional Awareness',
    summary:
      'Naming what you feel as it happens, and recognizing the same feelings as they show up in other people.',
  },
  {
    id: 'self-compassion',
    order: 4,
    icon: 'self-compassion',
    color: '#8C6E99',
    title: 'Self-Compassion',
    summary:
      'Treating your own mistakes and struggles with the same kindness you would offer a good friend.',
  },
  {
    id: 'common-humanity',
    order: 5,
    icon: 'common-humanity',
    color: '#B98A3E',
    title: 'Impartiality and Common Humanity',
    summary:
      'Extending care evenly, and remembering that everyone shares the same basic wish to be happy and free from suffering.',
  },
  {
    id: 'forgiveness',
    order: 6,
    icon: 'forgiveness',
    color: '#6B8F5E',
    title: 'Forgiveness and Gratitude',
    summary:
      'Letting go of resentment at your own pace, and noticing what is already good, safe, or supportive around you.',
  },
  {
    id: 'empathic-concern',
    order: 7,
    icon: 'empathic-concern',
    color: '#BD5F73',
    title: 'Empathic Concern',
    summary:
      "Tuning in to someone else's distress and genuinely caring about their wellbeing, without taking it on as your own.",
  },
  {
    id: 'compassion',
    order: 8,
    icon: 'compassion',
    color: '#6E5A96',
    title: 'Compassion',
    summary:
      'Turning empathic concern into action — the wish, and the willingness, to actually help.',
  },
];
 
// Fallback progress used only if the API call fails, so the page never
// renders empty. Real values should come from GET /progress (progressApi.js).
export const MOCK_PROGRESS = {
  calm: { percent: 100, status: 'completed' },
  ethics: { percent: 60, status: 'in-progress' },
  awareness: { percent: 25, status: 'in-progress' },
  'self-compassion': { percent: 0, status: 'not-started' },
  'common-humanity': { percent: 0, status: 'not-started' },
  forgiveness: { percent: 0, status: 'not-started' },
  'empathic-concern': { percent: 0, status: 'not-started' },
  compassion: { percent: 0, status: 'not-started' },
};