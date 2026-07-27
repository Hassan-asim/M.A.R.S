'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import { AgentStatusRow } from '@/components/AgentStatusRow';
import { FinalReportBubble } from '@/components/FinalReportBubble';
import { MessageInputBar } from '@/components/MessageInputBar';

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
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatItems]);

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

  return (
    <div className="min-h-screen bg-background font-chat-bubble text-on-surface">
      <ChatHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-40 pt-24 md:px-8 md:pb-36">
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
      </main>

      <MessageInputBar onSend={handleSend} isLoading={isLoading} />

      <nav className="fixed bottom-0 left-0 z-[60] flex h-16 w-full items-center justify-around border-t border-surface-border bg-surface px-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] md:hidden">
        <a className="flex flex-col items-center justify-center text-primary" href="#">
          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
          <span className="mt-1 text-[10px] font-semibold">Research</span>
        </a>
        <a className="flex flex-col items-center justify-center text-outline" href="#">
          <span className="material-symbols-outlined text-[20px]">history_edu</span>
          <span className="mt-1 text-[10px] font-semibold">Library</span>
        </a>
        <a className="flex flex-col items-center justify-center text-outline" href="#">
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="mt-1 text-[10px] font-semibold">Settings</span>
        </a>
      </nav>
    </div>
  );
}
