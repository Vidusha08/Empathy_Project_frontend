// src/components/chat/RabbitIdle.jsx
import rabbit from "../../assets/images/rabbit.webp";
import "./RabbitIdle.css";

// Dashboard-only variant of the chatbot character: just the animated
// WEBP looping a gentle float, no "thinking" bubble. Clicking it
// navigates to the chat page, same as the "Start chatting" button.
export default function RabbitIdle({ onClick, label = "Open chat with Empathy Buddy" }) {
  return (
    <button type="button" onClick={onClick} className="rabbit-idle" aria-label={label}>
      <img src={rabbit} alt="" className="rabbit-idle__img" />
      <span className="rabbit-idle__shadow" />
    </button>
  );
}