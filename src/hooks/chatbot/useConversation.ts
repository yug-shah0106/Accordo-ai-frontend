/**
 * useConversation Hook
 *
 * Comprehensive conversation mode hook for chatbot negotiations.
 * Manages conversation state, phase tracking, refusal counting, and real-time updates.
 *
 * Updated January 2026: Uses lookupDeal to get DealContext for nested API calls.
 *
 * Features:
 * - Conversation state management (phase, refusal count, turn count)
 * - Message sending with conversation API
 * - Real-time state updates
 * - Intent tracking
 * - Phase indicator display
 * - Refusal counter with visual warnings
 * - Auto-scroll to latest message
 *
 * @example
 * ```tsx
 * const {
 *   deal,
 *   messages,
 *   convoState,
 *   sendMessage,
 *   startConversation,
 *   currentPhase,
 *   refusalCount,
 *   warningLevel
 * } = useConversation('deal-123');
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatbotService } from '../../services/chatbot.service';
import type {
  Deal,
  Message,
  ConversationState,
  ConversationPhase,
  DealContext,
} from '../../types/chatbot';

// ============================================================================
// Types
// ============================================================================

export type WarningLevel = 'none' | 'low' | 'medium' | 'high';

export interface UseConversationReturn {
  // Data
  deal: Deal | null;
  messages: Message[];
  convoState: ConversationState | null;
  context: DealContext | null;

  // Loading states
  loading: boolean;
  sending: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  startConversation: () => Promise<void>;
  reload: () => Promise<void>;

  // Computed
  currentPhase: ConversationPhase;
  refusalCount: number;
  turnCount: number;
  canSend: boolean;
  warningLevel: WarningLevel;
}

// ============================================================================
// Constants
// ============================================================================

const REFUSAL_THRESHOLDS = {
  LOW: 1,      // 1 refusal: yellow warning
  MEDIUM: 2,   // 2 refusals: orange warning
  HIGH: 3,     // 3+ refusals: red warning (escalation imminent)
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse conversation state from deal's convoStateJson
 */
function parseConvoState(deal: Deal | null): ConversationState | null {
  if (!deal || !deal.convoStateJson) return null;

  try {
    // convoStateJson is already parsed by the API
    return deal.convoStateJson;
  } catch {
    // Failed to parse conversation state - return null
    return null;
  }
}

/**
 * Determine warning level based on refusal count
 */
function getWarningLevel(refusalCount: number): WarningLevel {
  if (refusalCount === 0) return 'none';
  if (refusalCount === REFUSAL_THRESHOLDS.LOW) return 'low';
  if (refusalCount === REFUSAL_THRESHOLDS.MEDIUM) return 'medium';
  return 'high'; // 3 or more refusals
}

/**
 * Map conversation phase to display phase
 * Backend uses different phase names than frontend
 */
function mapPhase(phase: string | undefined): ConversationPhase {
  if (!phase) return 'WAITING_FOR_OFFER';

  switch (phase) {
    case 'GREET':
    case 'ASK_OFFER':
      return 'WAITING_FOR_OFFER';
    case 'NEGOTIATING':
      return 'NEGOTIATING';
    case 'CLOSED':
    case 'ESCALATED':
      return 'TERMINAL';
    default:
      return 'WAITING_FOR_OFFER';
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useConversation Hook
 *
 * @param dealId - The deal ID to manage
 * @param options - Configuration options
 * @returns Conversation state and actions
 */
export function useConversation(
  dealId: string,
  options: {
    autoLoad?: boolean;
    autoScroll?: boolean;
  } = {}
): UseConversationReturn {
  const { autoLoad = true, autoScroll = true } = options;

  // ============================================================================
  // State
  // ============================================================================

  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [context, setContext] = useState<DealContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for scroll management
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollRef = useRef(autoScroll);

  // ============================================================================
  // Computed State
  // ============================================================================

  const convoState = parseConvoState(deal);

  const currentPhase = mapPhase(
    convoState?.phase || deal?.status
  );

  const refusalCount = convoState?.refusalCount || 0;
  const turnCount = convoState?.turnCount || 0;

  const warningLevel = getWarningLevel(refusalCount);

  const canSend =
    deal !== null &&
    context !== null &&
    deal.status === 'NEGOTIATING' &&
    !sending &&
    currentPhase !== 'TERMINAL';

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Load deal and messages from API using lookupDeal
   */
  const reload = useCallback(async () => {
    if (!dealId) return;

    setLoading(true);
    setError(null);

    try {
      // Use lookupDeal to get deal + context in one call
      const response = await chatbotService.lookupDeal(dealId);
      const { deal: fetchedDeal, messages: fetchedMessages, context: fetchedContext } = response.data;

      setDeal(fetchedDeal);
      setMessages(fetchedMessages || []);
      setContext(fetchedContext);

      // Auto-scroll to bottom on reload
      if (shouldScrollRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load conversation';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  /**
   * Start a new conversation (sends greeting automatically)
   */
  const startConversation = useCallback(async () => {
    if (!context) return;

    setSending(true);
    setError(null);

    try {
      const response = await chatbotService.startConversation(context);
      const {
        vendorMessage,
        accordoMessage,
      } = response.data;

      // Update local state
      if (vendorMessage && accordoMessage) {
        setMessages((prev) => [...prev, vendorMessage, accordoMessage]);
      }

      // Reload to get updated deal state
      await reload();

      // Auto-scroll to bottom
      if (shouldScrollRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to start conversation';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  }, [context, reload]);

  /**
   * Send a message in conversation mode
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!context || !canSend || !content.trim()) return;

      setSending(true);
      setError(null);

      try {
        // Use CONVERSATION mode
        const response = await chatbotService.sendMessage(
          context,
          content.trim(),
          'VENDOR',
          'CONVERSATION'
        );

        const {
          deal: updatedDeal,
          messages: updatedMessages,
        } = response.data;

        // Update state from response
        if (updatedDeal) {
          setDeal(updatedDeal);
        }
        if (updatedMessages) {
          setMessages(updatedMessages);
        }

        // Auto-scroll to bottom
        if (shouldScrollRef.current) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }

        // Reload to sync with server (in background)
        setTimeout(() => reload(), 500);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to send message';
        setError(errorMessage);

        // Reload on error to sync state
        await reload();
      } finally {
        setSending(false);
      }
    },
    [context, canSend, reload]
  );

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Auto-load deal on mount
   */
  useEffect(() => {
    if (autoLoad && dealId) {
      reload();
    }
  }, [autoLoad, dealId, reload]);

  /**
   * Auto-scroll when messages change
   */
  useEffect(() => {
    if (autoScroll && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoScroll, messages]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Data
    deal,
    messages,
    convoState,
    context,

    // Loading states
    loading,
    sending,
    error,

    // Actions
    sendMessage,
    startConversation,
    reload,

    // Computed
    currentPhase,
    refusalCount,
    turnCount,
    canSend,
    warningLevel,
  };
}

export default useConversation;
