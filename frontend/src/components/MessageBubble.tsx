import type { ChatMessage } from "../lib/types";
import { AnswerMeta } from "./AnswerMeta";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const marker = isUser ? ">" : message.isError ? "!" : "#";
  const markerColor = message.isError ? "text-warn" : "text-accent";

  return (
    <div className="text-sm leading-relaxed">
      <span className={`${markerColor} mr-1.5 select-none`}>{marker}</span>
      <span className={message.isError ? "text-warn" : isUser ? "text-fg font-medium" : "text-fg"}>
        {message.text}
      </span>
      {!isUser && !message.isError && (
        <AnswerMeta sources={message.sources} provider={message.provider} />
      )}
    </div>
  );
}
