import React from 'react';

export const ChatHeader: React.FC = () => {
  return (
    <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-surface-border bg-surface/85 px-4 py-3 shadow-sm backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white shadow-sm">
          <span className="material-symbols-outlined text-[20px]">science</span>
        </div>
        <div className="flex flex-col">
          <h1 className="font-report-h1 text-xl font-bold leading-none tracking-tight text-primary md:text-2xl">
            M.A.R.S
          </h1>
          <span className="text-[10px] uppercase tracking-[0.2em] text-outline font-status-label">
            Your AI research team — plan, search, verify, write, approve.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-surface-border bg-surface-container-low px-3 py-1 text-xs font-medium text-on-surface-variant md:inline-block">
          6 Autonomous AI Agents
        </span>
        <button
          className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
          title="M.A.R.S System Info"
        >
          <span className="material-symbols-outlined text-[20px]">account_circle</span>
        </button>
      </div>
    </header>
  );
};
