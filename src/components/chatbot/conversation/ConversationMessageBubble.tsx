/**
 * Conversation Message Bubble
 *
 * Minimal message display for conversation mode.
 * No inline decision metadata - just clean chat bubbles.
 */

import { format } from 'date-fns';
import type { Message } from '../../../types';

interface ConversationMessageBubbleProps {
  message: Message;
}

export default function ConversationMessageBubble({ message }: ConversationMessageBubbleProps) {
  const isAccordo = message.role === 'ACCORDO';
  const isSystem = message.role === 'SYSTEM';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 pt-2 pb-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAccordo ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] ${
          isAccordo
            ? 'bg-blue-600 dark:bg-blue-700 text-white'
            : 'bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text border border-gray-200 dark:border-dark-border'
        } rounded-2xl px-4 pt-3 pb-0 shadow-sm`}
      >
        {/* Role Label (small) */}
        <div
          className={`text-xs font-medium mb-1 ${
            isAccordo
              ? 'text-blue-100'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {message.role === 'VENDOR' ? 'You' : 'Accordo AI'}
        </div>

        {/* Message Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs mt-2 ${
            isAccordo
              ? 'text-blue-100'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {message.createdAt ? format(new Date(message.createdAt), 'h:mm a') : ''}
        </div>
      </div>
    </div>
  );
}
