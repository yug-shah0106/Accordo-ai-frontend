/**
 * BidAnalysisListPage - Main list page showing requisitions with bid summaries
 */

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVerified, MdSearch, MdFilterList, MdRefresh } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useBidAnalysisRequisitions } from '../../hooks/bidAnalysis';
import { RequisitionCard } from '../../components/BidAnalysis';
import type { BidAnalysisStatus } from '../../types/bidAnalysis';

const STATUS_OPTIONS: { value: BidAnalysisStatus; label: string }[] = [
  { value: 'all', label: 'All Requisitions' },
  { value: 'ready', label: 'Ready for Analysis' },
  { value: 'awaiting', label: 'Awaiting Completion' },
  { value: 'awarded', label: 'Awarded' },
];

export const BidAnalysisListPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    requisitions,
    pagination,
    filters,
    loading,
    error,
    setFilters,
    resetFilters,
    refresh,
    goToPage,
  } = useBidAnalysisRequisitions();

  const handleRequisitionClick = useCallback((requisitionId: number) => {
    navigate(`/bid-analysis/requisitions/${requisitionId}`);
  }, [navigate]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ search: e.target.value });
  }, [setFilters]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ status: e.target.value as BidAnalysisStatus });
  }, [setFilters]);

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MdVerified className="text-blue-500" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bid Analysis</h1>
              <p className="text-sm text-gray-500">Compare and analyze vendor bids</p>
            </div>
          </div>
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

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={filters.search || ''}
                onChange={handleSearchChange}
                placeholder="Search by RFQ ID or subject..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <MdFilterList className="text-gray-400" size={20} />
            <select
              value={filters.status}
              onChange={handleStatusChange}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {(filters.search || filters.status !== 'all') && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6">
        {/* Loading State */}
        {loading && requisitions.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && requisitions.length === 0 && (
          <div className="text-center py-16">
            <MdVerified className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No requisitions found
            </h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'Requisitions with completed bids will appear here'}
            </p>
            {(filters.search || filters.status !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Requisition Grid */}
        {requisitions.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {requisitions.map((requisition) => (
                <RequisitionCard
                  key={requisition.id}
                  requisition={requisition}
                  onClick={handleRequisitionClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of{' '}
                  {pagination.totalItems} requisitions
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BidAnalysisListPage;
