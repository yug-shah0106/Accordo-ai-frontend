import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chatbotService from "../../services/chatbot.service";
import type { RequisitionWithDeals, RequisitionsQueryParams, ArchiveFilter } from "../../types/chatbot";
import { RequisitionCard } from "../../components/chatbot/requisition-view";
import { FiPlus, FiFilter, FiRefreshCw, FiArchive, FiRotateCcw } from "react-icons/fi";
import { ConfirmDialog, ArchiveFilterDropdown } from "../../components/chatbot/common";
import toast from "react-hot-toast";

interface RequisitionListState {
  requisitions: RequisitionWithDeals[];
  loading: boolean;
  error: Error | null;
  total: number;
  totalPages: number;
}

/**
 * RequisitionListPage Component
 * Main page showing all requisitions with their deal summaries
 * Level 1 of the 2-level hierarchy
 */
export default function RequisitionListPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<RequisitionListState>({
    requisitions: [],
    loading: true,
    error: null,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<RequisitionsQueryParams>({
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 9,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('active');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [requisitionToArchive, setRequisitionToArchive] = useState<RequisitionWithDeals | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [unarchiving, setUnarchiving] = useState(false);

  const fetchRequisitions = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: RequisitionsQueryParams = {
        ...filters,
        page,
        archived: archiveFilter,
      };

      const response = await chatbotService.getRequisitionsWithDeals(params);
      setState((prev) => ({
        ...prev,
        requisitions: response.data.requisitions,
        total: response.data.total,
        totalPages: response.data.totalPages,
        loading: false,
      }));
    } catch (err: any) {
      console.error("Failed to fetch requisitions:", err);
      setState((prev) => ({
        ...prev,
        error: err,
        loading: false,
      }));
      toast.error(err.response?.data?.message || "Failed to load requisitions");
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [page, filters, archiveFilter]);

  const handleRequisitionClick = (requisitionId: number) => {
    navigate(`/chatbot/requisitions/${requisitionId}`);
  };

  const handleCreateDeal = () => {
    navigate("/chatbot/requisitions/deals/new");
  };

  const handleRefresh = () => {
    fetchRequisitions();
    toast.success("Refreshed!");
  };

  const handleArchiveClick = (e: React.MouseEvent, requisition: RequisitionWithDeals) => {
    e.stopPropagation();
    setRequisitionToArchive(requisition);
    setShowArchiveConfirm(true);
  };

  const handleConfirmArchive = async () => {
    if (!requisitionToArchive) return;
    try {
      setArchiving(true);
      await chatbotService.archiveRequisition(requisitionToArchive.id);
      toast.success(`"${requisitionToArchive.title}" archived successfully`);
      setShowArchiveConfirm(false);
      setRequisitionToArchive(null);
      fetchRequisitions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to archive requisition');
    } finally {
      setArchiving(false);
    }
  };

  // Unarchive requisition - immediate action, no confirmation needed
  // Also recovers all deals under this requisition
  const handleUnarchiveClick = async (e: React.MouseEvent, requisition: RequisitionWithDeals) => {
    e.stopPropagation();
    if (unarchiving) return;
    try {
      setUnarchiving(true);
      await chatbotService.unarchiveRequisition(requisition.id, true); // true = recover all deals
      toast.success(`"${requisition.title}" restored successfully`);
      fetchRequisitions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to restore requisition');
    } finally {
      setUnarchiving(false);
    }
  };

  const filteredRequisitions = state.requisitions.filter((req) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.rfqNumber.toLowerCase().includes(query) ||
      req.title.toLowerCase().includes(query) ||
      req.projectName.toLowerCase().includes(query)
    );
  });

  const { loading, error, totalPages } = state;

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-bg flex-shrink-0 pt-6 px-6 pb-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">Negotiation Deals</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mt-1">
              Browse requisitions and manage vendor negotiations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ArchiveFilterDropdown
              value={archiveFilter}
              onChange={setArchiveFilter}
            />
            {archiveFilter === 'active' && (
              <button
                onClick={() => navigate('/chatbot/requisitions/archived')}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-800 transition-colors flex items-center gap-2"
              >
                <FiArchive className="w-4 h-4" />
                View Archived
              </button>
            )}
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
              New Deal
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 pt-6 px-6 pb-6">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by RFQ number, title, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Status:</label>
                <select
                  value={filters.status || "all"}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  className="px-3 py-1.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active Deals</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Sort by:</label>
                <select
                  value={filters.sortBy || "createdAt"}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="px-3 py-1.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="deadline">Deadline</option>
                  <option value="vendorCount">Vendor Count</option>
                  <option value="completionPercentage">Completion</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Order:</label>
                <select
                  value={filters.sortOrder || "desc"}
                  onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                  className="px-3 py-1.5 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({ status: "all", sortBy: "createdAt", sortOrder: "desc", limit: 9 })}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-dark-text-secondary dark:hover:text-dark-text"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
            {filteredRequisitions.length} {filteredRequisitions.length === 1 ? "requisition" : "requisitions"} found
          </div>
        </div>

        {/* Content */}
        {loading && state.requisitions.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-dark-text-secondary">Loading requisitions...</p>
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
            <p className="text-gray-800 dark:text-dark-text font-medium mb-2">Failed to load requisitions</p>
            <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">{error.message}</p>
            <button
              onClick={fetchRequisitions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredRequisitions.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
              {searchQuery ? "No requisitions match your search" : "No requisitions found"}
            </h3>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Create a new deal to get started with negotiations"
              }
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={handleCreateDeal}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Create New Deal
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Requisition Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequisitions.map((requisition) => (
                <div key={requisition.id} className="relative group">
                  <RequisitionCard
                    requisition={requisition}
                    onClick={handleRequisitionClick}
                  />
                  {/* Archive Button - shown when viewing active requisitions */}
                  {archiveFilter !== 'archived' && (
                    <button
                      onClick={(e) => handleArchiveClick(e, requisition)}
                      className="absolute bottom-4 right-4 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-800 flex items-center gap-1.5"
                    >
                      <FiArchive className="w-3.5 h-3.5" />
                      Archive
                    </button>
                  )}
                  {/* Unarchive Button - shown when viewing archived requisitions */}
                  {archiveFilter === 'archived' && (
                    <button
                      onClick={(e) => handleUnarchiveClick(e, requisition)}
                      disabled={unarchiving}
                      className="absolute bottom-4 right-4 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-800 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <FiRotateCcw className="w-3.5 h-3.5" />
                      Unarchive
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-dark-text"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700 dark:text-dark-text">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-dark-text"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showArchiveConfirm}
        title="Archive Requisition"
        message={`Are you sure you want to archive "${requisitionToArchive?.title}"? This will also archive all ${(requisitionToArchive?.activeDeals || 0) + (requisitionToArchive?.completedDeals || 0)} deals under it.`}
        confirmText={archiving ? "Archiving..." : "Archive"}
        confirmButtonClass="bg-orange-500 hover:bg-orange-600 text-white"
        onConfirm={handleConfirmArchive}
        onCancel={() => {
          setShowArchiveConfirm(false);
          setRequisitionToArchive(null);
        }}
      />
    </div>
  );
}
