//components/content/SkillCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { skillIconMap } from './skillIcons';
import progressApi from '../../api/progressApi';
import './SkillCard.css';
 
const STATUS_LABEL = {
  completed: 'Completed',
  'in-progress': 'In progress',
  'not-started': 'Not started',
};
 
const SkillCard = ({ skill, progress }) => {
  const Icon = skillIconMap[skill.icon];
  const totalObjectives = skill.totalObjectives || 5;
  const completedCount = Array.isArray(progress?.completed_objective_ids)
    ? progress.completed_objective_ids.length
    : progress?.percent && progress.percent >= 100
      ? totalObjectives
      : progress?.percent && progress.percent > 0
        ? Math.max(1, Math.round((progress.percent / 100) * totalObjectives))
        : 0;
  const percent = progress?.percent ?? progressApi.calculateSkillPercentage(progress, totalObjectives);
  const status = progress?.status ?? (completedCount === 0 ? 'not-started' : completedCount >= totalObjectives ? 'completed' : 'in-progress');
 
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
          <span className="skill-card__status">{STATUS_LABEL[status] || 'Not started'}</span>
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
        <div className="skill-card__meta">
          {completedCount} of {totalObjectives} objectives completed
        </div>
      </div>
 
      <Link to={`/chat?skill=${skill.id}`} className="skill-card__cta">
        {status === 'not-started' ? 'Start skill' : status === 'completed' ? 'Review skill' : 'Continue'}
      </Link>
    </article>
  );
};
 
export default SkillCard;