import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import chatbotService from "../../services/chatbot.service";
import type { RequisitionDealsResponse, RequisitionDealsQueryParams, DealStatus, ArchiveFilter, VendorDealSummary } from "../../types/chatbot";
import { VendorDealCard, DealSummaryModal } from "../../components/chatbot/requisition-view";
import { FiArrowLeft, FiPlus, FiRefreshCw, FiFilter, FiFolder, FiDollarSign, FiClock, FiArchive } from "react-icons/fi";
// Note: FiArchive is still used for the "View Archived" link in the header
import { ConfirmDialog, ArchiveFilterDropdown } from "../../components/chatbot/common";
import toast from "react-hot-toast";

interface RequisitionDealsState {
  data: RequisitionDealsResponse | null;
  loading: boolean;
  error: Error | null;
}

/**
 * RequisitionDealsPage Component
 * Shows all vendor deals for a specific requisition
 * Level 2 of the 2-level hierarchy
 */
export default function RequisitionDealsPage() {
  const navigate = useNavigate();
  const { requisitionId } = useParams<{ requisitionId: string }>();
  const [state, setState] = useState<RequisitionDealsState>({
    data: null,
    loading: true,
    error: null,
  });
  const [filters, setFilters] = useState<RequisitionDealsQueryParams>({
    sortBy: "status",
    sortOrder: "asc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [dealToArchive, setDealToArchive] = useState<VendorDealSummary | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);

  const fetchDeals = async () => {
    if (!requisitionId) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await chatbotService.getRequisitionDeals(parseInt(requisitionId), {
        ...filters,
        archived: archiveFilter,
      });
      setState((prev) => ({
        ...prev,
        data: response.data,
        loading: false,
      }));
    } catch (err: any) {
      console.error("Failed to fetch requisition deals:", err);
      setState((prev) => ({
        ...prev,
        error: err,
        loading: false,
      }));
      toast.error(err.response?.data?.message || "Failed to load deals");
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [requisitionId, filters, archiveFilter]);

  const handleBack = () => {
    navigate("/chatbot/requisitions");
  };

  // Card click always navigates to chat page (for all statuses)
  // Uses nested URL structure: /chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId
  const handleDealClick = (dealId: string, _status: DealStatus, vendorId: number) => {
    navigate(`/chatbot/requisitions/${requisitionId}/vendors/${vendorId}/deals/${dealId}`);
  };

  // View Summary button click opens the modal
  // Save both dealId and vendorId for nested URL navigation
  const handleViewSummary = (dealId: string, vendorId: number) => {
    setSelectedDealId(dealId);
    setSelectedVendorId(vendorId);
    setShowSummaryModal(true);
  };

  // Navigate from modal to chat using hierarchical URL
  const handleViewChat = (dealId: string) => {
    setShowSummaryModal(false);
    // Use hierarchical URL structure with saved vendorId
    if (selectedVendorId) {
      navigate(`/chatbot/requisitions/${requisitionId}/vendors/${selectedVendorId}/deals/${dealId}`);
    } else {
      // Cannot navigate without vendorId - show error
      toast.error('Cannot open deal: missing vendor context');
    }
  };

  const handleCreateDeal = () => {
    navigate(`/chatbot/requisitions/deals/new?requisitionId=${requisitionId}`);
  };

  const handleRefresh = () => {
    fetchDeals();
    toast.success("Refreshed!");
  };

  const handleArchiveDealClick = (e: React.MouseEvent, deal: VendorDealSummary) => {
    e.stopPropagation();
    setDealToArchive(deal);
    setShowArchiveConfirm(true);
  };

  const handleConfirmArchive = async () => {
    if (!dealToArchive || !requisitionId) return;
    try {
      setArchiving(true);
      const ctx = {
        rfqId: parseInt(requisitionId),
        vendorId: dealToArchive.vendorId,
        dealId: dealToArchive.dealId,
      };
      await chatbotService.archiveDeal(ctx);
      toast.success(`Deal with "${dealToArchive.vendorName}" archived successfully`);
      setShowArchiveConfirm(false);
      setDealToArchive(null);
      fetchDeals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to archive deal');
    } finally {
      setArchiving(false);
    }
  };

  // Unarchive deal - immediate action, no confirmation needed
  const handleUnarchiveDealClick = async (e: React.MouseEvent, deal: VendorDealSummary) => {
    e.stopPropagation();
    if (!requisitionId || unarchiving) return;
    try {
      setUnarchiving(true);
      const ctx = {
        rfqId: parseInt(requisitionId),
        vendorId: deal.vendorId,
        dealId: deal.dealId,
      };
      await chatbotService.unarchiveDeal(ctx);
      toast.success(`Deal with "${deal.vendorName}" restored successfully`);
      fetchDeals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restore deal');
    } finally {
      setUnarchiving(false);
    }
  };

  const formatCurrency = (value: number | null): string => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const { data, loading, error } = state;

  // Backend handles all sorting, just use the deals as returned
  const sortedDeals = data?.deals || [];

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-bg flex-shrink-0 pt-6 px-6 pb-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-start justify-between">
          {/* Left Side: Back + Title */}
          <div className="flex items-start gap-4">
            <button
              onClick={handleBack}
              className="mt-1 p-2 text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              {data?.requisition && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      {data.requisition.rfqNumber}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-dark-text-secondary">
                      <FiFolder className="w-3.5 h-3.5" />
                      {data.requisition.projectName}
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">
                    {data.requisition.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                    <div className="flex items-center gap-1">
                      <FiDollarSign className="w-4 h-4" />
                      {formatCurrency(data.requisition.estimatedValue)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {formatDate(data.requisition.deadline)}
                    </div>
                  </div>
                </>
              )}
              {loading && !data && (
                <div className="animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-3">
            <ArchiveFilterDropdown
              value={archiveFilter}
              onChange={setArchiveFilter}
            />
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-600 dark:text-dark-text bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg transition-colors ${
                showFilters
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                  : "bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              title="Toggle Filters"
            >
              <FiFilter className="w-5 h-5" />
            </button>
            <button
              onClick={handleCreateDeal}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Add Vendor
            </button>
          </div>
        </div>

        {/* Status Summary Bar */}
        {data?.statusCounts && (
          <div className="flex items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-3">
              {data.statusCounts.negotiating > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {data.statusCounts.negotiating} Negotiating
                </span>
              )}
              {data.statusCounts.accepted > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  {data.statusCounts.accepted} Accepted
                </span>
              )}
              {data.statusCounts.walkedAway > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {data.statusCounts.walkedAway} Walked Away
                </span>
              )}
              {data.statusCounts.escalated > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  {data.statusCounts.escalated} Escalated
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-dark-text-secondary">
                {data.deals.length} total {data.deals.length === 1 ? "vendor" : "vendors"}
              </span>
            </div>
            {archiveFilter === 'active' && (
              <button
                onClick={() => navigate(`/chatbot/requisitions/${requisitionId}/archived`)}
                className="text-sm text-gray-600 dark:text-dark-text-secondary hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1.5 transition-colors"
              >
                <FiArchive className="w-4 h-4" />
                View Archived
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 pt-6 px-6 pb-6">
        {/* Filter Controls */}
        {showFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Status:</label>
              <select
                value={filters.status || ""}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as DealStatus || undefined })}
                className="px-3 py-1.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="NEGOTIATING">Negotiating</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="WALKED_AWAY">Walked Away</option>
                <option value="ESCALATED">Escalated</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Sort by:</label>
              <select
                value={filters.sortBy || "status"}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="px-3 py-1.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="status">Status Priority</option>
                <option value="lastActivity">Last Activity</option>
                <option value="utilityScore">Utility Score</option>
                <option value="vendorName">Vendor Name</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Order:</label>
              <select
                value={filters.sortOrder || "asc"}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                className="px-3 py-1.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Active First / A-Z</option>
                <option value="desc">Completed First / Z-A</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilters({ sortBy: "status", sortOrder: "asc" });
                setArchiveFilter('active');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Content */}
        {loading && !data ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-dark-text-secondary">Loading vendor deals...</p>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-800 dark:text-dark-text font-medium mb-2">Failed to load deals</p>
            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">{error.message}</p>
            <button
              onClick={fetchDeals}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : sortedDeals.length === 0 ? (
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
              No vendor deals yet
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
              Add vendors to this requisition to start negotiating
            </p>
            <button
              onClick={handleCreateDeal}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Add Vendor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDeals.map((deal) => (
              <VendorDealCard
                key={deal.dealId}
                deal={deal}
                onClick={handleDealClick}
                onViewSummary={handleViewSummary}
                onArchive={handleArchiveDealClick}
                showArchiveButton={archiveFilter !== 'archived'}
                onUnarchive={handleUnarchiveDealClick}
                showUnarchiveButton={archiveFilter === 'archived'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Deal Summary Modal */}
      {selectedDealId && selectedVendorId && requisitionId && (
        <DealSummaryModal
          dealId={selectedDealId}
          rfqId={parseInt(requisitionId)}
          vendorId={selectedVendorId}
          isOpen={showSummaryModal}
          onClose={() => {
            setShowSummaryModal(false);
            setSelectedDealId(null);
            setSelectedVendorId(null);
          }}
          onViewChat={handleViewChat}
        />
      )}

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showArchiveConfirm}
        title="Archive Deal"
        message={`Are you sure you want to archive the deal with "${dealToArchive?.vendorName}"?`}
        confirmText={archiving ? "Archiving..." : "Archive"}
        confirmButtonClass="bg-orange-500 hover:bg-orange-600 text-white"
        onConfirm={handleConfirmArchive}
        onCancel={() => {
          setShowArchiveConfirm(false);
          setDealToArchive(null);
        }}
      />
    </div>
  );
}
