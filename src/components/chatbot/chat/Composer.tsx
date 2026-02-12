/**
 * Composer Component
 *
 * Simple message input with send button for negotiation chat.
 */

import { useRef, useEffect } from "react";
import type { DealStatus } from '../../../types';

interface ComposerProps {
  onSend: (message: string) => void;
  inputText: string;
  onInputChange: (text: string) => void;
  sending: boolean;
  dealStatus?: DealStatus;
  canSend?: boolean;
  vendorMode?: boolean;
}

export default function Composer({
  onSend,
  inputText,
  onInputChange,
  sending,
  dealStatus,
  canSend = true,
  vendorMode = false,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const lineHeight = 24;
      const minHeight = lineHeight * 1;
      const maxHeight = lineHeight * 5;
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputText]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !sending) {
        onSend(inputText);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border px-4 py-4 pb-6 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      {/* Input Row */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            !canSend && dealStatus === "ESCALATED"
              ? "Deal is Escalated. Reset or Resume."
              : !canSend
              ? "Deal is closed"
              : vendorMode
              ? "Type your offer to the buyer..."
              : "Type your counter-offer..."
          }
          disabled={sending || !canSend}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed resize-none overflow-y-auto bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          rows={1}
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
        <button
          onClick={() => onSend(inputText)}
          disabled={sending || !inputText.trim() || !canSend}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
