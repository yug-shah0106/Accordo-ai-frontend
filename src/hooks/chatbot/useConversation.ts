/**
 * useConversation Hook
 *
 * Comprehensive conversation mode hook for chatbot negotiations.
 * Manages conversation state, phase tracking, refusal counting, and real-time updates.
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
    deal.status === 'NEGOTIATING' &&
    !sending &&
    currentPhase !== 'TERMINAL';

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Load deal and messages from API
   */
  const reload = useCallback(async () => {
    if (!dealId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chatbotService.getDeal(dealId);
      const { deal: fetchedDeal, messages: fetchedMessages } = response.data;

      setDeal(fetchedDeal);
      setMessages(fetchedMessages || []);

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
    if (!dealId) return;

    setSending(true);
    setError(null);

    try {
      const response = await chatbotService.startConversation(dealId);
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
  }, [dealId, reload]);

  /**
   * Send a message in conversation mode
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!dealId || !canSend || !content.trim()) return;

      setSending(true);
      setError(null);

      try {
        const response = await chatbotService.sendConversationMessage(
          dealId,
          content.trim()
        );

        const {
          vendorMessage,
          accordoMessage,
          conversationState,
        } = response.data;

        // Update messages optimistically
        const newMessages: Message[] = [];
        if (vendorMessage) newMessages.push(vendorMessage);
        if (accordoMessage) newMessages.push(accordoMessage);

        setMessages((prev) => [...prev, ...newMessages]);

        // Update deal state with new conversation state
        if (conversationState) {
          setDeal((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              convoStateJson: conversationState,
              round: prev.round + 1,
            };
          });
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

        // Remove optimistic update on error
        await reload();
      } finally {
        setSending(false);
      }
    },
    [dealId, canSend, reload]
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

// ============================================================================
// Example Test Cases
// ============================================================================

/**
 * Test 1: Initial Load
 * - Should load deal and messages on mount
 * - Should set loading to true, then false
 * - Should populate deal, messages, and convoState
 *
 * Test 2: Start Conversation
 * - Should send greeting message
 * - Should update messages with vendor + accordo messages
 * - Should set sending to true, then false
 *
 * Test 3: Send Message
 * - Should send vendor message
 * - Should update messages optimistically
 * - Should increment turn count
 * - Should auto-scroll to bottom
 *
 * Test 4: Refusal Warning
 * - warningLevel should be 'none' when refusalCount = 0
 * - warningLevel should be 'low' when refusalCount = 1
 * - warningLevel should be 'medium' when refusalCount = 2
 * - warningLevel should be 'high' when refusalCount >= 3
 *
 * Test 5: Phase Tracking
 * - currentPhase should be 'WAITING_FOR_OFFER' initially
 * - currentPhase should transition to 'NEGOTIATING' after offer
 * - currentPhase should be 'TERMINAL' when status is ESCALATED/CLOSED
 *
 * Test 6: Can Send
 * - canSend should be true when status is NEGOTIATING
 * - canSend should be false when status is ESCALATED
 * - canSend should be false when sending is true
 * - canSend should be false when deal is null
 *
 * Test 7: Error Handling
 * - Should set error message on API failure
 * - Should revert optimistic updates on send failure
 * - Should not crash on invalid convoStateJson
 *
 * Test 8: Auto-scroll
 * - Should scroll to bottom on new messages
 * - Should scroll to bottom after reload
 * - Should respect autoScroll option
 */
