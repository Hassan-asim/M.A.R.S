import React from 'react';
import { getInitials, type AuthUser } from '@/lib/auth';

interface ChatHeaderProps {
  user: AuthUser | null;
  onSignIn: () => void;
  onLogout: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ user, onSignIn, onLogout }) => {

  return (
    <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-surface-border bg-surface/85 px-4 py-3 shadow-sm backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-sm">
          <img src="/logo.png" alt="M.A.R.S logo" className="h-8 w-8 object-contain" />
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
        {user ? (
          <div className="flex items-center gap-2 rounded-full border border-surface-border bg-white px-2 py-1 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {getInitials(user.name)}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-on-surface">{user.name}</p>
              <p className="text-[11px] text-outline">Signed in</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full p-1.5 text-outline transition hover:bg-surface-container-low"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onSignIn}
            className="flex items-center gap-2 rounded-full border border-surface-border bg-white px-3 py-2 text-sm font-medium text-on-surface shadow-sm transition hover:border-primary hover:text-primary"
            title="Sign in with Google"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">account_circle</span>
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
};
