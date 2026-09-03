//src/components/chat/chatWindow.jsx
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

export default function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto py-3">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
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
/*import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { Loader2 } from "lucide-react";
 
export default function ChatWindow({ messages = [], isLoading = false }) {
  const bottomRef = useRef(null);
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);
 
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scroll-smooth">
      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-16">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <p className="font-medium text-gray-500">Start a conversation</p>
          <p className="text-sm mt-1">
            Share how you're feeling. I'm here to help.
          </p>
        </div>
      )}
 
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}
 
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
            <Loader2 size={14} className="text-indigo-500 animate-spin" />
            <span className="text-sm text-gray-400">Thinking...</span>
          </div>
        </div>
      )}
 
      <div ref={bottomRef} />
    </div>
  );
}*/