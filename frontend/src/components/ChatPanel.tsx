import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useChat } from "../lib/useChat";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  className?: string;
  chromeLabel?: string;
}

export function ChatPanel({
  className = "",
  chromeLabel = "ask-my-portfolio: chat",
}: ChatPanelProps) {
  const { messages, isLoading, sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      className={`border-border bg-panel flex flex-col overflow-hidden rounded-lg border ${className}`}
    >
      <div className="border-border flex items-center gap-2 border-b px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="text-fg-dim ml-1.5 truncate text-xs">{chromeLabel}</span>
      </div>

      <div ref={scrollRef} className="terminal-scroll flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && (
          <p className="text-fg-dim text-sm">
            <span className="text-accent">$</span> Hi. Ask me anything about Aiman's experience,
            skills, or projects, answered from her real CV.
          </p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div role="status" aria-label="Waiting for answer" className="text-fg-dim text-sm">
            <span className="text-accent">#</span> thinking
            <span className="cursor-blink">_</span>
          </div>
        )}
      </div>

      <div className="border-border border-t p-2">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
