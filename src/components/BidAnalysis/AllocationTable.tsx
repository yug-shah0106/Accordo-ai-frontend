/**
 * AllocationTable - Full bids table with all metrics
 */

import React from 'react';
import { MdChat, MdCheckCircle, MdCancel } from 'react-icons/md';
import type { BidWithDetails } from '../../types/bidAnalysis';
import { RANK_LABELS, BID_STATUS_COLORS } from '../../types/bidAnalysis';

interface AllocationTableProps {
  bids: BidWithDetails[];
  selectedBidId: string | null;
  onChatClick: (dealId: string, vendorId: number, requisitionId: number) => void;
  requisitionId: number;
}

export const AllocationTable: React.FC<AllocationTableProps> = ({
  bids,
  selectedBidId,
  onChatClick,
  requisitionId,
}) => {
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatUtility = (value: number | null) => {
    if (value === null) return '-';
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (bid: BidWithDetails) => {
    const colors = BID_STATUS_COLORS[bid.bidStatus];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
        {bid.bidStatus}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vendor
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Terms
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Delivery
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utility
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chat
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bids.map((bid) => {
            const isSelected = bid.bidId === selectedBidId;
            const rankLabel = RANK_LABELS[bid.rank] || `L${bid.rank}`;

            return (
              <tr
                key={bid.bidId}
                className={`
                  ${isSelected ? 'bg-blue-50' : ''}
                  ${bid.isRejected ? 'bg-gray-50 text-gray-400' : ''}
                  hover:bg-gray-50 transition-colors
                `}
              >
                {/* Rank */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-1 text-xs font-bold rounded
                      ${bid.rank <= 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {rankLabel}
                    </span>
                    {isSelected && <MdCheckCircle className="text-blue-500" size={16} />}
                    {bid.isRejected && <MdCancel className="text-red-400" size={16} />}
                  </div>
                </td>

                {/* Vendor */}
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className={`font-medium ${bid.isRejected ? 'text-gray-400' : 'text-gray-900'}`}>
                      {bid.vendorName}
                    </span>
                    <span className="text-xs text-gray-500">{bid.vendorEmail}</span>
                  </div>
                </td>

                {/* Price */}
                <td className={`px-4 py-3 text-right font-medium ${bid.isRejected ? 'text-gray-400' : 'text-gray-900'}`}>
                  {formatCurrency(bid.finalPrice)}
                </td>

                {/* Terms */}
                <td className={`px-4 py-3 ${bid.isRejected ? 'text-gray-400' : 'text-gray-600'}`}>
                  {bid.paymentTerms || '-'}
                </td>

                {/* Delivery */}
                <td className={`px-4 py-3 ${bid.isRejected ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatDate(bid.deliveryDate)}
                </td>

                {/* Utility */}
                <td className={`px-4 py-3 text-right font-medium ${bid.isRejected ? 'text-gray-400' : 'text-gray-900'}`}>
                  {formatUtility(bid.utilityScore)}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(bid)}
                </td>

                {/* Chat */}
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onChatClick(bid.dealId, bid.vendorId, requisitionId)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="View chat"
                  >
                    <MdChat size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {bids.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No bids available
        </div>
      )}
    </div>
  );
};

export default AllocationTable;
