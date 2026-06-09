const emotionColors = {
  calm: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  anxious: "bg-orange-100 text-orange-700",
  sad: "bg-blue-100 text-blue-700",
  happy: "bg-emerald-100 text-emerald-700",
  stressed: "bg-red-100 text-red-700",
  neutral: "bg-gray-100 text-gray-600",
};
 
export default function ChatMessage({ message }) {
  const { role, content, timestamp, emotion } = message;
  const isUser = role === "user";
 
  const emotionClass =
    emotionColors[emotion?.toLowerCase()] || emotionColors.neutral;
 
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[68%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-[#1a237e] text-white rounded-br-sm"
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
        }`}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {timestamp && (
            <span
              className={`text-[10px] ${
                isUser ? "text-white/60" : "text-gray-400"
              }`}
            >
              {timestamp}
            </span>
          )}
          {emotion && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${emotionClass}`}
            >
              {emotion}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}