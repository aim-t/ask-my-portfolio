import { useState } from "react";
import { ChatPanel } from "../components/ChatPanel";

export function WidgetShell() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed right-5 bottom-5 z-[9999] font-sans">
      {isOpen && (
        <div className="absolute right-0 bottom-[4.5rem] flex h-[28rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl">
          <div className="flex items-start justify-between gap-2 bg-neutral-900 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Ask about Aiman</p>
              <p className="mt-0.5 text-xs text-neutral-400">
                Answers are grounded in her real CV.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1 text-neutral-400 outline-none hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-100"
            >
              &#10005;
            </button>
          </div>
          <ChatPanel className="flex-1 px-3 py-2" />
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-2xl text-white shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900"
      >
        &#128172;
      </button>
    </div>
  );
}
