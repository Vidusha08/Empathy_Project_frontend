import { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, MessageCircle } from "lucide-react";
import { getLearningHistory } from "../api/chatApi";
import "./ChatHistoryPage.css";

function displayResponse(response) {
  if (typeof response === "string") return response;
  if (Array.isArray(response)) {
    return response
      .map((step) => typeof step === "string" ? step : step?.content || step?.text || JSON.stringify(step))
      .join("\n\n");
  }
  if (response && typeof response === "object") {
    return response.content || response.text || response.message || JSON.stringify(response, null, 2);
  }
  return "No response content saved.";
}

function dateInfo(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return { key: "unknown", label: "Earlier conversations" };

  const today = new Date();
  const dateKey = date.toLocaleDateString("en-CA");
  const todayKey = today.toLocaleDateString("en-CA");
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = yesterday.toLocaleDateString("en-CA");

  return {
    key: dateKey,
    label: dateKey === todayKey
      ? "Today"
      : dateKey === yesterdayKey
        ? "Yesterday"
        : date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  };
}

function groupByDate(interactions) {
  return interactions.reduce((groups, interaction) => {
    const info = dateInfo(interaction.timestamp);
    if (!groups[info.key]) groups[info.key] = { ...info, items: [] };
    groups[info.key].items.push(interaction);
    return groups;
  }, {});
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function ChatHistoryPage() {
  const [interactions, setInteractions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLearningHistory()
      .then(setInteractions)
      .catch((loadError) => setError(loadError.message || "Unable to load chat history."))
      .finally(() => setLoading(false));
  }, []);

  const dateGroups = Object.values(groupByDate(interactions));

  return (
    <main className="history-page">
      <header className="history-header">
        <div className="history-heading">
          <span className="history-kicker"><MessageCircle size={15} /> Your conversations</span>
          <h1>Chat History</h1>
          <p>Pick up where your learning conversations left off.</p>
        </div>
        {!loading && !error && <span className="history-count">{interactions.length} {interactions.length === 1 ? "conversation" : "conversations"}</span>}
      </header>

      {error && <p className="history-state history-state--error">{error}</p>}
      {loading && <p className="history-state">Loading saved conversations...</p>}
      {!loading && !error && interactions.length === 0 && <p className="history-state">No saved conversations yet.</p>}

      {!loading && !error && dateGroups.length > 0 && (
        <div className="history-groups">
          {dateGroups.map((group) => (
            <section className="history-group" key={group.key}>
              <div className="history-date"><CalendarDays size={17} /><h2>{group.label}</h2><span>{group.items.length}</span></div>
              <div className="history-list">
                {group.items.map((interaction, index) => (
                  <details className="history-entry" key={interaction._id || interaction.timestamp || `${interaction.question}-${index}`}>
                    <summary className="history-question">
                      <span className="history-question__icon"><MessageCircle size={17} /></span>
                      <span className="history-question__content"><strong>{interaction.question || "Untitled conversation"}</strong><small>{formatTime(interaction.timestamp)}</small></span>
                      <ChevronDown className="history-question__chevron" size={19} />
                    </summary>
                    <div className="history-response"><span className="history-response__label">Empathy Buddy</span><p>{displayResponse(interaction.response)}</p></div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}