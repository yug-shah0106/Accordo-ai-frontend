/**
 * ConversationEnhanced Component
 *
 * Enhanced conversation interface with comprehensive state tracking.
 * Shows phase indicators, refusal warnings, intent badges, turn counters,
 * small talk indicators, and context awareness display.
 *
 * Features:
 * - Phase indicator badge (color-coded)
 * - Refusal counter with visual warning
 * - Intent badges on messages (GREET, ASK_OFFER, COUNTER, etc.)
 * - Turn counter
 * - Small talk indicator
 * - Context awareness display (mentioned price, terms, constraints)
 *
 * Layout:
 * - Top bar: Phase indicator + Refusal warning + Turn count
 * - Main area: Message transcript with intent badges
 * - Bottom: Enhanced composer with suggested responses
 * - Sidebar: Conversation state panel
 *
 * @example
 * ```tsx
 * <ConversationEnhanced dealId="deal-123" />
 * ```
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useConversation } from '../../../hooks/chatbot/useConversation';
import type {
  Message,
  ConversationPhase,
  ConversationIntent,
  Offer,
  ConversationState,
  Deal,
} from '../../../types/chatbot';
import type { WarningLevel } from '../../../hooks/chatbot/useConversation';

// ============================================================================
// Types
// ============================================================================

export interface ConversationEnhancedProps {
  dealId: string;
  className?: string;
  showSidebar?: boolean;
  showSuggestedResponses?: boolean;
}

interface ContextData {
  mentionedPrice: number | null;
  mentionedTerms: string | null;
  constraints: string[];
}

// ============================================================================
// Component
// ============================================================================

export function ConversationEnhanced({
  dealId,
  className = '',
  showSidebar = true,
  showSuggestedResponses = true,
}: ConversationEnhancedProps) {
  // ============================================================================
  // State
  // ============================================================================

  const {
    deal,
    messages,
    convoState,
    loading,
    sending,
    error,
    sendMessage,
    startConversation,
    reload,
    currentPhase,
    refusalCount,
    turnCount,
    canSend,
    warningLevel,
  } = useConversation(dealId);

  const [inputText, setInputText] = useState('');
  const [showStatePanel, setShowStatePanel] = useState(showSidebar);

  // ============================================================================
  // Computed Context
  // ============================================================================

  const contextData: ContextData = React.useMemo(() => {
    const vendorMessages = messages.filter((m) => m.role === 'VENDOR');
    const lastMessage = vendorMessages[vendorMessages.length - 1];

    let mentionedPrice: number | null = null;
    let mentionedTerms: string | null = null;
    const constraints: string[] = [];

    // Extract price from last vendor message
    if (lastMessage?.extractedOffer?.unit_price) {
      mentionedPrice = lastMessage.extractedOffer.unit_price;
    }

    // Extract terms from last vendor message
    if (lastMessage?.extractedOffer?.payment_terms) {
      mentionedTerms = lastMessage.extractedOffer.payment_terms;
    }

    // Extract constraints from conversation state
    if (convoState?.pendingCounter) {
      constraints.push('Pending counter-offer');
    }

    if (refusalCount > 0) {
      constraints.push(`${refusalCount} refusal(s)`);
    }

    return { mentionedPrice, mentionedTerms, constraints };
  }, [messages, convoState, refusalCount]);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = text || inputText;
      if (!messageText.trim() || !canSend) return;

      await sendMessage(messageText);
      setInputText('');
    },
    [inputText, canSend, sendMessage]
  );

  const handleStart = useCallback(async () => {
    await startConversation();
  }, [startConversation]);

  const handleSuggestedResponse = useCallback(
    (response: string) => {
      setInputText(response);
    },
    []
  );

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    // Auto-start conversation if no messages
    if (deal && messages.length === 0 && !loading) {
      handleStart();
    }
  }, [deal, messages.length, loading, handleStart]);

  // ============================================================================
  // Render
  // ============================================================================

  if (loading && !deal) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error</p>
          <p className="mt-2">{error}</p>
          <button
            onClick={reload}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Top Bar: Phase + Refusal + Turn Count */}
      <TopBar
        phase={currentPhase}
        refusalCount={refusalCount}
        turnCount={turnCount}
        warningLevel={warningLevel}
        onRefresh={reload}
        onToggleSidebar={() => setShowStatePanel(!showStatePanel)}
      />

      {/* Main Layout: Transcript + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Message Transcript */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <MessageTranscript messages={messages} loading={loading} />

          {/* Composer */}
          <EnhancedComposer
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
            disabled={!canSend}
            sending={sending}
            showSuggestedResponses={showSuggestedResponses}
            onSelectSuggestion={handleSuggestedResponse}
            phase={currentPhase}
          />
        </div>

        {/* Sidebar: Conversation State */}
        {showStatePanel && (
          <ConversationStatePanel
            convoState={convoState}
            contextData={contextData}
            deal={deal}
            onClose={() => setShowStatePanel(false)}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface TopBarProps {
  phase: ConversationPhase;
  refusalCount: number;
  turnCount: number;
  warningLevel: WarningLevel;
  onRefresh: () => void;
  onToggleSidebar: () => void;
}

function TopBar({
  phase,
  refusalCount,
  turnCount,
  warningLevel,
  onRefresh,
  onToggleSidebar,
}: TopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Phase Badge */}
          <PhaseBadge phase={phase} />

          {/* Refusal Warning */}
          {refusalCount > 0 && (
            <RefusalWarning count={refusalCount} level={warningLevel} />
          )}

          {/* Turn Counter */}
          <TurnCounter count={turnCount} />
        </div>

        <div className="flex items-center space-x-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Refresh"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* Toggle Sidebar */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Toggle Sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface PhaseBadgeProps {
  phase: ConversationPhase;
}

function PhaseBadge({ phase }: PhaseBadgeProps) {
  const phaseConfig = {
    WAITING_FOR_OFFER: {
      label: 'Waiting for Offer',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: '⏳',
    },
    NEGOTIATING: {
      label: 'Negotiating',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: '💬',
    },
    TERMINAL: {
      label: 'Closed',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: '🏁',
    },
  };

  const config = phaseConfig[phase];

  return (
    <div
      className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color} flex items-center space-x-1`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}

interface RefusalWarningProps {
  count: number;
  level: WarningLevel;
}

function RefusalWarning({ count, level }: RefusalWarningProps) {
  const levelConfig = {
    none: { color: 'bg-gray-100 text-gray-700', icon: 'ℹ️' },
    low: { color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' },
    medium: { color: 'bg-orange-100 text-orange-700', icon: '⚠️' },
    high: { color: 'bg-red-100 text-red-700', icon: '🚨' },
  };

  const config = levelConfig[level];

  return (
    <div
      className={`px-3 py-1 rounded-full text-sm font-medium ${config.color} flex items-center space-x-1 animate-pulse`}
    >
      <span>{config.icon}</span>
      <span>
        {count} Refusal{count !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

interface TurnCounterProps {
  count: number;
}

function TurnCounter({ count }: TurnCounterProps) {
  return (
    <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
      Turn {count}
    </div>
  );
}

interface MessageTranscriptProps {
  messages: Message[];
  loading: boolean;
}

function MessageTranscript({ messages, loading }: MessageTranscriptProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-4">
      {messages.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No messages yet</p>
          <p className="text-sm mt-2">Start the conversation</p>
        </div>
      )}

      {messages.map((message) => (
        <MessageBubbleWithIntent
          key={message.id}
          message={message}
        />
      ))}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

interface MessageBubbleWithIntentProps {
  message: Message;
}

function MessageBubbleWithIntent({
  message,
}: MessageBubbleWithIntentProps) {
  const isVendor = message.role === 'VENDOR';
  const isAccordo = message.role === 'ACCORDO';
  const isSystem = message.role === 'SYSTEM';

  // Infer intent from message (simplified)
  const intent = inferIntent(message);

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isAccordo ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md ${isAccordo ? 'text-right' : 'text-left'}`}>
        {/* Intent Badge */}
        {intent && (
          <div className="mb-1">
            <IntentBadge intent={intent} />
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-lg ${
            isVendor
              ? 'bg-white border border-gray-200'
              : 'bg-blue-500 text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Offer Display */}
          {message.extractedOffer && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <OfferDisplay offer={message.extractedOffer} />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500 mt-1">
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

interface IntentBadgeProps {
  intent: ConversationIntent;
}

function IntentBadge({ intent }: IntentBadgeProps) {
  const intentConfig: Record<
    ConversationIntent,
    { label: string; color: string }
  > = {
    GREET: { label: 'Greeting', color: 'bg-green-100 text-green-700' },
    ASK_FOR_OFFER: {
      label: 'Ask Offer',
      color: 'bg-blue-100 text-blue-700',
    },
    SMALL_TALK: { label: 'Small Talk', color: 'bg-gray-100 text-gray-700' },
    ASK_CLARIFY: {
      label: 'Clarify',
      color: 'bg-yellow-100 text-yellow-700',
    },
    PROVIDE_OFFER: { label: 'Offer', color: 'bg-purple-100 text-purple-700' },
    REFUSAL: { label: 'Refusal', color: 'bg-red-100 text-red-700' },
    UNKNOWN: { label: 'Unknown', color: 'bg-gray-100 text-gray-500' },
  };

  const config = intentConfig[intent] || intentConfig.UNKNOWN;

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

interface OfferDisplayProps {
  offer: Offer;
}

function OfferDisplay({ offer }: OfferDisplayProps) {
  return (
    <div className="text-xs space-y-1">
      {offer.unit_price && (
        <div>
          <span className="font-semibold">Price:</span> $
          {offer.unit_price.toFixed(2)}
        </div>
      )}
      {offer.payment_terms && (
        <div>
          <span className="font-semibold">Terms:</span> {offer.payment_terms}
        </div>
      )}
    </div>
  );
}

interface EnhancedComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  sending: boolean;
  showSuggestedResponses: boolean;
  onSelectSuggestion: (suggestion: string) => void;
  phase: ConversationPhase;
}

function EnhancedComposer({
  value,
  onChange,
  onSend,
  disabled,
  sending,
  showSuggestedResponses,
  onSelectSuggestion,
  phase,
}: EnhancedComposerProps) {
  const suggestions = getSuggestedResponses(phase);

  return (
    <div className="bg-white border-t border-gray-200 p-4 space-y-3">
      {/* Suggested Responses */}
      {showSuggestedResponses && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelectSuggestion(suggestion)}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
              disabled={disabled}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-end space-x-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={
            disabled ? 'Conversation closed' : 'Type your message...'
          }
          disabled={disabled || sending}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        <button
          onClick={onSend}
          disabled={disabled || sending || !value.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[76px]"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

interface ConversationStatePanelProps {
  convoState: ConversationState | null;
  contextData: ContextData;
  deal: Deal | null;
  onClose: () => void;
}

function ConversationStatePanel({
  contextData,
  deal,
  onClose,
}: ConversationStatePanelProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Conversation State</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Context Data */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Context Awareness
          </h4>
          <div className="space-y-2 text-sm">
            {contextData.mentionedPrice && (
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">
                  ${contextData.mentionedPrice.toFixed(2)}
                </span>
              </div>
            )}
            {contextData.mentionedTerms && (
              <div className="flex justify-between">
                <span className="text-gray-600">Terms:</span>
                <span className="font-medium">
                  {contextData.mentionedTerms}
                </span>
              </div>
            )}
            {contextData.constraints.length > 0 && (
              <div>
                <span className="text-gray-600">Constraints:</span>
                <ul className="mt-1 space-y-1">
                  {contextData.constraints.map((constraint, index) => (
                    <li key={index} className="text-xs text-gray-500">
                      • {constraint}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Deal Info */}
        {deal && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Deal Info
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{deal.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Round:</span>
                <span className="font-medium">{deal.round}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function inferIntent(message: Message): ConversationIntent {
  const content = message.content.toLowerCase();

  if (content.includes('hello') || content.includes('hi')) return 'GREET';
  if (content.includes('offer') || content.includes('price')) {
    return message.role === 'VENDOR' ? 'PROVIDE_OFFER' : 'ASK_FOR_OFFER';
  }
  if (content.includes('no') || content.includes('later')) return 'REFUSAL';
  if (content.includes('?')) return 'ASK_CLARIFY';

  return 'UNKNOWN';
}

function getSuggestedResponses(phase: ConversationPhase): string[] {
  switch (phase) {
    case 'WAITING_FOR_OFFER':
      return [
        "I'd like to discuss pricing",
        'Can you provide an offer?',
        'What are your terms?',
      ];
    case 'NEGOTIATING':
      return [
        'Can we negotiate the price?',
        'What about better terms?',
        'That sounds reasonable',
      ];
    case 'TERMINAL':
      return [];
    default:
      return [];
  }
}

export default ConversationEnhanced;
