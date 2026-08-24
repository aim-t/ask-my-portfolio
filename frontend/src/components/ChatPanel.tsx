import { useEffect, useRef } from "react";
import { useChat } from "../lib/useChat";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  className?: string;
}

export function ChatPanel({ className = "" }: ChatPanelProps) {
  const { messages, isLoading, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className={`flex flex-col ${className}`}>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-1 py-2">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Hi. Ask me anything about Aiman's experience, skills, or projects, answered from her
            real CV.
          </p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start" role="status" aria-label="Waiting for answer">
            <div className="rounded-2xl bg-neutral-100 px-3.5 py-2 text-sm text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              Thinking...
            </div>
          </div>
        )}
      </div>
      <div className="pt-2">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
