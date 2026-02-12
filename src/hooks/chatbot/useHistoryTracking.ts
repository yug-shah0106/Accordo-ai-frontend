/**
 * useHistoryTracking Hook
 *
 * Browser history tracking for deals with session and local storage integration.
 * Tracks recently viewed deals for quick access and navigation state persistence.
 *
 * Features:
 * - Recently viewed deals (last 10)
 * - Navigation state persistence
 * - Quick access to recent conversations
 * - Session storage integration
 * - Local storage for persistent history
 *
 * Storage Strategy:
 * - sessionStorage: Current session only (cleared on tab close)
 * - localStorage: Persistent across sessions (limit to last 10)
 *
 * @example
 * ```tsx
 * const {
 *   recentDeals,
 *   addToHistory,
 *   clearHistory,
 *   getLastViewed
 * } = useHistoryTracking();
 *
 * // Track deal view
 * addToHistory(deal);
 *
 * // Get recent deals
 * console.log(recentDeals);
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import type { Deal } from '../../types/chatbot';

// ============================================================================
// Types
// ============================================================================

export interface HistoryEntry {
  dealId: string;
  title: string;
  counterparty: string | null;
  status: Deal['status'];
  timestamp: Date;
}

export interface UseHistoryTrackingReturn {
  recentDeals: HistoryEntry[];
  addToHistory: (deal: Deal) => void;
  removeFromHistory: (dealId: string) => void;
  clearHistory: () => void;
  getLastViewed: () => HistoryEntry | null;
  isInHistory: (dealId: string) => boolean;
}

// ============================================================================
// Constants
// ============================================================================

const SESSION_STORAGE_KEY = 'accordo_deal_history_session';
const LOCAL_STORAGE_KEY = 'accordo_deal_history';
const MAX_HISTORY_SIZE = 10;

// ============================================================================
// Storage Helpers
// ============================================================================

/**
 * Load history from storage
 */
function loadHistory(storageKey: string): HistoryEntry[] {
  try {
    const storage =
      storageKey === SESSION_STORAGE_KEY ? sessionStorage : localStorage;
    const data = storage.getItem(storageKey);

    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Convert timestamp strings back to Date objects
    return parsed.map((entry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load history from storage:', error);
    return [];
  }
}

/**
 * Save history to storage
 */
function saveHistory(storageKey: string, history: HistoryEntry[]): void {
  try {
    const storage =
      storageKey === SESSION_STORAGE_KEY ? sessionStorage : localStorage;

    // Limit to MAX_HISTORY_SIZE
    const limited = history.slice(0, MAX_HISTORY_SIZE);

    storage.setItem(storageKey, JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to save history to storage:', error);
  }
}

/**
 * Clear history from storage
 */
function clearHistoryStorage(storageKey: string): void {
  try {
    const storage =
      storageKey === SESSION_STORAGE_KEY ? sessionStorage : localStorage;
    storage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear history from storage:', error);
  }
}

/**
 * Convert Deal to HistoryEntry
 */
function dealToHistoryEntry(deal: Deal): HistoryEntry {
  return {
    dealId: deal.id,
    title: deal.title,
    counterparty: deal.counterparty,
    status: deal.status,
    timestamp: new Date(),
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useHistoryTracking Hook
 *
 * @param useSessionStorage - Use session storage only (default: false, uses localStorage)
 * @returns History tracking state and actions
 */
export function useHistoryTracking(
  useSessionStorage: boolean = false
): UseHistoryTrackingReturn {
  const storageKey = useSessionStorage
    ? SESSION_STORAGE_KEY
    : LOCAL_STORAGE_KEY;

  // ============================================================================
  // State
  // ============================================================================

  const [recentDeals, setRecentDeals] = useState<HistoryEntry[]>(() =>
    loadHistory(storageKey)
  );

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Sync history to storage whenever it changes
   */
  useEffect(() => {
    saveHistory(storageKey, recentDeals);
  }, [recentDeals, storageKey]);

  /**
   * Listen for storage changes from other tabs
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          const entries = parsed.map((entry: any) => ({
            ...entry,
            timestamp: new Date(entry.timestamp),
          }));
          setRecentDeals(entries);
        } catch (error) {
          console.error('Failed to parse storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Add a deal to history
   * If deal already exists, update its timestamp and move to top
   */
  const addToHistory = useCallback(
    (deal: Deal) => {
      const entry = dealToHistoryEntry(deal);

      setRecentDeals((prev) => {
        // Remove existing entry for this deal
        const filtered = prev.filter((e) => e.dealId !== entry.dealId);

        // Add new entry at the beginning
        const updated = [entry, ...filtered];

        // Limit to MAX_HISTORY_SIZE
        return updated.slice(0, MAX_HISTORY_SIZE);
      });
    },
    []
  );

  /**
   * Remove a deal from history
   */
  const removeFromHistory = useCallback((dealId: string) => {
    setRecentDeals((prev) => prev.filter((e) => e.dealId !== dealId));
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setRecentDeals([]);
    clearHistoryStorage(storageKey);
  }, [storageKey]);

  /**
   * Get the last viewed deal
   */
  const getLastViewed = useCallback((): HistoryEntry | null => {
    return recentDeals.length > 0 ? recentDeals[0] : null;
  }, [recentDeals]);

  /**
   * Check if a deal is in history
   */
  const isInHistory = useCallback(
    (dealId: string): boolean => {
      return recentDeals.some((e) => e.dealId === dealId);
    },
    [recentDeals]
  );

  // ============================================================================
  // Return
  // ============================================================================

  return {
    recentDeals,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getLastViewed,
    isInHistory,
  };
}

export default useHistoryTracking;

// ============================================================================
// Utility Functions (for use outside the hook)
// ============================================================================

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Clear both session and local storage histories
 */
export function clearAllHistory(): void {
  clearHistoryStorage(SESSION_STORAGE_KEY);
  clearHistoryStorage(LOCAL_STORAGE_KEY);
}

/**
 * Merge session and local storage histories
 */
export function mergeHistories(): HistoryEntry[] {
  const sessionHistory = loadHistory(SESSION_STORAGE_KEY);
  const localHistory = loadHistory(LOCAL_STORAGE_KEY);

  // Combine and deduplicate by dealId, keeping most recent timestamp
  const merged = new Map<string, HistoryEntry>();

  [...localHistory, ...sessionHistory].forEach((entry) => {
    const existing = merged.get(entry.dealId);
    if (!existing || entry.timestamp > existing.timestamp) {
      merged.set(entry.dealId, entry);
    }
  });

  // Convert back to array and sort by timestamp
  return Array.from(merged.values()).sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Example 1: Basic usage
 *
 * ```tsx
 * function DealsPage() {
 *   const { recentDeals, addToHistory } = useHistoryTracking();
 *   const navigate = useNavigate();
 *
 *   const handleDealClick = (deal: Deal) => {
 *     addToHistory(deal);
 *     navigate(`/chatbot/deals/${deal.id}`);
 *   };
 *
 *   return (
 *     <div>
 *       <h2>Recent Deals</h2>
 *       {recentDeals.map(entry => (
 *         <div key={entry.dealId}>
 *           {entry.title} - {getRelativeTime(entry.timestamp)}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * Example 2: Session-only tracking
 *
 * ```tsx
 * function NegotiationRoom() {
 *   const { addToHistory } = useHistoryTracking(true); // session only
 *
 *   useEffect(() => {
 *     if (deal) {
 *       addToHistory(deal);
 *     }
 *   }, [deal, addToHistory]);
 * }
 * ```
 *
 * Example 3: Clear history on logout
 *
 * ```tsx
 * function Logout() {
 *   const { clearHistory } = useHistoryTracking();
 *
 *   const handleLogout = () => {
 *     clearHistory();
 *     clearAllHistory();
 *     // ... logout logic
 *   };
 * }
 * ```
 *
 * Example 4: Navigate to last viewed
 *
 * ```tsx
 * function QuickAccess() {
 *   const { getLastViewed } = useHistoryTracking();
 *   const navigate = useNavigate();
 *
 *   const goToLastViewed = () => {
 *     const last = getLastViewed();
 *     if (last) {
 *       navigate(`/chatbot/deals/${last.dealId}`);
 *     }
 *   };
 * }
 * ```
 */

// ============================================================================
// Test Cases
// ============================================================================

/**
 * Test 1: Add Deal to History
 * - Should add deal to beginning of array
 * - Should update timestamp
 * - Should save to storage
 *
 * Test 2: Add Duplicate Deal
 * - Should remove old entry
 * - Should add new entry at beginning
 * - Should have only one entry for that deal
 *
 * Test 3: History Size Limit
 * - Add 15 deals
 * - Should keep only 10 most recent
 * - Oldest 5 should be dropped
 *
 * Test 4: Remove Deal from History
 * - Add 3 deals
 * - Remove middle one
 * - Should have 2 deals remaining
 * - Removed deal should not be in array
 *
 * Test 5: Clear History
 * - Add 5 deals
 * - Clear history
 * - Should have empty array
 * - Storage should be cleared
 *
 * Test 6: Get Last Viewed
 * - Add 3 deals in order: A, B, C
 * - Last viewed should be C
 * - Add D
 * - Last viewed should be D
 *
 * Test 7: Storage Persistence
 * - Add deals
 * - Reload page (unmount/remount hook)
 * - Should load deals from storage
 * - Order should be preserved
 *
 * Test 8: Session vs Local Storage
 * - useHistoryTracking(false) should use localStorage
 * - useHistoryTracking(true) should use sessionStorage
 * - Both should work independently
 *
 * Test 9: Storage Event Sync
 * - Add deal in Tab A
 * - Tab B should receive storage event
 * - Tab B's history should update
 *
 * Test 10: Relative Time Display
 * - Deal viewed 30 seconds ago → "just now"
 * - Deal viewed 5 minutes ago → "5 minutes ago"
 * - Deal viewed 2 hours ago → "2 hours ago"
 * - Deal viewed 3 days ago → "3 days ago"
 *
 * Test 11: Is In History
 * - Add deal with id "abc"
 * - isInHistory("abc") should return true
 * - isInHistory("xyz") should return false
 *
 * Test 12: Merge Histories
 * - Add deals to session storage
 * - Add deals to local storage
 * - mergeHistories() should combine both
 * - Should deduplicate by dealId
 * - Should keep most recent timestamp
 */
