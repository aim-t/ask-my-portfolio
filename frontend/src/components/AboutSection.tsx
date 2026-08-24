const STATS = [
  {
    label: "retrieval_recall@4",
    value: "100% (12/12)",
    detail: "measured by eval/run_eval.py against a handwritten 12-question set",
  },
  {
    label: "redteam_scope",
    value: "6 vulns x 4 attacks",
    detail:
      "deepteam probes prompt/instruction leakage, PII, misinformation, hallucination, goal hijacking",
  },
];

export function AboutSection() {
  return (
    <section className="text-sm">
      <p className="text-accent text-xs">visitor@aimantariq:~$ cat about.md</p>
      <div className="border-border bg-panel mt-2 rounded-lg border p-4">
        <p className="text-fg-dim leading-relaxed">
          This is a Retrieval-Augmented Generation chatbot: it retrieves answers from hand-written
          markdown files about my background (not a language model's general knowledge), then
          generates a response grounded in whatever it retrieved, using a multi-provider LLM
          fallback (OpenAI, Anthropic, Gemini, Groq). Every answer above shows which file it came
          from and which provider generated it, so the grounding claim is checkable, not just
          asserted.
        </p>

        <div className="border-border mt-4 border-t border-dashed pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-fg-dim">
                  <span className="text-accent">{"//"}</span> {stat.label}
                </div>
                <div className="text-fg mt-0.5 font-semibold">{stat.value}</div>
                <div className="text-fg-dim mt-0.5 text-xs leading-relaxed">{stat.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
