//src/components/chat/chatWindow.jsx
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

export default function ChatWindow({ messages, isLoading, onCompleteObjective }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto py-3">
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          onCompleteObjective={onCompleteObjective}
        />
      ))}

      {isLoading && (
        <div className="flex justify-start px-4 py-1.5">
          <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
