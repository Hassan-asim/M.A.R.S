import React from 'react';

const settingsCards = [
  {
    title: 'Connected accounts',
    body: 'Sign in with Google to save notes, sync research across devices, and access your history.',
    action: 'Continue with Google',
  },
  {
    title: 'Agent workflow',
    body: 'Choose how the planner, researchers, fact-checker, writer, and editor collaborate on every task.',
    action: 'Customize pipeline',
  },
  {
    title: 'Export defaults',
    body: 'Set markdown, citation, and source formatting preferences for every generated report.',
    action: 'Edit defaults',
  },
];

export const SettingsPanel: React.FC = () => {
  return (
    <section className="space-y-4">
      <div className="rounded-[24px] border border-surface-border bg-white/95 p-5 shadow-sm sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-outline">Settings</p>
        <h2 className="mt-2 text-2xl font-semibold text-primary">Control your research workspace and account experience.</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {settingsCards.map((item) => (
          <article key={item.title} className="rounded-[24px] border border-surface-border bg-white/95 p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-on-surface">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">{item.body}</p>
            <button className="mt-4 rounded-full border border-surface-border px-3 py-2 text-sm font-medium text-primary transition hover:border-primary">
              {item.action}
            </button>
          </article>
        ))}
      </div>

      <div className="rounded-[24px] border border-surface-border bg-surface-container-low p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">Google sign-in</h3>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Add a Google sign-in option so users can save sessions and access their workspace securely.
            </p>
          </div>
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
            Sign in with Google
          </button>
        </div>
      </div>
    </section>
  );
};
