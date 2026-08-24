interface AnswerMetaProps {
  sources?: string[];
  provider?: string;
}

export function AnswerMeta({ sources, provider }: AnswerMetaProps) {
  if (!sources?.length && !provider) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
      {sources?.map((source) => (
        <span
          key={source}
          className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
        >
          {source}
        </span>
      ))}
      {provider && (
        <span className="rounded-full border border-neutral-200 px-2 py-0.5 text-neutral-500 dark:border-neutral-700 dark:text-neutral-500">
          via {provider}
        </span>
      )}
    </div>
  );
}
