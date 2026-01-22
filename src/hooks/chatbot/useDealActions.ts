/**
 * useDealActions Hook
 *
 * Advanced deal management hook with permissions and configuration.
 * Used for INSIGHTS mode negotiations.
 *
 * Updated January 2026: Uses lookupDeal to get DealContext for nested API calls.
 * Updated January 2026: Fixed blank screen issue with proper error handling and toast notifications.
 * Updated January 2026: Added vendor mode support with AI-PM auto-response.
 * Updated January 2026: Fixed real-time message updates - service now returns SendMessageResponse directly.
 * Updated January 2026: Two-phase messaging - instant vendor message display with async PM response.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { chatbotService } from '../../services/chatbot.service';
import type { Deal, Message, ExtendedNegotiationConfig, DealContext, DealMode } from '../../types';

// Timeout for PM response before falling back to deterministic response
const PM_RESPONSE_TIMEOUT_MS = 5000;

// AI-PM decision response from vendor message
export interface PmDecision {
  action: 'ACCEPT' | 'COUNTER' | 'ESCALATE' | 'WALK_AWAY';
  utilityScore: number;
  counterOffer?: {
    price: number;
    paymentTerms: string;
    deliveryDate: string;
  };
  reasoning: string;
}

interface UseDealActionsReturn {
  // State
  deal: Deal | null;
  messages: Message[];
  config: ExtendedNegotiationConfig | null;
  context: DealContext | null;
  loading: boolean;
  error: Error | null;
  sending: boolean;
  resetLoading: boolean;
  vendorMode: boolean;
  lastPmDecision: PmDecision | null;
  pmTyping: boolean;  // True when PM response is being generated (shows typing indicator)

  // Permissions
  canNegotiate: boolean;
  canSend: boolean;
  canReset: boolean;

  // Computed values
  maxRounds: number;
  mode: DealMode;

  // Actions
  sendVendorMessage: (content: string) => Promise<void>;  // Legacy: waits for full response
  sendVendorMessageTwoPhase: (content: string) => Promise<void>;  // Two-phase: instant vendor + async PM
  sendVendorOffer: (content: string) => Promise<void>;  // Vendor mode: sends offer and gets AI-PM response
  initializeNegotiation: () => Promise<void>;  // Start negotiation with PM's opening offer
  reset: () => Promise<void>;
  reload: () => Promise<void>;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that a DealContext has all required values for hierarchical API calls
 * @param context - The deal context to validate
 * @returns true if context is valid, false otherwise
 */
const isValidContext = (context: DealContext | null): context is DealContext => {
  if (!context) return false;
  if (!context.dealId || typeof context.dealId !== 'string') return false;
  if (context.rfqId == null || typeof context.rfqId !== 'number' || context.rfqId <= 0) return false;
  if (context.vendorId == null || typeof context.vendorId !== 'number' || context.vendorId <= 0) return false;
  return true;
};

export function useDealActions(dealId: string | undefined): UseDealActionsReturn {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<ExtendedNegotiationConfig | null>(null);
  const [context, setContext] = useState<DealContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [lastPmDecision, setLastPmDecision] = useState<PmDecision | null>(null);
  const [pmTyping, setPmTyping] = useState<boolean>(false);  // PM is "typing" (generating response)

  // Ref to track if component is still mounted (for async operations)
  const isMountedRef = useRef<boolean>(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Computed permissions
  const canNegotiate = deal?.status === 'NEGOTIATING';
  const canSend = canNegotiate && !sending;
  const canReset = deal !== null && !resetLoading;
  const maxRounds = config?.max_rounds ?? 10;
  const mode: DealMode = (deal?.mode as DealMode) ?? 'INSIGHTS';

  // Vendor mode is enabled when deal mode is 'VENDOR' (AI-PM simulates buyer)
  // This could be expanded to check deal.vendorMode or config.vendorMode
  const vendorMode = mode === 'VENDOR' || (deal as unknown as { vendorMode?: boolean })?.vendorMode === true;

  // Load deal data using lookupDeal (gets both deal and context)
  const loadDeal = useCallback(async () => {
    // Validate dealId - check for undefined, 'undefined' string, or invalid UUID format
    if (!dealId || dealId === 'undefined' || !UUID_REGEX.test(dealId)) {
      setError(new Error('Invalid deal ID'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use lookupDeal to get deal + context in one call
      const response = await chatbotService.lookupDeal(dealId);
      const { deal: fetchedDeal, messages: fetchedMessages, context: fetchedContext } = response.data;

      setDeal(fetchedDeal);
      setMessages(fetchedMessages || []);
      setContext(fetchedContext);
    } catch (err) {
      console.error('Failed to load deal:', err);
      setError(err instanceof Error ? err : new Error('Failed to load deal'));
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  // Load config (requires context)
  const loadConfig = useCallback(async () => {
    if (!context) return;

    try {
      const response = await chatbotService.getDealConfig(context);
      setConfig(response.data.config);
    } catch (err) {
      console.error('Failed to load config:', err);
      // Config is optional, don't set error
    }
  }, [context]);

  // Initial load of deal
  useEffect(() => {
    loadDeal();
  }, [loadDeal]);

  // Load config after context is available
  useEffect(() => {
    if (context) {
      loadConfig();
    }
  }, [context, loadConfig]);

  // Send vendor message with proper error handling to prevent blank screen
  const sendVendorMessage = useCallback(async (content: string): Promise<void> => {
    if (!isValidContext(context)) {
      toast.error('Unable to send message: deal context is incomplete');
      console.error('sendVendorMessage: Invalid context - missing or invalid rfqId/vendorId/dealId', context);
      return;
    }

    if (!canSend) {
      toast.error('Cannot send message while previous is processing');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Service now returns SendMessageResponse directly (not wrapped in { data: ... })
      const response = await chatbotService.sendMessage(context, content, 'VENDOR', mode);

      // DEBUG: Log the response received from service
      console.log('[DEBUG useDealActions] Response from sendMessage:', response);
      console.log('[DEBUG useDealActions] response.deal:', response?.deal);
      console.log('[DEBUG useDealActions] response.messages:', response?.messages);
      console.log('[DEBUG useDealActions] messages count:', response?.messages?.length);

      // Validate response structure to prevent blank screen
      if (!response) {
        throw new Error('Invalid response from server - no data received');
      }

      // Only update state if we have valid data (preserves existing state otherwise)
      if (response.deal) {
        console.log('[DEBUG useDealActions] Setting deal state:', response.deal);
        setDeal(response.deal);

        // Handle terminal states with success notification
        const newStatus = response.deal.status;
        if (newStatus && newStatus !== 'NEGOTIATING') {
          const statusMessage = newStatus.toLowerCase().replace('_', ' ');
          toast.success(`Deal ${statusMessage}`);
        }
      }

      if (response.messages && Array.isArray(response.messages)) {
        console.log('[DEBUG useDealActions] Setting messages state with', response.messages.length, 'messages');
        // Create new array reference to ensure React re-render
        setMessages([...response.messages]);
      } else {
        console.log('[DEBUG useDealActions] No valid messages in response, messages:', response.messages);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
      console.error('Failed to send message:', err);
      // Don't re-throw - preserve existing UI state instead of causing blank screen
    } finally {
      setSending(false);
    }
  }, [context, canSend, mode]);

  /**
   * Two-Phase Messaging Flow:
   * 1. Save vendor message INSTANTLY (appears in UI immediately)
   * 2. Show typing indicator while PM response generates
   * 3. Use 5 second timeout - fall back to deterministic response if LLM is slow
   * 4. Update UI with PM response when ready
   *
   * This provides instant feedback to the user while generating human-like responses.
   *
   * FIXED (Jan 2026): Added proper state management to ensure PM message always appears
   * without requiring page reload. Key fixes:
   * - Use functional state updates to ensure latest state
   * - Clear pmTyping AFTER state updates complete
   * - Add explicit state flush with setTimeout
   */
  const sendVendorMessageTwoPhase = useCallback(async (content: string): Promise<void> => {
    if (!isValidContext(context)) {
      toast.error('Unable to send message: deal context is incomplete');
      console.error('sendVendorMessageTwoPhase: Invalid context', context);
      return;
    }

    if (!canSend) {
      toast.error('Cannot send message while previous is processing');
      return;
    }

    setSending(true);
    setError(null);

    let phase2Completed = false;

    try {
      // ========== PHASE 1: Save vendor message instantly ==========
      console.log('[TwoPhase] Phase 1: Saving vendor message instantly');
      const phase1Response = await chatbotService.saveVendorMessageInstant(context, content);

      if (!isMountedRef.current) return;

      // Immediately update UI with vendor message
      if (phase1Response.data.vendorMessage) {
        setMessages(prev => [...prev, phase1Response.data.vendorMessage]);
        console.log('[TwoPhase] Vendor message added to UI');
      }

      if (phase1Response.data.deal) {
        setDeal(phase1Response.data.deal);
      }

      // ========== PHASE 2: Generate PM response with timeout ==========
      // Get the vendorMessageId from Phase 1 response to pass to Phase 2
      const vendorMessageId = phase1Response.data.vendorMessage?.id;
      if (!vendorMessageId) {
        throw new Error('No vendorMessageId returned from Phase 1');
      }

      console.log('[TwoPhase] Phase 2: Generating PM response (5s timeout), vendorMessageId:', vendorMessageId);
      setPmTyping(true);  // Show typing indicator

      // Create a promise that races between async response and timeout
      const pmResponsePromise = chatbotService.generatePMResponseAsync(context, vendorMessageId);
      const timeoutPromise = new Promise<'timeout'>((resolve) =>
        setTimeout(() => resolve('timeout'), PM_RESPONSE_TIMEOUT_MS)
      );

      const result = await Promise.race([pmResponsePromise, timeoutPromise]);

      if (!isMountedRef.current) return;

      let pmResponse;
      let usedFallback = false;

      if (result === 'timeout') {
        // LLM was too slow, use fallback
        console.log('[TwoPhase] LLM timeout after 5s, using fallback response');
        pmResponse = await chatbotService.generatePMResponseFallback(context, vendorMessageId);
        usedFallback = true;
      } else {
        // Got LLM response in time
        console.log('[TwoPhase] Got LLM response in time');
        pmResponse = result;
      }

      if (!isMountedRef.current) return;

      phase2Completed = true;

      // ========== CRITICAL: Update UI with PM response ==========
      // Use functional updates and batch them properly
      const pmMessage = pmResponse.data?.pmMessage;
      const updatedDeal = pmResponse.data?.deal;
      const decision = pmResponse.data?.decision;

      console.log('[TwoPhase] Processing PM response:', {
        hasPmMessage: !!pmMessage,
        hasDeal: !!updatedDeal,
        hasDecision: !!decision,
        usedFallback
      });

      // Update messages with PM response - use functional update to ensure we have latest state
      if (pmMessage) {
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const exists = prevMessages.some(m => m.id === pmMessage.id);
          if (exists) {
            console.log('[TwoPhase] PM message already exists, skipping duplicate');
            return prevMessages;
          }
          console.log('[TwoPhase] Adding PM message to UI', usedFallback ? '(fallback)' : '(LLM)');
          return [...prevMessages, pmMessage];
        });
      } else {
        console.warn('[TwoPhase] No pmMessage in response!');
      }

      // Update deal state
      if (updatedDeal) {
        setDeal(updatedDeal);

        // Handle terminal states with success notification
        const newStatus = updatedDeal.status;
        if (newStatus && newStatus !== 'NEGOTIATING') {
          const statusMessage = newStatus.toLowerCase().replace('_', ' ');
          toast.success(`Deal ${statusMessage}`);
        }
      }

      // Store decision for display
      if (decision) {
        setLastPmDecision({
          action: decision.action,
          utilityScore: decision.utilityScore,
          counterOffer: decision.counterOffer ? {
            price: decision.counterOffer.unit_price || 0,
            paymentTerms: decision.counterOffer.payment_terms || 'Net 30',
            deliveryDate: decision.counterOffer.delivery_date || '',
          } : undefined,
          reasoning: decision.reasons?.join(', ') || '',
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
      console.error('[TwoPhase] Error:', err);
    } finally {
      // CRITICAL: Ensure states are cleared AFTER all updates
      // Use setTimeout to let React batch the state updates first
      if (isMountedRef.current) {
        // Small delay to ensure state updates have been processed
        setTimeout(() => {
          if (isMountedRef.current) {
            setSending(false);
            setPmTyping(false);
            console.log('[TwoPhase] Cleared sending and pmTyping states, phase2Completed:', phase2Completed);
          }
        }, 50);
      }
    }
  }, [context, canSend]);

  // Send vendor offer in vendor mode - gets AI-PM auto-response
  const sendVendorOffer = useCallback(async (content: string): Promise<void> => {
    if (!isValidContext(context)) {
      toast.error('Unable to send offer: deal context is incomplete');
      console.error('sendVendorOffer: Invalid context - missing or invalid rfqId/vendorId/dealId', context);
      return;
    }

    if (!canSend) {
      toast.error('Cannot send offer while previous is processing');
      return;
    }

    setSending(true);
    setError(null);
    setLastPmDecision(null);

    try {
      // Use vendor message endpoint which returns both vendor message and AI-PM response
      const response = await chatbotService.sendVendorMessage(context, content);

      // Validate response structure
      if (!response?.data) {
        throw new Error('Invalid response from server - no data received');
      }

      // Update deal state
      if (response.data.deal) {
        setDeal(response.data.deal);

        // Handle terminal states
        const newStatus = response.data.deal.status;
        if (newStatus && newStatus !== 'NEGOTIATING') {
          const statusMessage = newStatus.toLowerCase().replace('_', ' ');
          if (newStatus === 'ACCEPTED') {
            toast.success(`Deal accepted! Congratulations!`);
          } else if (newStatus === 'WALKED_AWAY') {
            toast.error('The buyer has walked away from negotiations');
          } else if (newStatus === 'ESCALATED') {
            toast('Deal has been escalated to management', { icon: '⚠️' });
          } else {
            toast.success(`Deal ${statusMessage}`);
          }
        }
      }

      // Update messages (includes both vendor message and PM response)
      if (response.data.messages && Array.isArray(response.data.messages)) {
        // Create new array reference to ensure React re-render
        setMessages([...response.data.messages]);
      }

      // Store the PM's decision for display
      if (response.data.pmDecision) {
        setLastPmDecision(response.data.pmDecision);

        // Show AI-PM action feedback
        const { action, utilityScore } = response.data.pmDecision;
        const utilityPercent = Math.round(utilityScore * 100);
        if (action === 'COUNTER') {
          toast(`Buyer countered (${utilityPercent}% utility)`, { icon: '💬' });
        } else if (action === 'ACCEPT') {
          toast.success(`Buyer accepted your offer! (${utilityPercent}% utility)`);
        } else if (action === 'ESCALATE') {
          toast('Buyer escalated to management', { icon: '⚠️' });
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send offer';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
      console.error('Failed to send vendor offer:', err);
    } finally {
      setSending(false);
    }
  }, [context, canSend]);

  // Initialize negotiation - gets PM's opening offer
  const initializeNegotiation = useCallback(async (): Promise<void> => {
    if (!isValidContext(context)) {
      toast.error('Unable to start negotiation: deal context is incomplete');
      console.error('initializeNegotiation: Invalid context - missing or invalid rfqId/vendorId/dealId', context);
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await chatbotService.startNegotiation(context);

      // Validate response structure
      if (!response?.data) {
        throw new Error('Invalid response from server - no data received');
      }

      // Update deal state
      if (response.data.deal) {
        setDeal(response.data.deal);
      }

      // Update messages (includes PM's opening offer)
      if (response.data.messages && Array.isArray(response.data.messages)) {
        // Create new array reference to ensure React re-render
        setMessages([...response.data.messages]);
      }

      // Notify user
      toast.success('Negotiation started! The buyer has made their opening offer.');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start negotiation';
      setError(new Error(errorMessage));
      toast.error(errorMessage);
      console.error('Failed to initialize negotiation:', err);
    } finally {
      setSending(false);
    }
  }, [context]);

  // Reset deal with proper error handling
  const reset = useCallback(async (): Promise<void> => {
    if (!isValidContext(context)) {
      toast.error('Unable to reset deal: deal context is incomplete');
      console.error('reset: Invalid context - missing or invalid rfqId/vendorId/dealId', context);
      return;
    }

    setResetLoading(true);

    try {
      const response = await chatbotService.resetDeal(context);

      if (response.data.deal) {
        setDeal(response.data.deal);
      }
      setMessages(response.data.messages || []);
      toast.success('Deal reset successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset deal';
      toast.error(errorMessage);
      console.error('Failed to reset deal:', err);
      // Don't re-throw to prevent UI crash
    } finally {
      setResetLoading(false);
    }
  }, [context]);

  // Reload deal data
  const reload = useCallback(async (): Promise<void> => {
    await loadDeal();
    // loadConfig will be triggered by useEffect when context updates
  }, [loadDeal]);

  return {
    deal,
    messages,
    config,
    context,
    loading,
    error,
    sending,
    resetLoading,
    vendorMode,
    lastPmDecision,
    pmTyping,
    canNegotiate,
    canSend,
    canReset,
    maxRounds,
    mode,
    sendVendorMessage,
    sendVendorMessageTwoPhase,
    sendVendorOffer,
    initializeNegotiation,
    reset,
    reload,
  };
}

export default useDealActions;
