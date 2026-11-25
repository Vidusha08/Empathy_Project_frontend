// src/hooks/useChat.js
import { useCallback } from "react";
import useChatStore from "../store/chatStore";
import { sendMessage as sendChatMessage } from "../api/chatApi";

export function useChat() {
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const addMessage = useChatStore((state) => state.addMessage);
  const markMessageHandled = useChatStore((state) => state.markMessageHandled);
  const setLoading = useChatStore((state) => state.setLoading);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const setGreetingName = useChatStore((state) => state.setGreetingName);

  const sendMessage = useCallback(
    async (text, answerStyle = "short") => {
      setLoading(true);
      try {
        const response = await sendChatMessage(text, answerStyle);
        return response;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return {
    messages,
    isLoading,
    addMessage,
    markMessageHandled,
    setLoading,
    clearMessages,
    setGreetingName,
    sendMessage,
  };
}

export default useChat;
