//pages/ContentPage.jsx
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, ExternalLink, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getSkill, getSkills } from "../api/contentApi";
import progressApi from '../api/progressApi';
import "./ContentPage.css";

const listOf = (value) => Array.isArray(value) ? value : [];
const idOf = (item) => typeof item === "string" ? item : item?.skill_id || item?.chapter_id || item?.activity_id || item?.video_id || item?.quiz_id || item?.item_id || item?.objective_id || item?.id || item?.activityId || item?.videoId || item?.quizId || item?.objectiveId;
const titleOf = (item) => typeof item === "string" ? item : item?.title || item?.name || item?.label || item?.objective || item?.text || item?.term || "Untitled learning item";
const descriptionOf = (item) => typeof item === "string" ? "" : item?.description || item?.summary || item?.content || item?.details || item?.objective_description || item?.objectiveDescription || item?.definition || "";
const typeOf = (item, fallback = "learning_item") => item?.item_type || item?.type || fallback;
const playableVideoUrlOf = (item) => {
  const url = typeof item?.url === "string" ? item.url.trim() : "";
  return url && (/^(https?:|blob:|data:)/i.test(url) || url.startsWith("/")) ? url : "";
};
const keyOf = (item, index, prefix) => `${prefix}-${idOf(item) || titleOf(item)}-${index}`;
const detailList = (detail, keys) => {
  const candidates = Array.isArray(keys) ? keys : [keys];
  const sources = [detail, detail?.skill, detail?.data, detail?.result, detail?.payload];
  for (const source of sources) {
    for (const key of candidates) {
      const value = source?.[key];
      if (Array.isArray(value)) return value;
      if (value && Array.isArray(value.items)) return value.items;
      if (value && Array.isArray(value.data)) return value.data;
    }
  }
  return [];
};
const normalizeConcepts = (rawConcepts, definitions = []) => {
  const definitionMap = new Map();
  for (const item of listOf(definitions)) {
    const term = typeof item === "string" ? item : item?.term || item?.name || item?.title || item?.label;
    if (!term) continue;
    definitionMap.set(String(term).trim().toLowerCase(), typeof item === "string" ? "" : item?.definition || item?.description || item?.details || "");
  }

  return listOf(rawConcepts)
    .map((concept) => {
      if (typeof concept === "string") {
        const term = concept.trim();
        return { title: term, description: definitionMap.get(term.toLowerCase()) || "" };
      }
      if (concept && typeof concept === "object") {
        const term = titleOf(concept);
        const definition = descriptionOf(concept) || definitionMap.get(String(term).trim().toLowerCase()) || "";
        return { title: term, description: definition };
      }
      return null;
    })
    .filter(Boolean);
};

function SkillList({ skills, progressBySkill, onSelect }) {
  return <section className="content-skills" aria-label="Learning skills">
    {skills.map((skill, index) => {
      const skillId = idOf(skill);
      const progress = progressBySkill[skillId]?.skill?.progress ?? progressBySkill[skillId]?.progress ?? 0;
      return <button className="skill-card" type="button" key={keyOf(skill, index, "skill")} onClick={() => onSelect(skillId)}>
        <span className="skill-card__number">{String(index + 1).padStart(2, "0")}</span>
        <span className="skill-card__body"><span className="skill-card__title">{titleOf(skill)}</span><span className="skill-card__description">{descriptionOf(skill)}</span><span className="skill-card__footer"><span>{progress}% complete</span><ChevronRight size={18} /></span></span>
      </button>;
    })}
  </section>;
}

function ChatbotLink({ skillId }) {
  const chatPath = skillId ? `/chat?skill=${encodeURIComponent(skillId)}` : "/chat";
  return <Link to={chatPath} className="content-chatbot-link" aria-label="Open AI chatbot" title="Ask the AI chatbot">
    <MessageCircle size={19} aria-hidden="true" />
    <span>Ask AI</span>
  </Link>;
}

function VideoPlayer({ video, completed, onComplete }) {
  const completionAttempted = useRef(false);
  const videoId = idOf(video);

  const handleEnded = async () => {
    if (!videoId || completed || completionAttempted.current) return;
    completionAttempted.current = true;
    const saved = await onComplete(videoId, "video");
    if (!saved) completionAttempted.current = false;
  };

  return (
    <video
      className="learning-item-card__video"
      controls
      preload="metadata"
      src={playableVideoUrlOf(video)}
      onEnded={handleEnded}
      aria-label={titleOf(video)}
    />
  );
}

function SkillDetail({ detail, progress, completingId, onBack, onComplete, onStartQuiz }) {
  const skill = detail?.skill || detail;
  const objectives = detailList(detail, ["objectives", "learning_objectives", "learningObjectives", "goals", "learning_goals"]);
  const definitions = detailList(detail, ["definitions", "concept_definitions", "definitionList"]);
  const rawConcepts = detailList(detail, ["key_concepts", "keyConcepts", "concepts", "learning_concepts", "learningConcepts"]);
  const concepts = normalizeConcepts(rawConcepts, definitions);
  const learningItems = objectives.flatMap((objective) => (
    listOf(objective?.items || objective?.learning_items).map((item) => ({
      ...item,
      objective_id: objective.objective_id || objective.id,
    }))
  ));
  const texts = learningItems.filter((item) => typeOf(item) === "text");
  const activities = learningItems.filter((item) => ["activity", "practice", "reflection"].includes(typeOf(item)));
  const videos = learningItems.filter((item) => typeOf(item) === "video");
  const quizzes = learningItems.filter((item) => ["quiz", "assessment"].includes(typeOf(item)));
  const learnItems = [...texts, ...videos];
  const resources = detailList(detail, ["resources", "reference_materials", "referenceMaterials", "support_materials"]);
  const reflection = skill?.reflection || detail?.reflection || "Take a moment to reflect on what you learned.";
  const completedIds = new Set(progress?.completed_item_ids || []);
  const completedObjectiveIds = new Set(progress?.completed_objective_ids || []);
  const [expandedConcept, setExpandedConcept] = useState(null);
  const skillProgress = Number(progress?.skill?.progress ?? progress?.progress ?? 0) || 0;

  const markComplete = (item, fallbackType) => onComplete(idOf(item), item?.progressType || typeOf(item, fallbackType));

  const formatDuration = (item) => {
    const value = item?.duration || item?.minutes || item?.estimated_time || item?.length;
    if (value === undefined || value === null || value === "") return "";
    if (typeof value === "number") return `${value} min`;
    return String(value);
  };

  return (
    <div className="skill-detail">
      <button type="button" className="content-back" onClick={onBack}><ArrowLeft size={16} /> Back to skills</button>

      <header className="skill-detail__hero">
        <div className="skill-detail__headline">
          <p className="content-page__eyebrow">Learning skill</p>
          <h1>{titleOf(skill)}</h1>
          <p>{descriptionOf(skill)}</p>
        </div>

        <div className="skill-detail__progress" aria-label="Skill progress">
          <div className="skill-detail__progress-header">
            <span>Progress</span>
            <strong>{Math.round(skillProgress)}%</strong>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${skillProgress}%` }} />
          </div>
        </div>
      </header>

      <section className="meta-panel">
        <div className="meta-panel__stat">
          <span>{objectives.length || 0}</span>
          <small>Objectives</small>
        </div>
        <div className="meta-panel__stat">
          <span>{texts.length || 0}</span>
          <small>Text lessons</small>
        </div>
        <div className="meta-panel__stat">
          <span>{activities.length || 0}</span>
          <small>Activities</small>
        </div>
        <div className="meta-panel__stat">
          <span>{videos.length || 0}</span>
          <small>Videos</small>
        </div>
        <div className="meta-panel__stat">
          <span>{quizzes.length || 0}</span>
          <small>Quizzes</small>
        </div>
      </section>

      <section className="panel-block">
        <div className="panel-block__header">
          <h2>Learning Objectives</h2>
        </div>
        <div className="objective-grid">
          {objectives.length ? objectives.map((objective, index) => {
            const objectiveId = idOf(objective) || objective?.objective_id || objective?.id || titleOf(objective);
            const isComplete = completedObjectiveIds.has(objectiveId) || completedIds.has(objectiveId);
            return (
              <article className="objective-card" key={keyOf(objective, index, "objective")}>
                <span className="objective-card__index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{titleOf(objective)}</h3>
                <p>{descriptionOf(objective) || "Build confidence by practicing this skill in practical ways."}</p>
                <span className={`objective-card__status ${isComplete ? "is-complete" : "is-pending"}`}>
                  {isComplete ? "✓ Completed" : "○ Not started"}
                </span>
              </article>
            );
          }) : <p className="empty-state">No learning objectives are available for this skill yet.</p>}
        </div>
      </section>

      <section className="panel-block">
        <div className="panel-block__header">
          <h2>Key Concepts</h2>
        </div>
        <div className="concept-grid">
          {concepts.length ? concepts.map((concept, index) => {
            const conceptKey = `${titleOf(concept)}-${index}`;
            const isOpen = expandedConcept === conceptKey;
            return (
              <div className={`concept-card ${isOpen ? "is-expanded" : ""}`} key={keyOf(concept, index, "concept")}>
                <button type="button" className="concept-card__trigger" onClick={() => setExpandedConcept(isOpen ? null : conceptKey)}>
                  <span>{titleOf(concept)}</span>
                  <ChevronRight size={16} />
                </button>
                {isOpen && <p>{descriptionOf(concept) || "This key concept explains an important idea in this learning skill."}</p>}
              </div>
            );
          }) : <p className="empty-state">No key concepts are currently listed for this skill.</p>}
        </div>
      </section>

      <section className="panel-block">
        <div className="panel-block__header panel-block__header--stacked">
          <h2>Learning Path</h2>
          <p>Learn → Practice → Check</p>
        </div>

        <div className="path-grid">
          <article className="path-card path-card--learn">
            <span className="path-card__badge">Learn</span>
            <h3>Text and videos</h3>
            {learnItems.length ? learnItems.map((video, index) => {
              const videoId = idOf(video);
              const completed = videoId ? completedIds.has(videoId) : false;
              return (
                <div className="learning-item-card" key={keyOf(video, index, "video")}>
                  <div className="learning-item-card__top">
                    <span className="learning-item-card__type">{typeOf(video) === "text" ? "Text" : "Video"}</span>
                    <span className="learning-item-card__duration">{formatDuration(video) || "Watch"}</span>
                  </div>
                  <h4>{titleOf(video)}</h4>
                  <p>{descriptionOf(video) || "Learn the key ideas behind this skill."}</p>
                  <div className="learning-item-card__footer">
                    <span className={`status ${completed ? "status--done" : "status--pending"}`}>{completed ? "Completed" : "Not started"}</span>
                    {playableVideoUrlOf(video) ? (
                      <VideoPlayer video={video} completed={completed} onComplete={onComplete} />
                    ) : (
                      <button type="button" className="mini-button" onClick={() => markComplete({ ...video, progressType: "video" }, "video")} disabled={!videoId || completed || completingId === videoId}>{completed ? "Done" : "Mark complete"}</button>
                    )}
                  </div>
                </div>
              );
            }) : <p className="empty-state">No videos available for this skill yet.</p>}
          </article>

          <article className="path-card path-card--practice">
            <span className="path-card__badge">Practice</span>
            <h3>Activities</h3>
            {activities.length ? activities.map((activity, index) => {
              const activityId = idOf(activity);
              const completed = activityId ? completedIds.has(activityId) : false;
              return (
                <div className="learning-item-card" key={keyOf(activity, index, "activity")}>
                  <div className="learning-item-card__top">
                    <span className="learning-item-card__type">Activity</span>
                    <span className="learning-item-card__duration">{formatDuration(activity) || "5 min"}</span>
                  </div>
                  <h4>{titleOf(activity)}</h4>
                  <p>{descriptionOf(activity) || "Practice the skill with a guided exercise."}</p>
                  <div className="learning-item-card__footer">
                    <span className={`status ${completed ? "status--done" : "status--pending"}`}>{completed ? "Completed" : "Not started"}</span>
                    <button type="button" className="mini-button" onClick={() => markComplete({ ...activity, progressType: "activity" }, "activity")} disabled={!activityId || completed || completingId === activityId}>{completed ? "Done" : "Start →"}</button>
                  </div>
                </div>
              );
            }) : <p className="empty-state">No practice activities are available for this skill yet.</p>}
          </article>

          <article className="path-card path-card--check">
            <span className="path-card__badge">Check</span>
            <h3>Quiz</h3>
            {quizzes.length ? quizzes.map((quiz, index) => {
              const quizId = idOf(quiz);
              const completed = quizId ? completedIds.has(quizId) : false;
              return (
                <div className="learning-item-card" key={keyOf(quiz, index, "quiz")}>
                  <div className="learning-item-card__top">
                    <span className="learning-item-card__type">Quiz</span>
                    <span className="learning-item-card__duration">{quizzes.length} Q</span>
                  </div>
                  <h4>{titleOf(quiz)}</h4>
                  <p>{descriptionOf(quiz) || "Check your understanding and reinforce key ideas."}</p>
                  <div className="learning-item-card__footer">
                    <span className={`status ${completed ? "status--done" : "status--pending"}`}>{completed ? "Completed" : "Not started"}</span>
                    <button type="button" className="mini-button" onClick={() => onStartQuiz(quiz)} disabled={!quizId || completed}>{completed ? "Done" : "Start quiz"}</button>
                  </div>
                </div>
              );
            }) : <p className="empty-state">No quiz is available for this skill yet.</p>}
          </article>
        </div>
      </section>

      {(skill?.reflection || detail?.reflection) && (
        <section className="panel-block">
          <div className="panel-block__header">
            <h2>Reflect</h2>
          </div>
          <div className="reflection-box">
            <p>{reflection}</p>
            <textarea className="reflection-input" rows="4" placeholder="Write your reflection..." />
          </div>
        </section>
      )}

      {resources.length > 0 && (
        <section className="panel-block">
          <div className="panel-block__header">
            <h2>Resources</h2>
          </div>
          <div className="resource-grid">
            {resources.map((resource, index) => (
              <article className="resource-card" key={keyOf(resource, index, "resource")}>
                <span className="resource-card__type">Reference</span>
                <h3>{titleOf(resource)}</h3>
                <p>{descriptionOf(resource) || "Support material for this skill."}</p>
                {resource.url ? (
                  <a href={resource.url} target="_blank" rel="noreferrer" className="resource-link">
                    Open resource <ExternalLink size={14} />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const ContentPage = () => {
  const [skills, setSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [progressBySkill, setProgressBySkill] = useState({});
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError('');
      const skillList = await getSkills();
      setSkills(skillList);
      setProgressBySkill(await progressApi.getAllSkillProgress(skillList.map(idOf)));
    } catch (loadError) {
      setError(loadError.message || 'Unable to load learning content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void Promise.resolve().then(() => loadSkills()); }, []);

  const selectSkill = async (skillId) => {
    try { setSelectedSkillId(skillId); setDetailLoading(true); setError(''); setDetail(await getSkill(skillId)); } catch (loadError) { setError(loadError.message || 'Unable to load this skill.'); } finally { setDetailLoading(false); }
  };

  const markComplete = async (itemId, itemType) => {
    if (!itemId) {
      setError('This learning item is missing its stable ID and cannot be completed yet.');
      return false;
    }
    try {
      setCompletingId(itemId);
      await progressApi.completeItem(selectedSkillId, itemId, itemType);
      const updated = await progressApi.getProgress(selectedSkillId);
      setProgressBySkill((previous) => ({ ...previous, [selectedSkillId]: updated }));
      return true;
    } catch (completionError) {
      setError(completionError.message || 'Unable to complete this item.');
      return false;
    } finally {
      setCompletingId(null);
    }
  };

  const startQuiz = (quiz) => {
    const quizId = idOf(quiz);
    if (!selectedSkillId || !quizId) {
      setError('This quiz is missing a stable ID and cannot be opened yet.');
      return;
    }
    navigate(`/quiz?skill=${encodeURIComponent(selectedSkillId)}&item=${encodeURIComponent(quizId)}`, {
      state: { quiz, skillTitle: titleOf(detail?.skill || detail) },
    });
  };

  if (selectedSkillId) return <div className="content-page">{error && <p className="content-page__error">{error}</p>}{detailLoading ? <p className="content-page__loading">Loading skill details...</p> : detail && <SkillDetail detail={detail} progress={progressBySkill[selectedSkillId]} completingId={completingId} onBack={() => { setSelectedSkillId(null); setDetail(null); }} onComplete={markComplete} onStartQuiz={startQuiz} />}<ChatbotLink skillId={selectedSkillId} /></div>;

  const completedCount = skills.filter((skill) => (progressBySkill[idOf(skill)]?.skill?.progress ?? progressBySkill[idOf(skill)]?.progress) === 100).length;
  const startedCount = skills.filter((skill) => (progressBySkill[idOf(skill)]?.completed_item_ids || []).length > 0).length;
  return <div className="content-page">
      <header className="content-page__header">
        <p className="content-page__eyebrow">Your learning path</p>
        <h1 className="content-page__title">Learning skills</h1>

        <p className="content-page__subtitle">
          Follow each skill from objectives to completed learning items.
        </p>

        <div className="content-page__stats">
          <div className="content-page__stat">
            <span className="content-page__stat-number">{completedCount}</span>
            <span className="content-page__stat-label">of {skills.length} completed</span>
          </div>

          <div className="content-page__stat-divider" />

          <div className="content-page__stat">
            <span className="content-page__stat-number">{startedCount}</span>
            <span className="content-page__stat-label">skills started</span>
          </div>
        </div>
      </header>

      <div className={`content-page__grid${loading ? ' content-page__grid--loading' : ''}`}>
        {error && <p className="content-page__error">{error}</p>}
        {loading && <p className="content-page__loading">Loading learning content...</p>}
        {!loading && <SkillList skills={skills} progressBySkill={progressBySkill} onSelect={selectSkill} />}
      </div>
      <ChatbotLink />
    </div>;
};

export default ContentPage;
