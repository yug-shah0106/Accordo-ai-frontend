import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chatbotService from "../../services/chatbot.service";
import type { Deal, ListDealsParams, DealContext } from "../../types/chatbot";
import { FiArchive, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

interface DealsPageState {
  deals: Deal[];
  loading: boolean;
  error: Error | null;
  totalPages: number;
}

/**
 * DealsPage Component
 * 3x3 Grid layout with archive/delete buttons
 */
export default function DealsPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<DealsPageState>({
    deals: [],
    loading: true,
    error: null,
    totalPages: 1,
  });
  const [page, setPage] = useState<number>(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const fetchDeals = async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: ListDealsParams = {
        page,
        limit: 9, // 3x3 grid = 9 items per page
        archived: false,
        deleted: false,
      };

      const response = await chatbotService.listDeals(params);
      const responseData: any = response.data;
      setState((prev) => ({
        ...prev,
        deals: responseData.data || responseData.deals || [],
        totalPages: responseData.totalPages || 1,
        loading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err as Error,
        loading: false,
      }));
      console.error("Failed to fetch deals:", err);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [page]);

  const handleCreateDeal = (): void => {
    navigate("/chatbot/requisitions/deals/new");
  };

  /**
   * Navigate to deal using nested URL structure
   * Shows error for legacy deals without requisitionId or vendorId
   */
  const handleDealClick = (deal: Deal): void => {
    if (deal.requisitionId && deal.vendorId) {
      // Use hierarchical URL structure
      navigate(`/chatbot/requisitions/${deal.requisitionId}/vendors/${deal.vendorId}/deals/${deal.id}`);
    } else {
      // Legacy deals cannot be accessed - missing context
      toast.error('Cannot open deal: missing requisition or vendor context');
    }
  };

  /**
   * Build DealContext from Deal object
   */
  const buildContext = (deal: Deal): DealContext | null => {
    if (!deal.requisitionId || !deal.vendorId) {
      return null;
    }
    return {
      rfqId: deal.requisitionId,
      vendorId: deal.vendorId,
      dealId: deal.id,
    };
  };

  const handleArchive = async (e: React.MouseEvent, deal: Deal) => {
    e.stopPropagation(); // Prevent navigation to deal

    const ctx = buildContext(deal);
    if (!ctx) {
      toast.error('Cannot archive deal: missing requisition or vendor context');
      return;
    }

    try {
      setActionLoading(deal.id);
      await chatbotService.archiveDeal(ctx);
      toast.success(`"${deal.title}" has been archived`, {
        duration: 3000,
        icon: '📦',
      });
      fetchDeals(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to archive deal:', error);
      toast.error(error.response?.data?.message || 'Failed to archive deal');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const { deals, loading, error, totalPages } = state;

  // Client-side filtering for search and date
  const filteredDeals = deals.filter((deal) => {
    // Search filter (independent of date filters)
    const matchesSearch = searchQuery === "" ||
      deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.counterparty && deal.counterparty.toLowerCase().includes(searchQuery.toLowerCase()));

    // Date filters
    if (selectedMonth || selectedYear) {
      const dealDate = new Date(deal.createdAt);
      const dealMonth = String(dealDate.getMonth() + 1); // 1-12
      const dealYear = String(dealDate.getFullYear());

      const matchesMonth = !selectedMonth || dealMonth === selectedMonth;
      const matchesYear = !selectedYear || dealYear === selectedYear;

      return matchesSearch && matchesMonth && matchesYear;
    }

    return matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-dark-bg flex-shrink-0 pt-6 px-6 pb-4 border-b border-gray-200 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text">Negotiation Deals</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mt-1">Manage your procurement negotiations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chatbot/archived')}
              className="px-4 py-2 bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-dark-text font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FiArchive className="w-4 h-4" />
              Archived
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

      {/* Scrollable Content Area */}
      <div className="flex-1 pt-6 px-6 pb-6">
        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4">
        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
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
              placeholder="Search deals by title or counterparty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
        </div>

        {/* Month and Year Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-dark-text whitespace-nowrap">
              Filter by:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            {(selectedMonth || selectedYear) && (
              <button
                onClick={() => {
                  setSelectedMonth("");
                  setSelectedYear("");
                }}
                className="ml-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
            {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'} found
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      {loading && deals.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Loading deals...</p>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-800 dark:text-dark-text font-medium mb-2">Failed to load deals</p>
          <p className="text-gray-600 dark:text-dark-text-secondary text-sm">{error.message}</p>
        </div>
      ) : filteredDeals.length === 0 ? (
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
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
            {searchQuery || selectedMonth || selectedYear ? 'No deals match your filters' : 'No deals found'}
          </h3>
          <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
            {searchQuery || selectedMonth || selectedYear
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first negotiation deal'}
          </p>
          {searchQuery || selectedMonth || selectedYear ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedMonth("");
                setSelectedYear("");
              }}
              className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={handleCreateDeal}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Create Deal
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 3x3 Grid of Deal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => handleDealClick(deal)}
                className="bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-dark-border overflow-hidden group"
              >
                {/* Card Header with Status */}
                <div className={`h-2 ${
                  deal.status === "NEGOTIATING"
                    ? "bg-blue-500"
                    : deal.status === "ACCEPTED"
                    ? "bg-green-500"
                    : deal.status === "WALKED_AWAY"
                    ? "bg-red-500"
                    : deal.status === "ESCALATED"
                    ? "bg-orange-500"
                    : "bg-gray-400"
                }`}></div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2 truncate group-hover:text-blue-600 transition-colors">
                    {deal.title}
                  </h3>

                  {/* Counterparty */}
                  {deal.counterparty && (
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-3 truncate">
                      {deal.counterparty}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        deal.status === "NEGOTIATING"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : deal.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : deal.status === "WALKED_AWAY"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : deal.status === "ESCALATED"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                      }`}
                    >
                      {deal.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-dark-text-secondary">Round {deal.round}</span>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-4">
                    {formatDate(deal.createdAt)}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-dark-border">
                    <button
                      onClick={(e) => handleArchive(e, deal)}
                      disabled={actionLoading === deal.id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Archive this deal"
                    >
                      <FiArchive className="w-4 h-4" />
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
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
    </div>
  );
}
