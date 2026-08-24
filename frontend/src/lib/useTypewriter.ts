import { useEffect, useState } from "react";

/**
 * Types out `text` one character at a time, starting after `delayMs`.
 * Assumes `text` is stable for the component's lifetime (both call
 * sites pass a constant string) - it does not reset mid-type if `text`
 * changes, to avoid a synchronous setState-in-effect on every change.
 */
export function useTypewriter(text: string, speedMs = 28, delayMs = 0) {
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const startId = setTimeout(() => {
      intervalId = setInterval(() => {
        i += 1;
        setOutput(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speedMs);
    }, delayMs);

    return () => {
      clearTimeout(startId);
      clearInterval(intervalId);
    };
  }, [text, speedMs, delayMs]);

  return { output, done };
}
