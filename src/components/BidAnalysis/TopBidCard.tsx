/**
 * TopBidCard - Card component for displaying L1/L2/L3 bids with selection
 */

import { CheckCircle, MessageCircle, XCircle } from 'lucide-react';
import React from 'react';

import type { TopBidInfo } from '../../types/bidAnalysis';
import { RANK_LABELS, RANK_COLORS } from '../../types/bidAnalysis';

interface TopBidCardProps {
  bid: TopBidInfo;
  isSelected: boolean;
  onSelect: (bidId: string) => void;
  onChatClick: (dealId: string, vendorId: number, requisitionId: number) => void;
  requisitionId: number;
  disabled?: boolean;
}

export const TopBidCard: React.FC<TopBidCardProps> = ({
  bid,
  isSelected,
  onSelect,
  onChatClick,
  requisitionId,
  disabled = false,
}) => {
  const rankColors = RANK_COLORS[bid.rank] || RANK_COLORS[3];
  const rankLabel = RANK_LABELS[bid.rank] || `L${bid.rank}`;

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatUtility = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const handleSelect = () => {
    if (!disabled && !bid.isRejected) {
      onSelect(bid.bidId);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChatClick(bid.dealId, bid.vendorId, requisitionId);
  };

  return (
    <div
      onClick={handleSelect}
      className={`
        relative bg-white dark:bg-dark-surface rounded-lg border-2 p-4 transition-all
        ${isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200 dark:border-dark-border'}
        ${bid.isRejected ? 'opacity-50 bg-gray-50 dark:bg-dark-bg/50' : 'cursor-pointer hover:border-blue-300'}
        ${disabled ? 'cursor-not-allowed' : ''}
      `}
    >
      {/* Rank Badge */}
      <div className={`
        absolute -top-3 left-4 px-3 py-1 rounded-full text-sm font-bold
        ${rankColors.bg} ${rankColors.text} border ${rankColors.border}
      `}>
        {rankLabel}
      </div>

      {/* Rejected Overlay */}
      {bid.isRejected && (
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
            <XCircle size={12} />
            Rejected
          </span>
        </div>
      )}

      {/* Radio Selection */}
      <div className="flex items-start gap-3 mt-2">
        <div className="pt-1">
          <input
            type="radio"
            checked={isSelected}
            onChange={handleSelect}
            disabled={disabled || bid.isRejected}
            className="w-4 h-4 text-blue-600 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Vendor Name */}
          <h4 className="font-semibold text-gray-900 dark:text-dark-text truncate">{bid.vendorName}</h4>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">{bid.vendorEmail}</p>

          {/* Price */}
          <div className="mt-3">
            <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">
              {formatCurrency(bid.finalPrice)}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div>
              <span className="text-gray-500 dark:text-dark-text-secondary">Terms:</span>
              <span className="ml-1 text-gray-900 dark:text-dark-text">{bid.paymentTerms || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-dark-text-secondary">Utility:</span>
              <span className="ml-1 text-gray-900 dark:text-dark-text">{formatUtility(bid.utilityScore)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleChatClick}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-dark-text-secondary rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              <MessageCircle size={16} />
              <span>Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Indicator */}
      {isSelected && !bid.isRejected && (
        <div className="absolute -top-3 right-4 z-10 bg-white dark:bg-dark-surface rounded-full">
          <CheckCircle className="text-blue-500" size={24} />
        </div>
      )}
    </div>
  );
};

export default TopBidCard;
