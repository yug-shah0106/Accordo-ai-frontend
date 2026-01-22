/**
 * RequisitionCard - Card component for displaying requisition with bid summary
 */

import React from 'react';
import { MdVerified, MdAccessTime, MdPeople, MdTrendingUp, MdTrendingDown } from 'react-icons/md';
import type { RequisitionWithBidSummary } from '../../types/bidAnalysis';
import { ANALYSIS_STATUS_COLORS } from '../../types/bidAnalysis';

interface RequisitionCardProps {
  requisition: RequisitionWithBidSummary;
  onClick?: (requisitionId: number) => void;
}

export const RequisitionCard: React.FC<RequisitionCardProps> = ({ requisition, onClick }) => {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getStatusBadge = () => {
    if (requisition.hasAwardedVendor) {
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${ANALYSIS_STATUS_COLORS.awarded.bg} ${ANALYSIS_STATUS_COLORS.awarded.text}`}>
          Awarded
        </span>
      );
    }
    if (requisition.isReadyForAnalysis) {
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${ANALYSIS_STATUS_COLORS.ready.bg} ${ANALYSIS_STATUS_COLORS.ready.text}`}>
          Ready for Analysis
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${ANALYSIS_STATUS_COLORS.awaiting.bg} ${ANALYSIS_STATUS_COLORS.awaiting.text}`}>
        Awaiting Completion
      </span>
    );
  };

  const handleClick = () => {
    if (onClick) {
      onClick(requisition.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-blue-600">{requisition.rfqId}</span>
            {requisition.hasAwardedVendor && (
              <MdVerified className="text-blue-500" size={16} />
            )}
          </div>
          <h3 className="font-semibold text-gray-900 line-clamp-1">{requisition.subject}</h3>
          {requisition.projectName && (
            <p className="text-sm text-gray-500 mt-0.5">{requisition.projectName}</p>
          )}
        </div>
        {getStatusBadge()}
      </div>

      {/* Bid Stats */}
      <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <MdPeople size={14} />
            <span className="text-xs">Bids</span>
          </div>
          <p className="font-semibold text-gray-900">{requisition.bidsCount}</p>
          <p className="text-xs text-gray-500">
            {requisition.completedBidsCount} complete
          </p>
        </div>

        <div className="text-center border-x border-gray-100">
          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
            <MdTrendingDown size={14} />
            <span className="text-xs">Lowest</span>
          </div>
          <p className="font-semibold text-green-700">
            {formatCurrency(requisition.lowestPrice)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
            <MdTrendingUp size={14} />
            <span className="text-xs">Highest</span>
          </div>
          <p className="font-semibold text-red-600">
            {formatCurrency(requisition.highestPrice)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <MdAccessTime size={14} />
          <span>Deadline: {formatDate(requisition.negotiationClosureDate)}</span>
        </div>
        {requisition.awardedVendorName && (
          <span className="text-blue-600 font-medium truncate max-w-[150px]">
            {requisition.awardedVendorName}
          </span>
        )}
      </div>
    </div>
  );
};

export default RequisitionCard;
