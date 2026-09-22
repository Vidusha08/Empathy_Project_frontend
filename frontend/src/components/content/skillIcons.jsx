//components/content/skillIcons.jsx
import React from 'react';
 
// Shared defaults so every icon reads as one family: 1.5px stroke, round caps, no fill.
const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};
 
// 1. Calming the Body and Mind — a breath moving outward through soft rings
export const IconCalm = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="2.2" />
    <circle cx="12" cy="12" r="6" opacity="0.6" />
    <circle cx="12" cy="12" r="9.5" opacity="0.3" />
  </svg>
);
 
// 2. Ethical Mindfulness — a compass, steady orientation toward what's right
export const IconEthics = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.2 8.8 13 13l-4.2 2.2L11 11l4.2-2.2Z" />
  </svg>
);
 
// 3. Emotional Awareness — noticing the shape of a feeling as it moves through
export const IconAwareness = (props) => (
  <svg {...base} {...props}>
    <path d="M12 20.2c-4.4-3-8-6.4-8-10.4A4.6 4.6 0 0 1 8.6 5.2 4.9 4.9 0 0 1 12 6.8a4.9 4.9 0 0 1 3.4-1.6A4.6 4.6 0 0 1 20 9.8c0 4-3.6 7.4-8 10.4Z" />
    <path d="M4.5 12h3l1.5-2.6L11 15l1.6-4.8L14 12h5.5" opacity="0.65" />
  </svg>
);
 
// 4. Self-Compassion — hands cupped gently around one's own center
export const IconSelfCompassion = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="9.5" r="2.6" />
    <path d="M3.5 15.5c1.6-1.4 3.4-2 5-1.2 1 .5 2.5.5 3.5 0 1.6-.8 3.4-.2 5 1.2" />
    <path d="M3.5 15.5c0 3 3.8 4.6 8.5 4.6s8.5-1.6 8.5-4.6" opacity="0.5" />
  </svg>
);
 
// 5. Impartiality and Common Humanity — separate circles, evenly held, overlapping as one
export const IconCommonHumanity = (props) => (
  <svg {...base} {...props}>
    <circle cx="7.5" cy="12" r="5" />
    <circle cx="16.5" cy="12" r="5" opacity="0.55" />
  </svg>
);
 
// 6. Forgiveness and Gratitude — an open hand releasing, light rising above it
export const IconForgiveness = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="5.5" r="1.6" />
    <path d="M12 8.4v1.4M8.6 9.3l.9 1.1M15.4 9.3l-.9 1.1" opacity="0.6" />
    <path d="M4.5 18.5c1.8-3 4.7-4.8 7.5-4.8s5.7 1.8 7.5 4.8" />
  </svg>
);
 
// 7. Empathic Concern — one heart leaning in to meet another
export const IconEmpathicConcern = (props) => (
  <svg {...base} {...props}>
    <path d="M9.2 17.5C6 15.3 3.6 13 3.6 10.2a3.6 3.6 0 0 1 6.4-2.3 3.6 3.6 0 0 1 1.3-.2" opacity="0.55" />
    <path d="M13.3 19.6c-3.6-2.4-6.3-5-6.3-8.2a3.9 3.9 0 0 1 7-2.4 3.9 3.9 0 0 1 7-2.4 3.9 3.9 0 0 1 .5 4.6" />
  </svg>
);
 
// 8. Compassion — a full heart held steady inside open hands
export const IconCompassion = (props) => (
  <svg {...base} {...props}>
    <path d="M12 15.2c-3-2-5.2-4-5.2-6.6a3.3 3.3 0 0 1 5.2-2.6 3.3 3.3 0 0 1 5.2 2.6c0 2.6-2.2 4.6-5.2 6.6Z" />
    <path d="M3.8 16.8c1.6-1.3 3.3-1.9 4.8-1.1M19.4 16.8c-1.6-1.3-3.3-1.9-4.8-1.1" opacity="0.55" />
  </svg>
);
 
export const skillIconMap = {
  calm: IconCalm,
  ethics: IconEthics,
  awareness: IconAwareness,
  'self-compassion': IconSelfCompassion,
  'common-humanity': IconCommonHumanity,
  forgiveness: IconForgiveness,
  'empathic-concern': IconEmpathicConcern,
  compassion: IconCompassion,
};