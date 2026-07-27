import React from 'react';

interface LibraryPanelProps {
  onOpenResearch: () => void;
}

const savedBriefs = [
  {
    title: 'Innovation scan: quantum medicine',
    summary: 'A curated brief with source-backed notes and an editable report draft.',
    badge: 'Saved 2h ago',
  },
  {
    title: 'AI in clinical trials',
    summary: 'A cross-functional research pack that compares adoption, risks, and outcomes.',
    badge: 'Shared with team',
  },
  {
    title: 'Sustainable packaging brief',
    summary: 'A template-ready report for benchmarking suppliers and lifecycle concerns.',
    badge: 'Ready to export',
  },
];

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ onOpenResearch }) => {
  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-surface-border bg-white/95 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-outline">Research library</p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">Keep every brief organized and reusable.</h2>
          </div>
          <button
            type="button"
            onClick={onOpenResearch}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Start a new research run
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {savedBriefs.map((item) => (
          <article key={item.title} className="rounded-[24px] border border-surface-border bg-white/95 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-outline">{item.badge}</p>
                <h3 className="mt-2 text-lg font-semibold text-on-surface">{item.title}</h3>
              </div>
              <span className="rounded-full border border-surface-border bg-surface-container-low px-3 py-1 text-[11px] font-semibold text-primary">
                Draft
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">{item.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-full border border-surface-border px-3 py-2 text-sm font-medium text-on-surface transition hover:border-primary hover:text-primary">
                Preview
              </button>
              <button
                type="button"
                onClick={onOpenResearch}
                className="rounded-full bg-surface-container-low px-3 py-2 text-sm font-medium text-primary transition hover:bg-surface-container"
              >
                Open in chat
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
