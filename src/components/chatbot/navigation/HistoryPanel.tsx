/**
 * HistoryPanel Component
 *
 * Recently viewed deals panel with quick navigation.
 * Displays the last 10 viewed deals with status badges and relative timestamps.
 *
 * Features:
 * - List of last 10 viewed deals
 * - Click to navigate
 * - Clear history button
 * - Timestamp display (relative: "2 minutes ago")
 * - Deal status badges
 * - Empty state when no history
 * - Hover effects and visual feedback
 *
 * @example
 * ```tsx
 * // Sidebar integration
 * <HistoryPanel onNavigate={(dealId) => navigate(`/chatbot/deals/${dealId}`)} />
 *
 * // With custom styling
 * <HistoryPanel className="w-64 h-full" showClearButton={true} />
 * ```
 */

import React from 'react';
import { useHistoryTracking, getRelativeTime } from '../../../hooks/chatbot/useHistoryTracking';
import type { DealStatus } from '../../../types/chatbot';

// ============================================================================
// Types
// ============================================================================

export interface HistoryPanelProps {
  onNavigate?: (dealId: string) => void;
  onClose?: () => void;
  className?: string;
  showClearButton?: boolean;
  maxItems?: number;
  useSessionStorage?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function HistoryPanel({
  onNavigate,
  onClose,
  className = '',
  showClearButton = true,
  maxItems = 10,
  useSessionStorage = false,
}: HistoryPanelProps) {
  // ============================================================================
  // State
  // ============================================================================

  const {
    recentDeals,
    clearHistory,
    removeFromHistory,
  } = useHistoryTracking(useSessionStorage);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleDealClick = (dealId: string) => {
    if (onNavigate) {
      onNavigate(dealId);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your history?')) {
      clearHistory();
    }
  };

  const handleRemoveDeal = (
    dealId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent navigation
    removeFromHistory(dealId);
  };

  // ============================================================================
  // Computed
  // ============================================================================

  const displayedDeals = recentDeals.slice(0, maxItems);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Deals</h3>
        <div className="flex items-center space-x-2">
          {showClearButton && recentDeals.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-red-600 hover:text-red-700 hover:underline"
              title="Clear history"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Deal List */}
      <div className="overflow-y-auto max-h-96">
        {displayedDeals.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-gray-200">
            {displayedDeals.map((entry) => (
              <DealHistoryItem
                key={entry.dealId}
                dealId={entry.dealId}
                title={entry.title}
                counterparty={entry.counterparty}
                status={entry.status}
                timestamp={entry.timestamp}
                onClick={handleDealClick}
                onRemove={handleRemoveDeal}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {displayedDeals.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
          <p className="text-xs text-gray-500">
            Showing {displayedDeals.length} of {recentDeals.length} recent deal
            {recentDeals.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface DealHistoryItemProps {
  dealId: string;
  title: string;
  counterparty: string | null;
  status: DealStatus;
  timestamp: Date;
  onClick: (dealId: string) => void;
  onRemove: (dealId: string, e: React.MouseEvent) => void;
}

function DealHistoryItem({
  dealId,
  title,
  counterparty,
  status,
  timestamp,
  onClick,
  onRemove,
}: DealHistoryItemProps) {
  return (
    <li
      onClick={() => onClick(dealId)}
      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {title}
          </p>

          {/* Counterparty */}
          {counterparty && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {counterparty}
            </p>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400 mt-1">
            {getRelativeTime(timestamp)}
          </p>
        </div>

        {/* Status Badge & Remove Button */}
        <div className="flex items-center space-x-2 ml-3">
          <StatusBadge status={status} size="sm" />
          <button
            onClick={(e) => onRemove(dealId, e)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1"
            title="Remove from history"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </li>
  );
}

interface StatusBadgeProps {
  status: DealStatus;
  size?: 'sm' | 'md';
}

function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  const statusConfig: Record<
    DealStatus,
    { label: string; color: string }
  > = {
    NEGOTIATING: {
      label: 'Active',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    ACCEPTED: {
      label: 'Accepted',
      color: 'bg-green-100 text-green-700 border-green-300',
    },
    WALKED_AWAY: {
      label: 'Walked Away',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    ESCALATED: {
      label: 'Escalated',
      color: 'bg-orange-100 text-orange-700 border-orange-300',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center">
      <svg
        className="w-12 h-12 mx-auto text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-sm text-gray-500">No recent deals</p>
      <p className="text-xs text-gray-400 mt-1">
        Your recently viewed deals will appear here
      </p>
    </div>
  );
}

export default HistoryPanel;

// ============================================================================
// Example Usage
// ============================================================================

/**
 * Example 1: Basic sidebar integration
 *
 * ```tsx
 * import { HistoryPanel } from '@/components/chatbot/navigation/HistoryPanel';
 * import { useNavigate } from 'react-router-dom';
 *
 * function Sidebar() {
 *   const navigate = useNavigate();
 *
 *   return (
 *     <div className="w-64 h-screen bg-white border-r">
 *       <HistoryPanel
 *         onNavigate={(dealId) => navigate(`/chatbot/deals/${dealId}`)}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Example 2: Dropdown menu
 *
 * ```tsx
 * function DealMenu() {
 *   const [showHistory, setShowHistory] = useState(false);
 *
 *   return (
 *     <div className="relative">
 *       <button onClick={() => setShowHistory(!showHistory)}>
 *         Recent Deals
 *       </button>
 *       {showHistory && (
 *         <div className="absolute top-full right-0 mt-2 w-80">
 *           <HistoryPanel
 *             onClose={() => setShowHistory(false)}
 *             maxItems={5}
 *           />
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * Example 3: Session-only tracking (temporary history)
 *
 * ```tsx
 * function TempHistory() {
 *   return (
 *     <HistoryPanel
 *       useSessionStorage={true}
 *       showClearButton={false}
 *     />
 *   );
 * }
 * ```
 *
 * Example 4: Custom navigation handler
 *
 * ```tsx
 * function CustomNavigation() {
 *   const handleNavigate = (dealId: string) => {
 *     // Track analytics
 *     analytics.track('deal_viewed_from_history', { dealId });
 *
 *     // Navigate
 *     window.location.href = `/deals/${dealId}`;
 *   };
 *
 *   return <HistoryPanel onNavigate={handleNavigate} />;
 * }
 * ```
 *
 * Example 5: Inline in page layout
 *
 * ```tsx
 * function DealsLayout() {
 *   return (
 *     <div className="grid grid-cols-4 gap-4">
 *       <div className="col-span-3">
 *         <DealsList />
 *       </div>
 *       <div className="col-span-1">
 *         <HistoryPanel className="sticky top-4" />
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * Example 6: Mobile-optimized modal
 *
 * ```tsx
 * function MobileHistory() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setOpen(true)}>History</button>
 *       {open && (
 *         <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
 *           <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-[80vh]">
 *             <HistoryPanel
 *               onClose={() => setOpen(false)}
 *               className="rounded-t-lg"
 *             />
 *           </div>
 *         </div>
 *       )}
 *     </>
 *   );
 * }
 * ```
 */

// ============================================================================
// Test Cases
// ============================================================================

/**
 * Test 1: Render Empty State
 * - No deals in history
 * - Should display empty state message
 * - Should show clock icon
 *
 * Test 2: Render Deal List
 * - Add 5 deals to history
 * - Should display 5 items
 * - Should show titles, counterparties, timestamps
 *
 * Test 3: Click Deal Navigation
 * - Click on a deal item
 * - Should call onNavigate with correct dealId
 * - Should not call onRemove
 *
 * Test 4: Remove Deal from History
 * - Click remove button (X icon)
 * - Should remove deal from list
 * - Should not navigate
 * - Should call onRemove with correct dealId
 *
 * Test 5: Clear All History
 * - Add 10 deals
 * - Click "Clear All" button
 * - Should show confirmation dialog
 * - Confirm → list should be empty
 * - Cancel → list should remain unchanged
 *
 * Test 6: Status Badge Colors
 * - NEGOTIATING → blue
 * - ACCEPTED → green
 * - WALKED_AWAY → gray
 * - ESCALATED → orange
 *
 * Test 7: Timestamp Display
 * - Deal viewed 30 seconds ago → "just now"
 * - Deal viewed 5 minutes ago → "5 minutes ago"
 * - Deal viewed 2 hours ago → "2 hours ago"
 * - Deal viewed 3 days ago → "3 days ago"
 *
 * Test 8: Max Items Limit
 * - Add 15 deals
 * - Set maxItems={5}
 * - Should display only 5 deals
 * - Footer should show "5 of 15"
 *
 * Test 9: Hover Effects
 * - Hover over deal item
 * - Background should change to gray-50
 * - Title should change to blue-600
 * - Remove button should become visible
 *
 * Test 10: Close Button
 * - Pass onClose prop
 * - Should display close button (X) in header
 * - Click close → should call onClose
 *
 * Test 11: Scrollable List
 * - Add 20 deals
 * - Container should be scrollable
 * - Should have max-h-96 class
 * - Should show scrollbar when needed
 *
 * Test 12: Responsive Design
 * - Mobile: stack items vertically, full width
 * - Desktop: show in sidebar, fixed width
 * - Should truncate long titles
 * - Should handle missing counterparty gracefully
 */
