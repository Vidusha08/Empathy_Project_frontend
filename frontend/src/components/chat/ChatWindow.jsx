//src/components/chat/chatWindow.jsx
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import RabbitThinking from "./RabbitThinking";

export default function ChatWindow({ messages, isLoading, onFlowMessage }) {
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
          onFlowMessage={onFlowMessage}
        />
      ))}

      {isLoading && (
        <div className="flex justify-start px-4 py-1.5">
          <RabbitThinking />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
