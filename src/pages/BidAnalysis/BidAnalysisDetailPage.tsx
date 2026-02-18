/**
 * BidAnalysisDetailPage - Detailed bid analysis with top bids and approvals sidebar
 */

import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdVerified,
  MdTrendingDown,
  MdTrendingUp,
  MdDownload,
  MdRefresh,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { useBidAnalysisDetail, useBidActions } from '../../hooks/bidAnalysis';
import { TopBidCard, AllocationTable, ApprovalsSidebar, SuccessModal } from '../../components/BidAnalysis';
import type { SuccessActionType } from '../../components/BidAnalysis';

export const BidAnalysisDetailPage: React.FC = () => {
  const { requisitionId } = useParams<{ requisitionId: string }>();
  const navigate = useNavigate();
  const reqId = requisitionId ? parseInt(requisitionId, 10) : null;

  const {
    detail,
    history,
    selectedBid,
    loading,
    historyLoading: _historyLoading,
    error,
    selectBidForReview,
    refresh,
    refreshHistory,
  } = useBidAnalysisDetail(reqId);

  const { loading: actionLoading, selectBid, rejectBid, restoreBid, downloadPdf: _downloadPdf } = useBidActions();

  // Success modal state
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    actionType: SuccessActionType;
    vendorName: string;
    bidPrice?: number;
    poId?: number | null;
  }>({
    isOpen: false,
    actionType: 'accept',
    vendorName: '',
  });

  const closeSuccessModal = useCallback(() => {
    setSuccessModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleBack = () => {
    navigate('/bid-analysis');
  };

  const handleChatClick = useCallback((dealId: string, vendorId: number, rfqId: number) => {
    navigate(`/chatbot/requisitions/${rfqId}/vendors/${vendorId}/deals/${dealId}`);
  }, [navigate]);

  const handleAccept = useCallback(async (remarks?: string) => {
    if (!reqId || !selectedBid) return;
    const result = await selectBid(reqId, selectedBid.bidId, remarks);
    if (result) {
      // Show success modal
      setSuccessModal({
        isOpen: true,
        actionType: 'accept',
        vendorName: result.vendorName,
        bidPrice: (result as any).selectedPrice,
        poId: result.poId,
      });
      // Auto-refresh data
      refresh();
      refreshHistory();
    }
  }, [reqId, selectedBid, selectBid, refresh, refreshHistory]);

  const handleReject = useCallback(async (remarks?: string) => {
    if (!reqId || !selectedBid) return;
    const result = await rejectBid(reqId, selectedBid.bidId, remarks);
    if (result) {
      // Show success modal
      setSuccessModal({
        isOpen: true,
        actionType: 'reject',
        vendorName: selectedBid.vendorName,
        bidPrice: selectedBid.finalPrice || undefined,
      });
      // Auto-refresh data
      refresh();
      refreshHistory();
    }
  }, [reqId, selectedBid, rejectBid, refresh, refreshHistory]);

  const handleRestore = useCallback(async (bidId: string) => {
    if (!reqId) return;
    // Find the bid being restored for modal info
    const bidToRestore = detail?.allBids?.find(b => b.bidId === bidId);
    const result = await restoreBid(reqId, bidId);
    if (result) {
      // Show success modal
      setSuccessModal({
        isOpen: true,
        actionType: 'restore',
        vendorName: bidToRestore?.vendorName || 'Vendor',
        bidPrice: bidToRestore?.finalPrice || undefined,
      });
      // Auto-refresh data
      refresh();
      refreshHistory();
    }
  }, [reqId, restoreBid, refresh, refreshHistory, detail]);

  // Loading State
  if (loading && !detail) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  const { requisition, priceRange, topBids, allBids, isAwarded } = detail;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MdArrowBack size={24} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <MdVerified className="text-blue-500" size={20} />
                <span className="text-sm font-medium text-blue-600">{requisition.rfqId}</span>
                {isAwarded && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Awarded
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mt-1">{requisition.subject}</h1>
              {requisition.projectName && (
                <p className="text-sm text-gray-500">{requisition.projectName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => reqId && _downloadPdf(reqId)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <MdDownload size={18} />
              Export PDF
            </button>
            <button
              onClick={async () => {
                try {
                  await refresh();
                  toast.success("Data refreshed");
                } catch {
                  toast.error("Failed to refresh");
                }
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <MdRefresh className={loading ? 'animate-spin' : ''} size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Price Range Bar */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <MdTrendingDown className="text-green-600" size={20} />
            <span className="text-sm text-gray-500">Lowest:</span>
            <span className="font-semibold text-green-700">{formatCurrency(priceRange.lowest)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MdTrendingUp className="text-red-500" size={20} />
            <span className="text-sm text-gray-500">Highest:</span>
            <span className="font-semibold text-red-600">{formatCurrency(priceRange.highest)}</span>
          </div>
          {priceRange.targetPrice && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Target:</span>
              <span className="font-semibold text-gray-700">{formatCurrency(priceRange.targetPrice)}</span>
            </div>
          )}
          <div className="flex-1" />
          <div className="text-sm text-gray-500">
            Deadline: {formatDate(requisition.negotiationClosureDate)}
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Overview Section */}
          {(priceRange.targetPrice || priceRange.maxAcceptablePrice) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Price Comparison</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {priceRange.targetPrice && (
                  <div>
                    <span className="text-sm text-gray-500">Target Price</span>
                    <p className="font-semibold text-gray-900">{formatCurrency(priceRange.targetPrice)}</p>
                  </div>
                )}
                {priceRange.maxAcceptablePrice && (
                  <div>
                    <span className="text-sm text-gray-500">Max Acceptable</span>
                    <p className="font-semibold text-gray-900">{formatCurrency(priceRange.maxAcceptablePrice)}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-500">Best Offer</span>
                  <p className="font-semibold text-green-700">{formatCurrency(priceRange.lowest)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Average Offer</span>
                  <p className="font-semibold text-gray-700">{formatCurrency(priceRange.average)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 Bids Section */}
          {topBids.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Top Bids</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topBids.map((bid) => (
                  <TopBidCard
                    key={bid.bidId}
                    bid={bid}
                    isSelected={selectedBid?.bidId === bid.bidId}
                    onSelect={selectBidForReview}
                    onChatClick={handleChatClick}
                    requisitionId={requisition.id}
                    disabled={isAwarded}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Allocation Summary Table */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">All Bids</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <AllocationTable
                bids={allBids}
                selectedBidId={selectedBid?.bidId || null}
                onChatClick={handleChatClick}
                requisitionId={requisition.id}
              />
            </div>
          </div>
        </div>

        {/* Approvals Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex-shrink-0 overflow-hidden">
          <ApprovalsSidebar
            selectedBid={selectedBid}
            history={history}
            onAccept={handleAccept}
            onReject={handleReject}
            onRestore={handleRestore}
            isAwarded={isAwarded}
            loading={actionLoading}
          />
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        actionType={successModal.actionType}
        vendorName={successModal.vendorName}
        bidPrice={successModal.bidPrice}
        poId={successModal.poId}
        onClose={closeSuccessModal}
      />
    </div>
  );
};

export default BidAnalysisDetailPage;
