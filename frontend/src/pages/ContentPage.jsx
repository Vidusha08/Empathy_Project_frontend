//pages/ContentPage.jsx
import React, { useEffect, useState } from 'react';
import SkillCard from '../components/content/SkillCard';
import { SKILLS, MOCK_PROGRESS } from '../utils/skillsData';
import './ContentPage.css';
 
const ContentPage = () => {
  const [progressBySkill, setProgressBySkill] = useState(MOCK_PROGRESS);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    let isMounted = true;
 
    const loadProgress = async () => {
      try {
        // Dynamic import on purpose: while progressApi.js is still being built
        // out, its export shape may not match what we expect below. A dynamic
        // import lets a missing/mismatched export just fall through to the
        // mock data instead of crashing the whole page at load time (which is
        // what a static `import progressApi from '../api/progressApi'` does).
        const mod = await import('../api/progressApi');
        const api = mod.default ?? mod;
 
        // Try the likely method names in order. Once your progressApi.js is
        // finalized, replace this whole block with a direct call, e.g.:
        //   const data = await progressApi.getProgress();
        const fetchFn = api.getProgress || api.getAllSkillProgress || api.fetchProgress;
        if (!fetchFn) {
          console.warn('progressApi has no recognized progress method yet — showing fallback data.');
          return;
        }
 
        const data = await fetchFn();
        if (isMounted && data) setProgressBySkill(data);
      } catch (err) {
        // Keep the mock fallback already in state so the page still renders.
        console.error('Could not load skill progress, showing fallback data.', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
 
    loadProgress();
    return () => {
      isMounted = false;
    };
  }, []);
 
  const completedCount = SKILLS.filter(
    (skill) => progressBySkill[skill.id]?.status === 'completed'
  ).length;
  const startedCount = SKILLS.filter(
    (skill) => (progressBySkill[skill.id]?.status ?? 'not-started') !== 'not-started'
  ).length;
 
  return (
    <div className="content-page">
      <header className="content-page__header">
        {/*<p className="content-page__eyebrow">SEEK curriculum</p>*/}
        <h1 className="content-page__title">Your empathy skills</h1>
        <p className="content-page__subtitle">
          Eight skills from UNESCO's Social Emotional Education: Knowledge to Practice course,
          taken one conversation at a time with your chatbot guide.
        </p>
 
        {/*<div className="content-page__stats">
          <div className="content-page__stat">
            <span className="content-page__stat-number">{completedCount}</span>
            <span className="content-page__stat-label">of 8 completed</span>
          </div>
          <div className="content-page__stat-divider" />
          <div className="content-page__stat">
            <span className="content-page__stat-number">{startedCount}</span>
            <span className="content-page__stat-label">skills started</span>
          </div>
        </div>*/}
      </header>
 
      <div className={`content-page__grid${loading ? ' content-page__grid--loading' : ''}`}>
        {SKILLS.map((skill) => (
          <SkillCard key={skill.id} skill={skill} progress={progressBySkill[skill.id]} />
        ))}
      </div>
    </div>
  );
};
 
export default ContentPage;