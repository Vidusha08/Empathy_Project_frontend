//src/components/chat/chatWindow.jsx
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import RabbitThinking from "./RabbitThinking";
import SuggestedQuestions from "./SuggestedQuestions";

export default function ChatWindow({
  messages,
  isLoading,
  onFlowMessage,
  selectedAnswers,
  suggestedQuestions,
  onSuggestedQuestionSelect,
}) {
  const scrollContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollContainerRef.current?.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading, suggestedQuestions]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={(event) => {
        const container = event.currentTarget;
        shouldAutoScrollRef.current =
          container.scrollHeight - container.scrollTop - container.clientHeight < 80;
      }}
      className="flex-1 min-h-0 overflow-y-auto py-3"
    >
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          isLoading={isLoading}
          onFlowMessage={onFlowMessage}
          selectedAnswers={selectedAnswers}
        />
      ))}

      {isLoading && (
        <div className="flex justify-start px-4 py-1.5">
          <RabbitThinking />
        </div>
      )}

      <SuggestedQuestions
        questions={suggestedQuestions}
        isLoading={isLoading}
        onSelect={onSuggestedQuestionSelect}
      />

    </div>
  );
}
