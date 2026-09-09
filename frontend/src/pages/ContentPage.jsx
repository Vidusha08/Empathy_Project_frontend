import React, { useEffect, useState } from 'react';
import SkillCard from '../components/content/SkillCard';
import { SKILLS, MOCK_PROGRESS } from '../utils/skillsData';
import progressApi from '../api/progressApi';
import './ContentPage.css';

const ContentPage = () => {
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
        console.error(
          'Could not load skill progress. Showing fallback data.',
          error
        );
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

  const completedCount = SKILLS.filter(
    (skill) => {
      const progress = progressBySkill[skill.id];
      const completed = progress?.completed_objective_ids?.length || 0;
      return completed >= (skill.totalObjectives || 5);
    }
  ).length;

  const startedCount = SKILLS.filter((skill) => {
    const progress = progressBySkill[skill.id];
    const completed = progress?.completed_objective_ids?.length || 0;
    return completed > 0;
  }).length;

  return (
    <div className="content-page">
      <header className="content-page__header">
        <h1 className="content-page__title">Your empathy skills</h1>

        <p className="content-page__subtitle">
          Eight skills from UNESCO's Social Emotional Education:
          Knowledge to Practice course, taken one conversation at a
          time with your chatbot guide.
        </p>

        <div className="content-page__stats">
          <div className="content-page__stat">
            <span className="content-page__stat-number">{completedCount}</span>
            <span className="content-page__stat-label">of {SKILLS.length} completed</span>
          </div>

          <div className="content-page__stat-divider" />

          <div className="content-page__stat">
            <span className="content-page__stat-number">{startedCount}</span>
            <span className="content-page__stat-label">skills started</span>
          </div>
        </div>
      </header>

      <div
        className={`content-page__grid${
          loading ? ' content-page__grid--loading' : ''
        }`}
      >
        {SKILLS.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            progress={progressBySkill[skill.id]}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentPage;
