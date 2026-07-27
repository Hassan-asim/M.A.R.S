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
    <article className="bg-report-bg border border-surface-border rounded-xl shadow-sm overflow-hidden my-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Approval Badge */}
      <div className="bg-agent-editor/10 px-4 py-3 border-b border-surface-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-agent-editor text-[20px]">
            verified
          </span>
          <span className="font-status-label text-xs font-bold text-agent-editor uppercase tracking-wider">
            Approved by Senior Editor Agent
          </span>
        </div>
        <span className="text-xs text-outline font-mono">{timestamp}</span>
      </div>

      {/* Rendered Markdown Body */}
      <div className="p-6 md:p-8 prose prose-slate max-w-none text-on-surface">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {reportMarkdown}
        </ReactMarkdown>

        {/* Collapsible Sources */}
        {sources && sources.length > 0 && (
          <details
            className="group border-t border-surface-border pt-4 mt-8"
            open={sourcesOpen}
            onToggle={(e) => setSourcesOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-semibold text-outline hover:text-primary transition-colors">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">link</span>
                <span>VIEW RESEARCH SOURCES ({sources.length})</span>
              </div>
              <span className={`material-symbols-outlined transition-transform ${sourcesOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </summary>
            <ul className="mt-3 space-y-2 pl-4">
              {sources.map((src, i) => (
                <li key={i} className="text-xs text-agent-researcher-a hover:underline break-all">
                  <a href={src} target="_blank" rel="noopener noreferrer">
                    🔗 {src}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Action Buttons */}
        <div className="mt-8 pt-4 border-t border-surface-border flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 py-3 px-4 bg-primary text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download Report (.md)
          </button>
          <button
            onClick={handleCopy}
            className="py-3 px-6 bg-white border border-surface-border text-on-surface font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-surface-container-low active:scale-[0.98] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied to Clipboard!' : 'Copy Markdown'}
          </button>
        </div>
      </div>
    </article>
  );
};
