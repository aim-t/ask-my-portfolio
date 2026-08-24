import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl dark:text-neutral-100">
          Ask My Portfolio
        </h1>
        <p className="mt-1 text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
          Ask questions about my background, answered from my real CV.
        </p>
      </div>
      <ThemeToggle />
    </header>
  );
}
