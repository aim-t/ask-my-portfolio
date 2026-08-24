import { useCallback, useState } from "react";
import { ApiError, askQuestion } from "./api";
import type { ChatMessage } from "./types";

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const GENERIC_ERROR = "Something unexpected went wrong. Please try again.";

/**
 * The backend returns 503 for two different situations that need
 * different messages: no API key set at all (app/llm.py's
 * NoProviderAvailable with "No LLM provider is configured...") versus a
 * key that IS set but whose call just failed (same exception type, but
 * "All configured providers failed..." with the real error, e.g. a rate
 * limit or quota error). Showing "no provider configured" for the second
 * case is misleading since a key is in fact configured and usually just
 * needs a retry.
 */
function describeApiError(err: ApiError): string {
  if (err.status !== 503) return err.message;

  if (err.message.startsWith("No LLM provider is configured")) {
    return "The backend is reachable, but no LLM provider is configured yet (no API key set). Retrieval works, but answers can't be generated until that's fixed.";
  }

  // Provider errors (e.g. Gemini's quota errors) can be several paragraphs
  // of raw API response text. Keep only the first line in the chat bubble,
  // a summary is more useful there than a wall of text; the full detail is
  // still in err.message for anyone checking devtools.
  const firstLine = err.message.split("\n")[0].trim();
  return `The configured LLM provider couldn't answer that just now, often a temporary rate limit or quota issue rather than a real outage. (${firstLine})`;
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
      const message = err instanceof ApiError ? describeApiError(err) : GENERIC_ERROR;
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
