'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatHeader } from '@/components/ChatHeader';
import { AgentStatusRow } from '@/components/AgentStatusRow';
import { FinalReportBubble } from '@/components/FinalReportBubble';
import { MessageInputBar } from '@/components/MessageInputBar';

interface ChatItem {
  id: string;
  type: 'user' | 'agent_status' | 'final_report';
  // User fields
  userTopic?: string;
  fileName?: string;
  timestamp?: string;
  // Status fields
  statusType?: 'agent_start' | 'agent_done' | 'handoff';
  agent?: string;
  label?: string;
  from?: string;
  to?: string;
  // Report fields
  reportMarkdown?: string;
  sources?: string[];
}

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
    setIsLoading(true);

    const userMessageId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItems: ChatItem[] = [
      ...chatItems,
      {
        id: userMessageId,
        type: 'user',
        userTopic: topic || (file ? `Attached Document: ${file.name}` : ''),
        fileName: file?.name,
        timestamp,
      },
    ];

    setChatItems(newItems);

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
        buffer = lines.pop() || ''; // Keep partial line in buffer

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

      // Flush any remaining buffer line
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
    <div className="min-h-screen flex flex-col bg-background font-chat-bubble text-on-surface">
      <ChatHeader />

      <main className="pt-20 pb-36 px-4 md:px-8 max-w-report-max-width mx-auto w-full flex flex-col gap-6">
        {chatItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-16 text-center text-on-surface-variant gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
              🛰️
            </div>
            <h2 className="font-report-h1 text-2xl font-bold text-primary">
              Welcome to M.A.R.S
            </h2>
            <p className="text-sm max-w-md">
              Multi-Agent Research System. Enter a topic or upload notes/documents (.pdf, .docx, .md, .txt) to activate the 6-agent collaborative team.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 text-xs font-mono">
              <span className="bg-white border border-surface-border px-3 py-2 rounded-lg text-agent-planner">
                1. Planner
              </span>
              <span className="bg-white border border-surface-border px-3 py-2 rounded-lg text-agent-researcher-a">
                2. Researcher A
              </span>
              <span className="bg-white border border-surface-border px-3 py-2 rounded-lg text-agent-researcher-b">
                3. Researcher B
              </span>
              <span className="bg-white border border-surface-border px-3 py-2 rounded-lg text-agent-fact-checker">
                4. Fact-Checker
              </span>
              <span className="bg-white border border-surface-border px-3 py-2 rounded-lg text-agent-writer">
                5. Writer
              </span>
              <span className="bg-white border border-surface-border px-3 py-2 rounded-lg text-agent-editor">
                6. Editor
              </span>
            </div>
          </div>
        ) : (
          chatItems.map((item) => {
            if (item.type === 'user') {
              return (
                <div key={item.id} className="flex flex-col items-end w-full animate-fade-in">
                  <div className="bg-primary text-white p-4 rounded-xl rounded-tr-none max-w-[85%] shadow-sm">
                    <p className="text-sm leading-relaxed">{item.userTopic}</p>
                    {item.fileName && (
                      <div className="mt-2 flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-md text-xs">
                        <span className="material-symbols-outlined text-[16px]">
                          description
                        </span>
                        <span className="truncate">{item.fileName}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-outline mt-1 mr-1">{item.timestamp}</span>
                </div>
              );
            } else if (item.type === 'agent_status') {
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
            } else if (item.type === 'final_report') {
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
          })
        )}

        <div ref={bottomRef} />
      </main>

      <MessageInputBar onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
