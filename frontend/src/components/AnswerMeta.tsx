interface AnswerMetaProps {
  sources?: string[];
  provider?: string;
}

export function AnswerMeta({ sources, provider }: AnswerMetaProps) {
  if (!sources?.length && !provider) return null;

  return (
    <div className="text-fg-dim mt-1 ml-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      {sources?.map((source) => (
        <span key={source} className="border-border rounded border px-1.5 py-0.5">
          {source}
        </span>
      ))}
      {provider && <span className="text-accent-dim">via {provider}</span>}
    </div>
  );
}
