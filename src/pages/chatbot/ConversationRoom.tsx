/**
 * Conversation Room Page
 *
 * Natural language negotiation interface for CONVERSATION mode.
 * Simpler UI than INSIGHTS mode - just chat messages without decision metadata inline.
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiRefreshCw, FiInfo, FiArrowLeft } from 'react-icons/fi';
// @ts-ignore - hooks are JS files without type definitions
import { useConversation } from '../../hooks/chatbot/useConversation';
// @ts-ignore - components are JS files without type definitions
import ChatTranscript from '../../components/chatbot/chat/ChatTranscript';
// @ts-ignore - components are JS files without type definitions
import Composer from '../../components/chatbot/chat/Composer';
// @ts-ignore - components are JS files without type definitions
import ConversationMessageBubble from '../../components/chatbot/conversation/ConversationMessageBubble';
// @ts-ignore - components are JS files without type definitions
import ExplainDrawer from '../../components/chatbot/conversation/ExplainDrawer';

export default function ConversationRoom() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const {
    deal,
    messages,
    loading,
    sending,
    canSend,
    isTerminal,
    revealAvailable,
    sendMessage,
    reload,
  } = useConversation(dealId);

  const [showExplainability, setShowExplainability] = useState<boolean>(false);

  const handleSendMessage = async (content: string): Promise<void> => {
    await sendMessage(content);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Deal not found</p>
          <button
            onClick={() => navigate('/chatbot')}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Deals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/chatbot')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Back to deals"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                {deal.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    deal.status === 'NEGOTIATING'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : deal.status === 'ACCEPTED'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : deal.status === 'WALKED_AWAY'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {deal.status}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Round {deal.round}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  Conversation Mode
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {revealAvailable && (
              <button
                onClick={() => setShowExplainability(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <FiInfo className="w-4 h-4" />
                Show Decision
              </button>
            )}

            <button
              onClick={reload}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Transcript */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {React.createElement(ChatTranscript as any, {
            messages,
            loading,
            sending,
            MessageComponent: ConversationMessageBubble,
          })}
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 z-10 border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
          {React.createElement(Composer as any, {
            onSend: handleSendMessage,
            disabled: !canSend,
            sending,
            placeholder: isTerminal
              ? `This negotiation has ${deal.status.toLowerCase().replace('_', ' ')}`
              : 'Type your message...',
            showScenarios: false,
          })}
        </div>
      </div>

      {/* Explainability Drawer */}
      {showExplainability && dealId && (
        <ExplainDrawer
          dealId={dealId}
          isOpen={showExplainability}
          onClose={() => setShowExplainability(false)}
        />
      )}
    </div>
  );
}
