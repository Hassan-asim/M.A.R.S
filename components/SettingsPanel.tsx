import React from 'react';
import { type AuthUser } from '@/lib/auth';

interface UserPreferences {
  outputFormat: 'markdown' | 'executive' | 'bullet';
  researchDepth: 'fast' | 'balanced' | 'deep';
  tone: 'concise' | 'formal' | 'analytical';
  autoSave: boolean;
}

interface SettingsPanelProps {
  user: AuthUser | null;
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onSignOut: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ user, preferences, onPreferencesChange, onSignOut }) => {
  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    onPreferencesChange({ ...preferences, [key]: value });
  };

  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-surface-border bg-white/95 p-5 shadow-sm sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-outline">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-primary">Control your research workspace and account experience.</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-surface-border bg-white/95 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-on-surface">Research defaults</h3>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">Tune how future briefs are structured and delivered.</p>
          <div className="mt-4 space-y-3">
            <label className="flex flex-col gap-1 text-sm text-on-surface">
              <span className="font-medium">Output format</span>
              <select
                value={preferences.outputFormat}
                onChange={(event) => updatePreference('outputFormat', event.target.value as UserPreferences['outputFormat'])}
                className="rounded-2xl border border-surface-border bg-surface-container-low px-3 py-2 text-sm"
              >
                <option value="markdown">Markdown report</option>
                <option value="executive">Executive summary</option>
                <option value="bullet">Bullet brief</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-on-surface">
              <span className="font-medium">Research depth</span>
              <select
                value={preferences.researchDepth}
                onChange={(event) => updatePreference('researchDepth', event.target.value as UserPreferences['researchDepth'])}
                className="rounded-2xl border border-surface-border bg-surface-container-low px-3 py-2 text-sm"
              >
                <option value="fast">Fast scan</option>
                <option value="balanced">Balanced</option>
                <option value="deep">Deep dive</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-on-surface">
              <span className="font-medium">Writing tone</span>
              <select
                value={preferences.tone}
                onChange={(event) => updatePreference('tone', event.target.value as UserPreferences['tone'])}
                className="rounded-2xl border border-surface-border bg-surface-container-low px-3 py-2 text-sm"
              >
                <option value="concise">Concise</option>
                <option value="formal">Formal</option>
                <option value="analytical">Analytical</option>
              </select>
            </label>
          </div>
        </article>

        <article className="rounded-[24px] border border-surface-border bg-white/95 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-on-surface">Workspace behavior</h3>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">Keep your research history and drafts organized with a few simple preferences.</p>
          <label className="mt-4 flex items-center justify-between rounded-2xl border border-surface-border bg-surface-container-low px-3 py-3 text-sm text-on-surface">
            <span>Auto-save research threads</span>
            <input
              type="checkbox"
              checked={preferences.autoSave}
              onChange={(event) => updatePreference('autoSave', event.target.checked)}
              className="h-4 w-4 rounded border-surface-border text-primary"
            />
          </label>

          <div className="mt-4 rounded-2xl border border-surface-border bg-surface-container-low p-3 text-sm text-on-surface-variant">
            <p className="font-semibold text-primary">Account</p>
            <p className="mt-2">
              {user ? `Signed in as ${user.email}. Your workspace settings are stored locally in this browser.` : 'Sign in from the top navigation to connect your workspace.'}
            </p>
            {user && (
              <button
                type="button"
                onClick={onSignOut}
                className="mt-3 rounded-full border border-surface-border bg-white px-3 py-2 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary"
              >
                Sign out
              </button>
            )}
          </div>
        </article>
      </div>
    </section>
  );
};
