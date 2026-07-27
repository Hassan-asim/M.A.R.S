import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FinalReportBubbleProps {
  reportMarkdown: string;
  sources: string[];
  status?: string;
  timestamp?: string;
  topicTitle?: string;
}

export const FinalReportBubble: React.FC<FinalReportBubbleProps> = ({
  reportMarkdown,
  sources,
  status = 'approved',
  timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  topicTitle = 'Research Report',
}) => {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${topicTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy report to clipboard:', err);
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-surface-border bg-report-bg shadow-sm">
      <div className="flex items-center justify-between border-b border-surface-border bg-agent-editor/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-agent-editor">verified</span>
          <span className="font-status-label text-xs font-bold uppercase tracking-[0.2em] text-agent-editor">
            Approved by Senior Editor Agent
          </span>
        </div>
        <span className="text-xs text-outline">{timestamp}</span>
      </div>

      <div className="p-5 md:p-8">
        <div className="prose max-w-none text-on-surface">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportMarkdown}</ReactMarkdown>
        </div>

        {sources && sources.length > 0 && (
          <details
            className="mt-8 border-t border-surface-border pt-4"
            open={sourcesOpen}
            onToggle={(e) => setSourcesOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-outline transition-colors hover:text-primary">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">link</span>
                <span>Research Sources ({sources.length})</span>
              </div>
              <span className={`material-symbols-outlined text-[16px] transition-transform ${sourcesOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </summary>
            <ul className="mt-3 space-y-2 pl-4">
              {sources.map((src, i) => (
                <li key={i} className="break-all text-xs text-agent-researcher-a hover:underline">
                  <a href={src} target="_blank" rel="noopener noreferrer">
                    🔗 {src}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-surface-border pt-4 sm:flex-row">
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download Report (.md)
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-3 font-medium text-on-surface shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
            {copied ? 'Copied to Clipboard!' : 'Copy Markdown'}
          </button>
        </div>
      </div>
    </article>
  );
};
