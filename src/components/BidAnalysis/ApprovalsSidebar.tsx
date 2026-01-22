/**
 * ApprovalsSidebar - Right sidebar with approvals and history tabs
 */

import React, { useState } from 'react';
import { MdCheck, MdClose, MdRefresh, MdPerson, MdAccessTime } from 'react-icons/md';
import type { TopBidInfo, BidActionHistoryEntry } from '../../types/bidAnalysis';

interface ApprovalsSidebarProps {
  selectedBid: TopBidInfo | null;
  history: BidActionHistoryEntry[];
  onAccept: (remarks?: string) => void;
  onReject: (remarks?: string) => void;
  onRestore: (bidId: string) => void;
  isAwarded: boolean;
  loading: boolean;
}

type TabType = 'approvals' | 'history';

export const ApprovalsSidebar: React.FC<ApprovalsSidebarProps> = ({
  selectedBid,
  history,
  onAccept,
  onReject,
  onRestore,
  isAwarded,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('approvals');
  const [remarks, setRemarks] = useState('');

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleAccept = () => {
    onAccept(remarks || undefined);
    setRemarks('');
  };

  const handleReject = () => {
    onReject(remarks || undefined);
    setRemarks('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'approvals'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Approvals
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'approvals' ? (
          <ApprovalsTab
            selectedBid={selectedBid}
            remarks={remarks}
            setRemarks={setRemarks}
            onAccept={handleAccept}
            onReject={handleReject}
            onRestore={onRestore}
            isAwarded={isAwarded}
            loading={loading}
            formatCurrency={formatCurrency}
          />
        ) : (
          <HistoryTab history={history} formatTimeAgo={formatTimeAgo} />
        )}
      </div>
    </div>
  );
};

// Approvals Tab Component
interface ApprovalsTabProps {
  selectedBid: TopBidInfo | null;
  remarks: string;
  setRemarks: (value: string) => void;
  onAccept: () => void;
  onReject: () => void;
  onRestore: (bidId: string) => void;
  isAwarded: boolean;
  loading: boolean;
  formatCurrency: (value: number | null) => string;
}

const ApprovalsTab: React.FC<ApprovalsTabProps> = ({
  selectedBid,
  remarks,
  setRemarks,
  onAccept,
  onReject,
  onRestore,
  isAwarded,
  loading,
  formatCurrency,
}) => {
  if (isAwarded) {
    return (
      <div className="text-center py-8">
        <MdCheck className="mx-auto text-green-500 mb-2" size={48} />
        <p className="text-gray-600 font-medium">Requisition Awarded</p>
        <p className="text-sm text-gray-500 mt-1">
          A vendor has been selected for this requisition
        </p>
      </div>
    );
  }

  if (!selectedBid) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MdPerson className="mx-auto mb-2 opacity-50" size={48} />
        <p>Select a bid to review</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Vendor Card */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Selected Vendor</h4>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {selectedBid.vendorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{selectedBid.vendorName}</p>
            <p className="text-sm text-gray-500 truncate">{selectedBid.vendorEmail}</p>
          </div>
        </div>

        {/* Bid Details */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200">
          <div>
            <span className="text-xs text-gray-500">Price</span>
            <p className="font-semibold text-gray-900">{formatCurrency(selectedBid.finalPrice)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Terms</span>
            <p className="font-semibold text-gray-900">{selectedBid.paymentTerms || 'N/A'}</p>
          </div>
        </div>

        {/* Rejected Status */}
        {selectedBid.isRejected && (
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-700 font-medium">This bid has been rejected</p>
            {selectedBid.rejectedRemarks && (
              <p className="text-sm text-red-600 mt-1">{selectedBid.rejectedRemarks}</p>
            )}
            <button
              onClick={() => onRestore(selectedBid.bidId)}
              disabled={loading}
              className="mt-2 flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <MdRefresh size={16} />
              Restore Bid
            </button>
          </div>
        )}
      </div>

      {/* Remarks Input */}
      {!selectedBid.isRejected && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter your remarks (required)..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                remarks.trim() === '' ? 'border-gray-300' : 'border-gray-300'
              }`}
            />
            {remarks.trim() === '' && (
              <p className="mt-1 text-xs text-gray-500">
                Please provide remarks before accepting or rejecting
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onAccept}
              disabled={loading || remarks.trim() === ''}
              title={remarks.trim() === '' ? 'Please enter remarks first' : 'Accept this bid'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdCheck size={18} />
              Accept
            </button>
            <button
              onClick={onReject}
              disabled={loading || remarks.trim() === ''}
              title={remarks.trim() === '' ? 'Please enter remarks first' : 'Reject this bid'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdClose size={18} />
              Reject
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// History Tab Component
interface HistoryTabProps {
  history: BidActionHistoryEntry[];
  formatTimeAgo: (dateStr: string) => string;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ history, formatTimeAgo }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SELECTED':
        return <MdCheck className="text-green-500" size={16} />;
      case 'REJECTED':
        return <MdClose className="text-red-500" size={16} />;
      case 'RESTORED':
        return <MdRefresh className="text-blue-500" size={16} />;
      default:
        return <MdAccessTime className="text-gray-400" size={16} />;
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MdAccessTime className="mx-auto mb-2 opacity-50" size={48} />
        <p>No history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="flex gap-3 p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex-shrink-0 mt-0.5">
            {getActionIcon(entry.action)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-gray-900 text-sm">{entry.actionLabel}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTimeAgo(entry.createdAt)}
              </span>
            </div>
            {entry.vendorName && (
              <p className="text-sm text-gray-600 mt-0.5">{entry.vendorName}</p>
            )}
            {entry.remarks && (
              <p className="text-sm text-gray-500 mt-1 italic">"{entry.remarks}"</p>
            )}
            <p className="text-xs text-gray-400 mt-1">by {entry.userName}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalsSidebar;
