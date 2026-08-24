import { useTheme } from "../lib/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="text-fg-dim hover:text-accent hover:border-accent border-border focus-visible:ring-accent shrink-0 rounded-md border px-2.5 py-1.5 text-xs whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      [{theme === "dark" ? " crt " : " ink "}]
    </button>
  );
}
