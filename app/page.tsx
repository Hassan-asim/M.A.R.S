'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import { AgentStatusRow } from '@/components/AgentStatusRow';
import { FinalReportBubble } from '@/components/FinalReportBubble';
import { MessageInputBar } from '@/components/MessageInputBar';
import { LibraryPanel } from '@/components/LibraryPanel';
import { SettingsPanel } from '@/components/SettingsPanel';
import { clearAuthSession, readAuthSession, type AuthUser } from '@/lib/auth';

interface ChatItem {
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
}

const QUICK_PROMPTS = [
  'Summarize the latest breakthroughs in quantum computing for medicine.',
  'Compare the current state of AI-assisted drug discovery and clinical trials.',
  'Expand this research note with recent academic findings and practical implications.',
];

export default function Home() {
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'research' | 'library' | 'settings'>('research');
  const [isHydrated, setIsHydrated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatItems]);

  useEffect(() => {
    const syncAuth = () => {
      setUser(readAuthSession());
    };

    try {
      const savedItems = window.localStorage.getItem('mars-chat-items');
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems) as ChatItem[];
        if (Array.isArray(parsedItems)) {
          setChatItems(parsedItems);
        }
      }

      const savedView = window.localStorage.getItem('mars-active-view');
      if (savedView === 'library' || savedView === 'settings') {
        setActiveView(savedView);
      }
    } catch (error) {
      console.warn('Unable to restore local app state:', error);
    } finally {
      syncAuth();
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem('mars-chat-items', JSON.stringify(chatItems));
  }, [chatItems, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem('mars-active-view', activeView);
  }, [activeView, isHydrated]);

  const handleSend = async (topic: string, file: File | null) => {
    if (!topic.trim() && !file) return;

    setIsLoading(true);

    const userMessageId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMessage: ChatItem = {
      id: userMessageId,
      type: 'user',
      userTopic: topic || (file ? `Attached Document: ${file.name}` : ''),
      fileName: file?.name,
      timestamp,
    };

    setChatItems((prev) => [...prev, userMessage]);

    const formData = new FormData();
    if (topic) formData.append('topic', topic);
    if (file) formData.append('file', file);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const rawJson = trimmed.replace(/^data:\s*/, '');
            try {
              const event = JSON.parse(rawJson);
              handleStreamEvent(event, topic);
            } catch (err) {
              console.warn('Failed to parse SSE JSON:', rawJson, err);
            }
          }
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        const rawJson = buffer.trim().replace(/^data:\s*/, '');
        try {
          const event = JSON.parse(rawJson);
          handleStreamEvent(event, topic);
        } catch (err) {
          console.warn('Failed to parse trailing SSE JSON:', rawJson, err);
        }
      }
    } catch (error: any) {
      console.error('Error communicating with /api/research:', error);
      setChatItems((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: 'agent_status',
          statusType: 'agent_done',
          agent: 'fact_checker',
          label: `Error: ${error.message || 'Failed to complete research request.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamEvent = (event: any, originalTopic: string) => {
    if (event.type === 'agent_start' || event.type === 'agent_done' || event.type === 'handoff') {
      setChatItems((prev) => [
        ...prev,
        {
          id: `status-${Date.now()}-${Math.random()}`,
          type: 'agent_status',
          statusType: event.type,
          agent: event.agent,
          label: event.label,
          from: event.from,
          to: event.to,
        },
      ]);
    } else if (event.type === 'final_report') {
      setChatItems((prev) => [
        ...prev,
        {
          id: `report-${Date.now()}`,
          type: 'final_report',
          reportMarkdown: event.reportMarkdown,
          sources: event.sources,
          userTopic: originalTopic || 'M.A.R.S Research',
        },
      ]);
    } else if (event.type === 'error') {
      setChatItems((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: 'agent_status',
          statusType: 'agent_done',
          agent: 'editor',
          label: `Error: ${event.error}`,
        },
      ]);
    }
  };

  const handleSignIn = () => {
    window.location.assign('/api/auth/google/start');
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
  };

  const renderContent = () => {
    if (activeView === 'library') {
      return <LibraryPanel onOpenResearch={() => setActiveView('research')} />;
    }

    if (activeView === 'settings') {
      return <SettingsPanel />;
    }

    return (
      <>
        {chatItems.length === 0 ? (
          <section className="overflow-hidden rounded-[28px] border border-surface-border bg-white/95 p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center rounded-full border border-surface-border bg-surface-container-low px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                  <span className="material-symbols-outlined mr-2 text-[14px]">auto_awesome</span>
                  Research Studio
                </div>
                <h2 className="font-report-h1 text-2xl leading-tight text-primary md:text-3xl">
                  Build a polished research brief with a team of AI agents.
                </h2>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                  Start with a topic, upload notes, and let the Planner, Researchers, Fact-Checker, Writer, and Editor collaborate on a structured report in real time.
                </p>
              </div>
              <div className="rounded-2xl border border-surface-border bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
                <p className="font-semibold text-primary">Live workflow</p>
                <ul className="mt-2 space-y-2 text-xs">
                  <li>• Planner breaks down the question</li>
                  <li>• Researchers gather evidence</li>
                  <li>• Editor approves the final report</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-surface-border bg-surface-container-low p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-outline">
                <span className="material-symbols-outlined text-[16px] text-primary">rocket_launch</span>
                Suggested starters
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSend(prompt, null)}
                    className="animate-fade-in rounded-2xl border border-surface-border bg-white px-3 py-3 text-left text-sm text-on-surface transition hover:-translate-y-0.5 hover:border-primary hover:bg-surface-container-low"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <div className="flex flex-col gap-4">
            {chatItems.map((item) => {
              if (item.type === 'user') {
                return (
                  <div key={item.id} className="flex w-full flex-col items-end animate-fade-in">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-none border border-surface-border bg-primary px-4 py-3 text-white shadow-sm">
                      <p className="text-sm leading-6">{item.userTopic}</p>
                      {item.fileName && (
                        <div className="mt-2 flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                          <span className="material-symbols-outlined text-[16px]">description</span>
                          <span className="truncate">{item.fileName}</span>
                        </div>
                      )}
                    </div>
                    <span className="mr-1 mt-1 text-[11px] text-outline">{item.timestamp}</span>
                  </div>
                );
              }

              if (item.type === 'agent_status') {
                return (
                  <AgentStatusRow
                    key={item.id}
                    type={item.statusType || 'agent_start'}
                    agent={item.agent}
                    label={item.label}
                    from={item.from}
                    to={item.to}
                  />
                );
              }

              if (item.type === 'final_report') {
                return (
                  <FinalReportBubble
                    key={item.id}
                    reportMarkdown={item.reportMarkdown || ''}
                    sources={item.sources || []}
                    topicTitle={item.userTopic || 'M.A.R.S Report'}
                  />
                );
              }

              return null;
            })}
          </div>
        )}

        <div ref={bottomRef} />
      </>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background font-chat-bubble text-on-surface">
        <ChatHeader user={user} onSignIn={handleSignIn} onLogout={handleLogout} />

        <main className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-4 pb-40 pt-28 md:px-8">
          <section className="w-full rounded-[28px] border border-surface-border bg-white/95 p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[28px]">lock</span>
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-primary">Sign in to use M.A.R.S</h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              Your research workspace is private to your signed-in account. Please sign in with Google to continue using the chat, library, and settings experience.
            </p>
            <button
              type="button"
              onClick={handleSignIn}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              Continue with Google
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-chat-bubble text-on-surface">
      <ChatHeader user={user} onSignIn={handleSignIn} onLogout={handleLogout} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-40 pt-24 md:px-8 md:pb-36">
        <div className="hidden items-center justify-end gap-2 rounded-full border border-surface-border bg-white/90 p-1 shadow-sm md:flex">
          {[
            { id: 'research', label: 'Research', icon: 'chat_bubble' },
            { id: 'library', label: 'Library', icon: 'history_edu' },
            { id: 'settings', label: 'Settings', icon: 'settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id as 'research' | 'library' | 'settings')}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition ${activeView === tab.id ? 'bg-primary text-white' : 'text-outline hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </main>

      {activeView === 'research' && <MessageInputBar onSend={handleSend} isLoading={isLoading} />}

      <nav className="fixed bottom-0 left-0 z-[60] flex h-16 w-full items-center justify-around border-t border-surface-border bg-surface px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden">
        {[
          { id: 'research', label: 'Research', icon: 'chat_bubble' },
          { id: 'library', label: 'Library', icon: 'history_edu' },
          { id: 'settings', label: 'Settings', icon: 'settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveView(tab.id as 'research' | 'library' | 'settings')}
            className={`flex flex-col items-center justify-center ${activeView === tab.id ? 'text-primary' : 'text-outline'}`}
          >
            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
            <span className="mt-1 text-[10px] font-semibold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
