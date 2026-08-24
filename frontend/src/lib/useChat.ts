import { useCallback, useState } from "react";
import { ApiError, askQuestion } from "./api";
import type { ChatMessage } from "./types";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { id: makeId(), role: "user", text: trimmed }]);
    setIsLoading(true);

    try {
      const response = await askQuestion(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          text: response.answer,
          sources: response.sources,
          provider: response.provider,
        },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 503
            ? "The backend is reachable, but no LLM provider is configured yet (no API key set). Retrieval works, but answers can't be generated until that's fixed."
            : err.message
          : "Something unexpected went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "assistant", text: message, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { messages, isLoading, sendMessage };
}
