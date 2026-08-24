import { useTypewriter } from "../lib/useTypewriter";
import { ThemeToggle } from "./ThemeToggle";

const TITLE = "Ask My Portfolio";
const PITCH = "Ask questions about my background, answered from my real CV.";

export function Header() {
  const title = useTypewriter(TITLE, 55);
  const pitch = useTypewriter(PITCH, 16, TITLE.length * 55 + 200);

  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <p className="stagger-in text-accent text-xs tracking-wide">visitor@aimantariq:~$ whoami</p>
        <h1 className="text-fg mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {title.output}
          {!pitch.done && <span className="cursor-blink text-accent">_</span>}
        </h1>
        <p className="text-fg-dim mt-2 min-h-[1.5em] text-sm sm:text-base">
          {pitch.output}
          {title.done && pitch.done && <span className="cursor-blink text-accent">_</span>}
        </p>
      </div>
      <div className="stagger-in shrink-0" style={{ animationDelay: "0.1s" }}>
        <ThemeToggle />
      </div>
    </header>
  );
}
