import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Circle } from "lucide-react";
import { completeItem, getOverallProgress, getProgress, getProgressStructure } from "../api/progressApi";
import "./ProgressPage.css";

const valueOf = (record, ...keys) => {
  for (const key of keys) if (record?.[key] !== undefined && record?.[key] !== null) return record[key];
  return null;
};

const percentageOf = (record) => valueOf(record, "progress", "percentage", "progress_percentage");

const statusOf = (record) => {
  if (record?.status) return record.status;
  const percentage = percentageOf(record);
  if (percentage === null) return "Not available";
  if (percentage === 0) return "Not Started";
  if (percentage < 50) return "Exploring";
  if (percentage < 100) return "Developing";
  return "Completed";
};

const itemsOf = (objective) => Array.isArray(objective?.items) ? objective.items : [];
const skillIdOf = (skill) => skill.chapter_id || skill.skill_id;
const skillProgressOf = (progress, skillId) => progress?.skills?.find((skill) => skill.skill_id === skillId) || null;
const objectiveProgressOf = (detail, objectiveId) => (detail?.objectives || detail?.skill?.objectives || []).find((item) => item.objective_id === objectiveId) || null;
const itemProgressOf = (objective, itemId) => (objective?.items || objective?.learning_items || []).find((item) => item.item_id === itemId) || null;

function itemIsComplete(item, itemProgress, detail) {
  return itemProgress?.completed ?? itemProgress?.is_completed ?? item.completed ?? item.is_completed ?? (detail?.completed_item_ids || []).includes(item.item_id);
}

function ProgressSummary({ progress }) {
  const percentage = progress?.overall_progress ?? null;
  const completed = valueOf(progress, "completed_items");
  const total = valueOf(progress, "total_learning_items", "total_items");
  return <section className="overall-progress-card" aria-label="Overall progress">
    <div className="overall-progress-top"><div><span className="progress-label">Overall Progress</span><h2>{percentage === null ? "-" : `${percentage}% Complete`}</h2><p className="progress-status">{statusOf({ progress: percentage })}</p></div><div className="overall-count">{completed === null || total === null ? "-" : `${completed} of ${total} learning items completed`}</div></div>
    <div className="progress-bar" aria-label={`${percentage ?? 0}% complete`}>{percentage !== null && <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />}</div>
  </section>;
}

function ProgressPage() {
  const [structure, setStructure] = useState(null);
  const [progress, setProgress] = useState(null);
  const [details, setDetails] = useState({});
  const [path, setPath] = useState({ skill: null, objective: null, item: null });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  async function loadProgress() {
    try {
      setLoading(true); setError("");
      const [structureData, progressData] = await Promise.all([getProgressStructure(), getOverallProgress()]);
      setStructure(structureData); setProgress(progressData);
    } catch (err) { setError(err.message || "Something went wrong."); } finally { setLoading(false); }
  }

  useEffect(() => { void Promise.resolve().then(() => loadProgress()); }, []);

  const skills = structure?.chapters || structure?.skills || [];
  const currentSkill = skills.find((skill) => skillIdOf(skill) === path.skill);
  const detail = details[path.skill];
  const currentObjective = currentSkill?.objectives?.find((objective) => objective.objective_id === path.objective);
  const currentItem = itemsOf(currentObjective).find((item) => item.item_id === path.item);

  async function selectSkill(skill) {
    const skillId = skillIdOf(skill); setPath({ skill: skillId, objective: null, item: null });
    if (details[skillId]) return;
    try { setDetailLoading(true); const detailData = await getProgress(skillId); setDetails((previous) => ({ ...previous, [skillId]: detailData })); }
    catch (err) { setError(err.message || "Unable to load skill progress."); }
    finally { setDetailLoading(false); }
  }

  function goBack() {
    if (path.item) setPath((previous) => ({ ...previous, item: null }));
    else if (path.objective) setPath((previous) => ({ ...previous, objective: null }));
    else setPath({ skill: null, objective: null, item: null });
  }

  async function markComplete() {
    if (!currentItem || completing) return;
    try { setCompleting(true); await completeItem(path.skill, currentItem.item_id); await loadProgress(); const detailData = await getProgress(path.skill); setDetails((previous) => ({ ...previous, [path.skill]: detailData })); }
    catch (err) { setError(err.message || "Unable to complete this item."); }
    finally { setCompleting(false); }
  }

  if (loading) return <div className="progress-page"><div className="progress-loading">Loading your learning progress...</div></div>;
  if (error && !progress) return <div className="progress-page"><div className="progress-error"><h2>Unable to load progress</h2><p>{error}</p><button type="button" onClick={loadProgress}>Try Again</button></div></div>;

  if (!path.skill) return <div className="progress-page"><div className="progress-header"><h1>Your Learning Progress</h1><p>Track the learning items you have completed across each skill.</p></div><ProgressSummary progress={progress} /><section className="journey-list" aria-label="Skills">{skills.map((skill, index) => { const skillProgress = skillProgressOf(progress, skillIdOf(skill)); const percentage = percentageOf(skillProgress); return <div className="journey-row" key={skillIdOf(skill)}><span className="journey-number">{String(index + 1).padStart(2, "0")}</span><span className="journey-main"><strong>{skill.title || skill.name}</strong><span>{percentage === null ? "Progress unavailable" : `${percentage}% Complete · ${statusOf(skillProgress)}`}</span>{percentage !== null && <span className="journey-track"><span style={{ width: `${percentage}%` }} /></span>}</span></div>; })}</section></div>;

  if (!currentSkill) return null;
  const skillProgress = skillProgressOf(progress, path.skill);
  if (!path.objective) return <DrilldownList backLabel="Back to Progress" onBack={goBack} eyebrow="Skill" title={currentSkill.title || currentSkill.name} subtitle={`${percentageOf(skillProgress) ?? "-"}% · ${statusOf(skillProgress)}`} sectionLabel="Objectives" loading={detailLoading}>{currentSkill.objectives?.map((objective) => { const objectiveProgress = objectiveProgressOf(detail, objective.objective_id); return <button type="button" className="journey-row" key={objective.objective_id} onClick={() => setPath((previous) => ({ ...previous, objective: objective.objective_id }))}><span className="journey-main"><strong>{objective.title}</strong><span>{percentageOf(objectiveProgress) ?? "-"}% · {statusOf(objectiveProgress)}</span></span><ChevronRight className="journey-arrow" size={20} aria-hidden="true" /></button>; })}</DrilldownList>;

  if (!currentObjective) return null;
  const objectiveProgress = objectiveProgressOf(detail, currentObjective.objective_id);
  if (!path.item) return <DrilldownList backLabel={`Back to ${currentSkill.title || currentSkill.name}`} onBack={goBack} eyebrow="Objective" title={currentObjective.title} subtitle={`${percentageOf(objectiveProgress) ?? "-"}% · ${statusOf(objectiveProgress)}`} sectionLabel="Learning Items">{itemsOf(currentObjective).map((item) => { const completed = itemIsComplete(item, itemProgressOf(objectiveProgress, item.item_id), detail); return <button type="button" className={`activity-row ${completed ? "is-complete" : ""}`} key={item.item_id} onClick={() => setPath((previous) => ({ ...previous, item: item.item_id }))}><span className="activity-status">{completed ? <Check size={15} /> : <Circle size={15} />}</span><span className="activity-main"><strong>{item.title}</strong><span>{completed ? "Completed" : "Not Started"}</span></span><ChevronRight className="journey-arrow" size={18} aria-hidden="true" /></button>; })}</DrilldownList>;

  const completed = itemIsComplete(currentItem, itemProgressOf(objectiveProgress, currentItem.item_id), detail);
  return <div className="activity-detail"><button type="button" className="back-link" onClick={goBack}><ArrowLeft size={16} /> Back to {currentObjective.title}</button><p className="detail-eyebrow">Learning Item</p><h1>{currentItem.title}</h1><div className="activity-detail-card"><p>{currentItem.content || currentItem.description || "This learning item will appear here when you are ready to explore it."}</p><button type="button" className="complete-button" onClick={markComplete} disabled={completed || completing}>{completed ? "Completed" : completing ? "Saving..." : "Mark as complete"} {!completed && <ArrowRight size={16} />}</button></div></div>;
}

function DrilldownList({ backLabel, onBack, eyebrow, title, subtitle, sectionLabel, loading, children }) {
  return <div className="drilldown-view"><button type="button" className="back-link" onClick={onBack}><ArrowLeft size={16} /> {backLabel}</button><div className="drilldown-heading"><p className="detail-eyebrow">{eyebrow}</p><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{loading && <p className="progress-loading">Loading detailed progress...</p>}<section className="drilldown-section"><h2>{sectionLabel}</h2>{children}</section></div>;
}

export default ProgressPage;
