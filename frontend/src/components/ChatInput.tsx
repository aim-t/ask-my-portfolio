import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (question: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");

  function submit() {
    if (isLoading || !value.trim()) return;
    onSend(value);
    setValue("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <span className="text-accent pl-1 select-none">{">"}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ask a question..."
        aria-label="Ask a question about Aiman's background"
        disabled={isLoading}
        className="text-fg placeholder:text-fg-dim min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        aria-label="Send question"
        className="text-fg-dim hover:text-accent hover:border-accent border-border focus-visible:ring-accent shrink-0 rounded-md border px-2.5 py-1.5 text-xs whitespace-nowrap outline-none transition-colors focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isLoading ? "[ ... ]" : "[ send ]"}
      </button>
    </form>
  );
}
