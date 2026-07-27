import React from 'react';

export const ChatHeader: React.FC = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-border shadow-sm flex justify-between items-center px-4 md:px-8 py-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary text-white font-bold text-lg shadow-sm">
          🚀
        </div>
        <div className="flex flex-col">
          <h1 className="font-report-h1 text-xl md:text-2xl text-primary tracking-tight leading-none font-bold">
            M.A.R.S
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-outline font-status-label">
            Precision Multi-Agent Intelligence
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden md:inline-block text-xs text-on-surface-variant font-medium bg-surface-container px-3 py-1 rounded-full border border-surface-border">
          6 Autonomous AI Agents
        </span>
        <button
          className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low transition-colors p-2 rounded-full"
          title="M.A.R.S System Info"
        >
          account_circle
        </button>
      </div>
    </header>
  );
};
