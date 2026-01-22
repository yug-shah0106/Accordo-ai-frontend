import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import chatbotService from "../../services/chatbot.service";
import type { RequisitionDealsResponse, VendorDealSummary } from "../../types/chatbot";
import { VendorDealCard } from "../../components/chatbot/requisition-view";
import { ConfirmDialog } from "../../components/chatbot/common";
import { FiArrowLeft, FiRefreshCw, FiArchive, FiFolder, FiDollarSign, FiClock } from "react-icons/fi";
import { MdRestore } from "react-icons/md";
import toast from "react-hot-toast";

export default function ArchivedDealsForRequisitionPage() {
  const navigate = useNavigate();
  const { requisitionId } = useParams<{ requisitionId: string }>();
  const [data, setData] = useState<RequisitionDealsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false);
  const [dealToUnarchive, setDealToUnarchive] = useState<VendorDealSummary | null>(null);
  const [unarchiving, setUnarchiving] = useState(false);

  const fetchArchivedDeals = async () => {
    if (!requisitionId) return;
    setLoading(true);
    try {
      const response = await chatbotService.getRequisitionDeals(parseInt(requisitionId), { archived: 'archived' });
      setData(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load archived deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedDeals();
  }, [requisitionId]);

  const handleUnarchiveClick = (e: React.MouseEvent, deal: VendorDealSummary) => {
    e.stopPropagation();
    setDealToUnarchive(deal);
    setShowUnarchiveConfirm(true);
  };

  const handleConfirmUnarchive = async () => {
    if (!dealToUnarchive || !requisitionId) return;
    try {
      setUnarchiving(true);
      const ctx = {
        rfqId: parseInt(requisitionId),
        vendorId: dealToUnarchive.vendorId,
        dealId: dealToUnarchive.dealId,
      };
      await chatbotService.unarchiveDeal(ctx);
      toast.success(`Deal with "${dealToUnarchive.vendorName}" restored successfully`);
      setShowUnarchiveConfirm(false);
      setDealToUnarchive(null);
      fetchArchivedDeals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restore deal');
    } finally {
      setUnarchiving(false);
    }
  };

  const handleDealClick = (dealId: string, _status: any, vendorId: number) => {
    navigate(`/chatbot/requisitions/${requisitionId}/vendors/${vendorId}/deals/${dealId}`);
  };

  const formatCurrency = (value: number | null): string => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-bg flex-shrink-0 pt-6 px-6 pb-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(`/chatbot/requisitions/${requisitionId}`)}
              className="mt-1 p-2 text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              {data?.requisition ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <FiArchive className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      {data.requisition.rfqNumber}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-sm text-gray-500 dark:text-dark-text-secondary flex items-center gap-1">
                      <FiFolder className="w-3.5 h-3.5" />
                      {data.requisition.projectName}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">
                    Archived Deals - {data.requisition.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                    <span className="flex items-center gap-1">
                      <FiDollarSign className="w-4 h-4" />
                      {formatCurrency(data.requisition.estimatedValue)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {formatDate(data.requisition.deadline)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={fetchArchivedDeals}
            disabled={loading}
            className="p-2 text-gray-600 dark:text-dark-text bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="mt-4">
          <span className="text-sm text-gray-500 dark:text-dark-text-secondary">
            {data?.deals.length || 0} archived {(data?.deals.length || 0) === 1 ? 'deal' : 'deals'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-6 px-6 pb-6">
        {loading && !data ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-dark-text-secondary">Loading archived deals...</p>
          </div>
        ) : (data?.deals.length || 0) === 0 ? (
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-12 text-center">
            <FiArchive className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
              No archived deals
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
              Archived deals for this requisition will appear here
            </p>
            <button
              onClick={() => navigate(`/chatbot/requisitions/${requisitionId}`)}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to active deals
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.deals.map((deal) => (
              <div key={deal.dealId} className="relative group">
                <VendorDealCard
                  deal={deal}
                  onClick={handleDealClick}
                />
                <button
                  onClick={(e) => handleUnarchiveClick(e, deal)}
                  className="absolute bottom-4 right-4 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-white dark:bg-dark-surface border border-green-200 dark:border-green-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-1.5"
                >
                  <MdRestore className="w-4 h-4" />
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showUnarchiveConfirm}
        title="Restore Deal"
        message={`Are you sure you want to restore the deal with "${dealToUnarchive?.vendorName}"?`}
        confirmText={unarchiving ? "Restoring..." : "Restore"}
        confirmButtonClass="bg-green-500 hover:bg-green-600 text-white"
        onConfirm={handleConfirmUnarchive}
        onCancel={() => {
          setShowUnarchiveConfirm(false);
          setDealToUnarchive(null);
        }}
      />
    </div>
  );
}
