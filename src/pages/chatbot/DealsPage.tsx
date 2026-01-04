import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import chatbotService from "../../services/chatbot.service";
import type { Deal, ListDealsParams } from "../../types/chatbot";

interface DealsPageState {
  deals: Deal[];
  loading: boolean;
  error: Error | null;
  totalPages: number;
}

interface FiltersState {
  status: string;
  mode: string;
  archived: boolean;
  deleted: boolean;
}

/**
 * DealsPage Component
 * Main deals list with filters
 */
export default function DealsPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<DealsPageState>({
    deals: [],
    loading: true,
    error: null,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<FiltersState>({
    status: "",
    mode: "",
    archived: false,
    deleted: false,
  });
  const [page, setPage] = useState<number>(1);

  const fetchDeals = async (): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const params: ListDealsParams = {
        page,
        limit: 10,
        ...(filters.status && { status: filters.status as any }),
        ...(filters.mode && { mode: filters.mode as any }),
        ...(filters.archived && { archived: true }),
        ...(filters.deleted && { deleted: true }),
      };

      const response = await chatbotService.listDeals(params);
      // response.data is the ListDealsResponse
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
  }, [filters, page]);

  const handleCreateDeal = (): void => {
    navigate("/chatbot/deals/new");
  };

  const handleDealClick = (dealId: string): void => {
    navigate(`/chatbot/deals/${dealId}`);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters({ ...filters, status: e.target.value });
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFilters({ ...filters, mode: e.target.value });
  };

  const handleArchivedChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters({ ...filters, archived: e.target.checked });
  };

  const handleDeletedChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters({ ...filters, deleted: e.target.checked });
  };

  const { deals, loading, error, totalPages } = state;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Negotiation Deals</h1>
            <p className="text-gray-600 mt-1">Manage your procurement negotiations</p>
          </div>
          <button
            onClick={handleCreateDeal}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Deal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WALKED_AWAY">Walked Away</option>
              <option value="ESCALATED">Escalated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={filters.mode}
              onChange={handleModeChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Modes</option>
              <option value="INSIGHTS">Insights</option>
              <option value="CONVERSATION">Conversation</option>
            </select>
          </div>

          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.archived}
                onChange={handleArchivedChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Archived</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.deleted}
                onChange={handleDeletedChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Deleted</span>
            </label>
          </div>

          <div className="ml-auto">
            <button
              onClick={fetchDeals}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Deals List */}
      {loading && deals.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deals...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
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
          <p className="text-gray-800 font-medium mb-2">Failed to load deals</p>
          <p className="text-gray-600 text-sm">{error.message}</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No deals found</h3>
          <p className="text-gray-600 mb-6">
            {filters.status || filters.mode || filters.archived || filters.deleted
              ? "Try adjusting your filters"
              : "Get started by creating your first negotiation deal"}
          </p>
          <button
            onClick={handleCreateDeal}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Create Deal
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => handleDealClick(deal.id)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {deal.title}
                    </h3>
                    {deal.counterparty && (
                      <p className="text-sm text-gray-600 mb-2">
                        Counterparty: {deal.counterparty}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                          deal.status === "NEGOTIATING"
                            ? "bg-blue-100 text-blue-700"
                            : deal.status === "ACCEPTED"
                            ? "bg-green-100 text-green-700"
                            : deal.status === "WALKED_AWAY"
                            ? "bg-red-100 text-red-700"
                            : deal.status === "ESCALATED"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {deal.status}
                      </span>
                      <span className="text-xs text-gray-500">Round {deal.round}</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(deal.createdAt)}
                      </span>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
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
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
