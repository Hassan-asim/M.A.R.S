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
    <footer className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl px-4 md:px-8 py-4 pb-6 md:pb-4 border-t border-surface-border z-50">
      <div className="max-w-report-max-width mx-auto flex flex-col gap-2">
        {/* Contextual File Chip */}
        {attachedFile && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex items-center gap-2 bg-white border border-surface-border px-3 py-1.5 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-agent-researcher-a text-[18px]">
                description
              </span>
              <span className="text-xs font-medium text-on-surface truncate max-w-[180px]">
                {attachedFile.name}
              </span>
              <button
                type="button"
                onClick={removeFile}
                className="material-symbols-outlined text-outline-variant hover:text-error text-[16px] transition-colors"
                title="Remove file"
              >
                close
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="relative flex items-center bg-white border border-surface-border rounded-xl shadow-md overflow-hidden focus-within:border-primary transition-colors">
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
            className="p-3 text-outline hover:text-primary transition-colors"
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
            placeholder="Enter a research topic, or describe what you want expanded..."
            rows={1}
            className="w-full py-3 bg-transparent border-none focus:ring-0 text-sm text-on-surface resize-none max-h-32 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!topic.trim() && !attachedFile) || isLoading}
            className="p-3 mr-1 text-primary hover:bg-surface-container-low rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
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
