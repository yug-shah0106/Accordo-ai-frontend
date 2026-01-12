/**
 * useDealActions Hook
 *
 * Advanced deal management hook with permissions and configuration.
 * Used for INSIGHTS mode negotiations.
 */

import { useState, useEffect, useCallback } from 'react';
import { chatbotService } from '../../services/chatbot.service';
import type { Deal, Message, NegotiationConfig } from '../../types';

interface UseDealActionsReturn {
  // State
  deal: Deal | null;
  messages: Message[];
  config: NegotiationConfig | null;
  loading: boolean;
  error: Error | null;
  sending: boolean;
  resetLoading: boolean;

  // Permissions
  canNegotiate: boolean;
  canSend: boolean;
  canReset: boolean;

  // Computed values
  maxRounds: number;

  // Actions
  sendVendorMessage: (content: string) => Promise<void>;
  reset: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useDealActions(dealId: string | undefined): UseDealActionsReturn {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [config, setConfig] = useState<NegotiationConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [sending, setSending] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  // Computed permissions
  const canNegotiate = deal?.status === 'NEGOTIATING';
  const canSend = canNegotiate && !sending;
  const canReset = deal !== null && !resetLoading;
  const maxRounds = config?.max_rounds ?? 10;

  // Load deal data
  const loadDeal = useCallback(async () => {
    if (!dealId) {
      setError(new Error('No deal ID provided'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await chatbotService.getDeal(dealId);
      setDeal(response.data.deal);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Failed to load deal:', err);
      setError(err instanceof Error ? err : new Error('Failed to load deal'));
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  // Load config
  const loadConfig = useCallback(async () => {
    if (!dealId) return;

    try {
      const response = await chatbotService.getDealConfig(dealId);
      setConfig(response.data.config);
    } catch (err) {
      console.error('Failed to load config:', err);
      // Config is optional, don't set error
    }
  }, [dealId]);

  // Initial load
  useEffect(() => {
    loadDeal();
    loadConfig();
  }, [loadDeal, loadConfig]);

  // Send vendor message
  const sendVendorMessage = useCallback(async (content: string): Promise<void> => {
    if (!dealId || !canSend) {
      throw new Error('Cannot send message');
    }

    try {
      setSending(true);
      const response = await chatbotService.sendMessage(dealId, content, 'VENDOR');

      // Update deal and messages from response
      if (response.data.deal) {
        setDeal(response.data.deal);
      }
      if (response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [dealId, canSend]);

  // Reset deal
  const reset = useCallback(async (): Promise<void> => {
    if (!dealId) {
      throw new Error('No deal ID');
    }

    try {
      setResetLoading(true);
      const response = await chatbotService.resetDeal(dealId);

      setDeal(response.data.deal);
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error('Failed to reset deal:', err);
      throw err;
    } finally {
      setResetLoading(false);
    }
  }, [dealId]);

  // Reload deal data
  const reload = useCallback(async (): Promise<void> => {
    await Promise.all([loadDeal(), loadConfig()]);
  }, [loadDeal, loadConfig]);

  return {
    deal,
    messages,
    config,
    loading,
    error,
    sending,
    resetLoading,
    canNegotiate,
    canSend,
    canReset,
    maxRounds,
    sendVendorMessage,
    reset,
    reload,
  };
}

export default useDealActions;
