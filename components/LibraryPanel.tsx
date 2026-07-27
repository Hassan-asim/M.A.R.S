import React from 'react';

interface LibrarySession {
  id: string;
  title: string;
  updatedAt: string;
  items: Array<{
    id: string;
    type: 'user' | 'agent_status' | 'final_report';
    userTopic?: string;
    fileName?: string;
    timestamp?: string;
    statusType?: 'agent_start' | 'agent_done' | 'handoff';
    agent?: string;
    label?: string;
    from?: string;
    to?: string;
    reportMarkdown?: string;
    sources?: string[];
  }>;
}

interface LibraryPanelProps {
  sessions: LibrarySession[];
  onOpenResearch: () => void;
  onOpenSession: (sessionId: string) => void;
  onStartNewChat: () => void;
}

const formatUpdatedAt = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Saved recently' : date.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ sessions, onOpenResearch, onOpenSession, onStartNewChat }) => {
  const getSummary = (session: LibrarySession) => {
    const finalReport = session.items.find((item) => item.type === 'final_report');
    if (finalReport?.reportMarkdown) {
      return finalReport.reportMarkdown.replace(/[#>*`\n]/g, ' ').slice(0, 140);
    }

    const firstUser = session.items.find((item) => item.type === 'user');
    return firstUser?.userTopic || 'Continue this research session from the saved workspace.';
  };

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
            onClick={() => {
              onStartNewChat();
              onOpenResearch();
            }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Start a new research run
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-[24px] border border-surface-border bg-white/95 p-6 text-sm leading-7 text-on-surface-variant shadow-sm">
          Your saved chats will appear here once you start a research thread and keep it for later.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sessions.map((session) => (
            <article key={session.id} className="rounded-[24px] border border-surface-border bg-white/95 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-outline">{formatUpdatedAt(session.updatedAt)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-on-surface">{session.title}</h3>
                </div>
                <span className="rounded-full border border-surface-border bg-surface-container-low px-3 py-1 text-[11px] font-semibold text-primary">
                  {session.items.some((item) => item.type === 'final_report') ? 'Completed' : 'Draft'}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">{getSummary(session)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSession(session.id)}
                  className="rounded-full bg-surface-container-low px-3 py-2 text-sm font-medium text-primary transition hover:bg-surface-container"
                >
                  Open in chat
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
