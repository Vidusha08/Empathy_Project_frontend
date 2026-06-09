import { useState, useRef, useEffect } from "react";
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
    <div className="px-5 pb-5 pt-3 bg-white border-t border-gray-100">
      {/* Quick action buttons */}
      <div className="flex gap-3 mb-3">
        {quickActions.map(({ label, icon: Icon, color }) => (
          <button
            key={label}
            onClick={() => handleQuickAction(label)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-600 disabled:opacity-50"
          >
            <Icon size={15} className={color} />
            <span>{label}</span>
          </button>
        ))}
      </div>
 
      {/* Text input row */}
      <div className="flex items-end gap-3">
        <div className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
            placeholder="Share your feelings or ask for guidance..."
            className="w-full bg-transparent resize-none text-sm text-gray-700 placeholder-gray-400 outline-none leading-relaxed"
            style={{ maxHeight: "120px" }}
          />
        </div>
 
        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="w-11 h-11 rounded-2xl bg-[#1a237e] hover:bg-[#283593] disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-all shadow-md active:scale-95"
        >
          <Send size={16} className="text-white ml-0.5" />
        </button>
      </div>
    </div>
  );
}