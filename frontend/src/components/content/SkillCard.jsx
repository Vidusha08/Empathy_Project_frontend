//components/content/SkillCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { skillIconMap } from './skillIcons';
import './SkillCard.css';
 
const STATUS_LABEL = {
  completed: 'Completed',
  'in-progress': 'In progress',
  'not-started': 'Not started',
};
 
const SkillCard = ({ skill, progress }) => {
  const Icon = skillIconMap[skill.icon];
  const percent = Math.max(0, Math.min(100, progress?.percent ?? 0));
  const status = progress?.status ?? 'not-started';
 
  return (
    <article className="skill-card" style={{ '--accent': skill.color }}>
      <div className="skill-card__top">
        <span className="skill-card__order">{String(skill.order).padStart(2, '0')}</span>
        <span className="skill-card__icon">
          <Icon />
        </span>
      </div>
 
      <h3 className="skill-card__title">{skill.title}</h3>
      <p className="skill-card__summary">{skill.summary}</p>
 
      <div className="skill-card__progress">
        <div className="skill-card__progress-row">
          <span className="skill-card__status">{STATUS_LABEL[status]}</span>
          <span className="skill-card__percent">{percent}%</span>
        </div>
        <div
          className="skill-card__track"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${skill.title} progress`}
        >
          <div className="skill-card__fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
 
      <Link to={`/chat?skill=${skill.id}`} className="skill-card__cta">
        {status === 'not-started' ? 'Start skill' : status === 'completed' ? 'Review skill' : 'Continue'}
      </Link>
    </article>
  );
};
 
export default SkillCard;