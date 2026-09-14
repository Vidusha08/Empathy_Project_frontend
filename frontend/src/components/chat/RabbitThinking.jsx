// src/components/chat/RabbitThinking.jsx
import { useEffect, useState } from "react";
import rabbit from "../../assets/images/rabbit.webp";
import "./RabbitThinking.css";

// Plays a one-off "greeting" entrance, then settles into a
// looping idle bounce for as long as the chatbot is thinking.
export default function RabbitThinking() {
  const [phase, setPhase] = useState("enter");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("idle"), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rabbit-thinking">
      <img
        src={rabbit}
        alt="Empathy Buddy is thinking"
        className={`rabbit-thinking__img rabbit-thinking__img--${phase}`}
      />
      <div className="rabbit-thinking__bubble">
        <span className="rabbit-thinking__label">Thinking</span>
        <span className="rabbit-thinking__dot" />
        <span className="rabbit-thinking__dot" />
        <span className="rabbit-thinking__dot" />
      </div>
    </div>
  );
}