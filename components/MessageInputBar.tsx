import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';

interface MessageInputBarProps {
  onSend: (topic: string, file: File | null) => void;
  isLoading: boolean;
}

export const MessageInputBar: React.FC<MessageInputBarProps> = ({
  onSend,
  isLoading,
}) => {
  const [topic, setTopic] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if ((!topic.trim() && !attachedFile) || isLoading) return;
    onSend(topic, attachedFile);
    setTopic('');
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <footer className="fixed bottom-16 left-0 z-50 w-full border-t border-surface-border bg-surface/90 px-4 py-4 pb-6 backdrop-blur-xl md:bottom-0 md:pb-4">
      <div className="mx-auto flex max-w-report-max-width flex-col gap-2">
        {attachedFile && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex items-center gap-2 rounded-full border border-surface-border bg-white px-3 py-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-agent-researcher-a">description</span>
              <span className="max-w-[180px] truncate text-xs font-medium text-on-surface">
                {attachedFile.name}
              </span>
              <button
                type="button"
                onClick={removeFile}
                className="material-symbols-outlined text-[16px] text-outline-variant transition-colors hover:text-error"
                title="Remove file"
              >
                close
              </button>
            </div>
          </div>
        )}

        <div className="relative flex items-center overflow-hidden rounded-2xl border border-surface-border bg-white shadow-sm transition-colors focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(0,51,66,0.08)]">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.md,.txt"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-outline transition-colors hover:text-primary"
            title="Attach document (.pdf, .docx, .md, .txt)"
            disabled={isLoading}
          >
            <span className="material-symbols-outlined">attach_file</span>
          </button>

          <textarea
            ref={textareaRef}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask M.A.R.S a follow-up or provide more data..."
            rows={1}
            className="max-h-32 w-full resize-none border-none bg-transparent py-3 text-sm text-on-surface focus:outline-none focus:ring-0"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!topic.trim() && !attachedFile) || isLoading}
            className="mr-1 rounded-lg p-3 text-primary transition-all hover:bg-surface-container-low active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            title="Send to M.A.R.S Agents"
          >
            <span className="material-symbols-outlined font-bold">
              {isLoading ? 'autorenew' : 'send'}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};
