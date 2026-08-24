import type { ChatMessage } from "../lib/types";
import { AnswerMeta } from "./AnswerMeta";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          role={message.isError ? "alert" : undefined}
          className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
            isUser
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : message.isError
                ? "border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
                : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
          }`}
        >
          {message.text}
        </div>
        {!isUser && !message.isError && (
          <AnswerMeta sources={message.sources} provider={message.provider} />
        )}
      </div>
    </div>
  );
}
