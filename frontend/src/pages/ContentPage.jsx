//pages/ContentPage.jsx
import React, { useEffect, useState } from 'react';
import { Check, Circle, LoaderCircle } from 'lucide-react';
import progressApi from '../api/progressApi';
import './ContentPage.css';

const ContentPage = () => {
  const [structure, setStructure] = useState(null);
  const [progressBySkill, setProgressBySkill] = useState({});
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [error, setError] = useState('');

  const loadContent = async () => {
    try {
      setLoading(true);
      setError('');
      const curriculum = await progressApi.getProgressStructure();
      const chapters = curriculum?.chapters || [];
      const progress = await progressApi.getAllSkillProgress(
        chapters.map((chapter) => chapter.chapter_id)
      );
      setStructure(curriculum);
      setProgressBySkill(progress);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load learning content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadContent(); }, []);

  const chapters = structure?.chapters || [];
  const completedCount = chapters.filter((chapter) =>
    progressBySkill[chapter.chapter_id]?.skill?.progress === 100
  ).length;

  const startedCount = chapters.filter((chapter) =>
    (progressBySkill[chapter.chapter_id]?.completed_item_ids || []).length > 0
  ).length;

  const markComplete = async (skillId, itemId) => {
    try {
      setCompletingId(itemId);
      await progressApi.completeItem(skillId, itemId);
      const updated = await progressApi.getProgress(skillId);
      setProgressBySkill((previous) => ({ ...previous, [skillId]: updated }));
    } catch (completionError) {
      setError(completionError.message || 'Unable to complete this item.');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="content-page">
      <header className="content-page__header">
        <h1 className="content-page__title">Your empathy skills</h1>

        <p className="content-page__subtitle">
          Follow each skill from objectives to completed learning items.
        </p>

        <div className="content-page__stats">
          <div className="content-page__stat">
            <span className="content-page__stat-number">{completedCount}</span>
            <span className="content-page__stat-label">of {chapters.length} completed</span>
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
        {error && <p className="content-page__error">{error}</p>}
        {loading && <p className="content-page__loading">Loading learning content...</p>}
        {!loading && chapters.map((chapter) => {
          const skillProgress = progressBySkill[chapter.chapter_id] || {};
          const completedItems = new Set(skillProgress.completed_item_ids || []);
          return (
            <article className="learning-skill" key={chapter.chapter_id}>
              <div className="learning-skill__heading">
                <p className="content-page__eyebrow">Skill</p>
                <h2>{chapter.title}</h2>
                <p>{skillProgress.skill?.progress ?? 0}% complete</p>
              </div>
              <div className="learning-skill__objectives">
                {(chapter.objectives || []).map((objective) => {
                  const objectiveProgress = (skillProgress.objectives || []).find(
                    (item) => item.objective_id === objective.objective_id
                  );
                  return (
                    <section className="learning-objective" key={objective.objective_id}>
                      <div className="learning-objective__heading">
                        <h3>{objective.title}</h3>
                        <span>{objectiveProgress?.progress ?? 0}%</span>
                      </div>
                      {(objective.items || []).map((item) => {
                        const completed = completedItems.has(item.item_id);
                        const itemType = item.type || 'learning item';
                        return (
                          <div className="learning-item" key={item.item_id}>
                            <div>
                              <span className="learning-item__type">{itemType}</span>
                              <strong>{item.title}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => markComplete(chapter.chapter_id, item.item_id)}
                              disabled={completed || completingId === item.item_id}
                              aria-label={`${completed ? 'Completed' : 'Complete'} ${item.title}`}
                            >
                              {completingId === item.item_id ? <LoaderCircle className="spin" size={16} /> : completed ? <Check size={16} /> : <Circle size={16} />}
                              {completed ? 'Completed' : 'Complete'}
                            </button>
                          </div>
                        );
                      })}
                    </section>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ContentPage;
