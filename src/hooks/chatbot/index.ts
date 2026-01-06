/**
 * Chatbot Hooks Barrel Export
 *
 * Centralized exports for all chatbot-related hooks.
 */

export { useConversation } from './useConversation';
export type { UseConversationReturn, WarningLevel } from './useConversation';

export { useHistoryTracking, getRelativeTime, clearAllHistory, mergeHistories } from './useHistoryTracking';
export type { UseHistoryTrackingReturn, HistoryEntry } from './useHistoryTracking';

export { useDealActions } from './useDealActions';
