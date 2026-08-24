const STATS = [
  {
    label: "Retrieval recall@4",
    value: "100% (12/12)",
    detail: "Measured by eval/run_eval.py against a handwritten 12-question evaluation set.",
  },
  {
    label: "Red-team scan scope",
    value: "6 vulnerabilities x 4 attacks",
    detail:
      "DeepTeam probes prompt/instruction leakage, PII fabrication, misinformation, hallucination, goal hijacking, and social-engineering goal theft, via prompt injection, roleplay, system override, and goal redirection.",
  },
];

export function AboutSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        About this project
      </h2>
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        This is a Retrieval-Augmented Generation chatbot: it retrieves answers from hand-written
        markdown files about my background (not a language model's general knowledge), then
        generates a response grounded in whatever it retrieved, using a multi-provider LLM fallback
        (OpenAI, Anthropic, Gemini). Every answer above shows which file it came from and which
        provider generated it, so the grounding claim is checkable, not just asserted.
      </p>
      <dl className="grid gap-3 sm:grid-cols-2">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-neutral-500">
              {stat.label}
            </dt>
            <dd className="mt-1 text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {stat.value}
            </dd>
            <dd className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-500">
              {stat.detail}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
