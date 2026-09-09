import React, { useEffect, useState } from 'react';
import { SKILLS, MOCK_PROGRESS } from '../utils/skillsData';
import progressApi from '../api/progressApi';
import './ProgressPage.css';

const ProgressPage = () => {
  const [progressBySkill, setProgressBySkill] = useState(MOCK_PROGRESS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProgress = async () => {
      try {
        const skillIds = SKILLS.map((skill) => skill.id);
        const data = await progressApi.getAllSkillProgress(skillIds);

        if (isMounted) {
          setProgressBySkill({ ...MOCK_PROGRESS, ...(data || {}) });
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="progress-page">
        <p>Loading your progress...</p>
      </div>
    );
  }

  const totalCompleted = Object.values(progressBySkill).reduce(
    (total, progress) =>
      total + (progress?.completed_objective_ids?.length || 0),
    0
  );

  const skillsStarted = Object.values(progressBySkill).filter(
    (progress) => (progress?.completed_objective_ids?.length || 0) > 0
  ).length;

  const skillsCompleted = SKILLS.filter((skill) => {
    const progress = progressBySkill[skill.id];
    if (!progress) return false;

    const total = skill.totalObjectives || 5;
    const completed = progress.completed_objective_ids?.length || 0;
    return completed >= total;
  }).length;

  const nextSkill = SKILLS.find((skill) => {
    const progress = progressBySkill[skill.id];
    const completed = progress?.completed_objective_ids?.length || 0;
    const total = skill.totalObjectives || 5;
    return completed < total;
  });

  const nextObjective = nextSkill
    ? progressBySkill[nextSkill.id]?.next_recommended_learning_objective
    : null;

  return (
    <div className="progress-page">
      <header className="progress-page__header">
        <h1>Your Learning Progress</h1>
        <p>Track your journey through the empathy skills.</p>
      </header>

      <section className="progress-stats">
        <div className="progress-stat">
          <h3>{totalCompleted}</h3>
          <p>Objectives Completed</p>
        </div>

        <div className="progress-stat">
          <h3>{skillsStarted}</h3>
          <p>Skills Started</p>
        </div>

        <div className="progress-stat">
          <h3>{skillsCompleted}</h3>
          <p>Skills Completed</p>
        </div>
      </section>

      {nextSkill && nextObjective && (
        <section className="continue-learning">
          <h2>Continue Learning</h2>
          <h3>{nextSkill.title}</h3>
          <p>{nextObjective.title}</p>
          <button type="button">Continue</button>
        </section>
      )}

      <section className="skills-progress">
        <h2>Your Empathy Skills</h2>

        <div className="skills-progress__grid">
          {SKILLS.map((skill) => {
            const progress = progressBySkill[skill.id] || {};
            const total = skill.totalObjectives || 5;
            const completed = progress.completed_objective_ids?.length || 0;
            const percent = Math.min(100, Math.round((completed / total) * 100));

            return (
              <div key={skill.id} className="skill-progress-card">
                <div className="skill-progress-card__top">
                  <h3>{skill.title}</h3>
                  <span>{percent}%</span>
                </div>

                <p>{completed} objectives completed</p>

                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ProgressPage;
