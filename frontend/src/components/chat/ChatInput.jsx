//src/components/chat/ChatInput.jsx
import { useState, useRef } from "react";
import { Send, Play, Wind, Anchor } from "lucide-react";
 
const quickActions = [
  { label: "Watch Video", icon: Play, color: "text-blue-500" },
  { label: "Breathing", icon: Wind, color: "text-teal-500" },
  { label: "Grounding", icon: Anchor, color: "text-indigo-500" },
];
 
export default function ChatInput({ onSend, isLoading = false }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);
 
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };
 
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
 
  const handleInput = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  };
 
  const handleQuickAction = (label) => {
    onSend(`[${label}]`);
  };
 
  return (
    <div className="px-5 pb-5 pt-3 bg-[var(--app-surface-translucent)] border-t border-[var(--app-border)] backdrop-blur-md">
      {/* Quick action buttons */}
      <div className="flex gap-3 mb-3">
        {quickActions.map(({ label, icon: Icon, color }) => (
          <button
            key={label}
            onClick={() => handleQuickAction(label)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-card)] hover:bg-[var(--app-accent-subtle)] transition-colors text-sm font-medium text-[var(--app-text)] disabled:opacity-50"
          >
            <Icon size={15} className={color} />
            <span>{label}</span>
          </button>
        ))}
      </div>
 
      {/* Text input row */}
      <div className="flex items-end gap-3">
        <div className="flex-1 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-card)] px-4 py-2.5 focus-within:border-[var(--app-accent)] focus-within:ring-2 focus-within:ring-[var(--app-focus-ring)] transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
            placeholder="Share your feelings or ask for guidance..."
            className="w-full bg-transparent resize-none text-sm text-[var(--app-text)] placeholder-[var(--app-text-muted)] outline-none leading-relaxed"
            style={{ maxHeight: "120px" }}
          />
        </div>
 
        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="chat-send-btn w-11 h-11 rounded-2xl bg-[var(--chat-send-btn-bg,var(--app-accent))] hover:bg-[var(--chat-send-btn-hover,var(--app-accent-hover))] disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-all shadow-md active:scale-95"
          aria-label="Send message"
        >
          <Send size={16} className="text-white ml-0.5" />
        </button>
      </div>
    </div>
  );
}
