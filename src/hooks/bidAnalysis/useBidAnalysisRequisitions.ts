/**
 * Hook for fetching and managing bid analysis requisitions list
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { bidAnalysisService } from '../../services/bidAnalysis.service';
import type {
  BidAnalysisFilters,
  RequisitionWithBidSummary,
  PaginatedResult,
} from '../../types/bidAnalysis';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS: BidAnalysisFilters = {
  page: 1,
  limit: 10,
  status: 'all',
  sortBy: 'negotiationClosureDate',
  sortOrder: 'desc',
};

interface UseBidAnalysisRequisitionsResult {
  requisitions: RequisitionWithBidSummary[];
  pagination: PaginatedResult<RequisitionWithBidSummary>['pagination'] | null;
  filters: BidAnalysisFilters;
  loading: boolean;
  error: string | null;
  setFilters: (filters: Partial<BidAnalysisFilters>) => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
  goToPage: (page: number) => void;
}

export function useBidAnalysisRequisitions(): UseBidAnalysisRequisitionsResult {
  const [requisitions, setRequisitions] = useState<RequisitionWithBidSummary[]>([]);
  const [pagination, setPagination] = useState<PaginatedResult<RequisitionWithBidSummary>['pagination'] | null>(null);
  const [filters, setFiltersState] = useState<BidAnalysisFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if component is mounted
  const isMounted = useRef(true);

  const fetchRequisitions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await bidAnalysisService.getRequisitions(filters);

      if (isMounted.current) {
        setRequisitions(result.data);
        setPagination(result.pagination);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load requisitions';
      if (isMounted.current) {
        setError(message);
        toast.error(message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [filters]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchRequisitions();
  }, [fetchRequisitions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setFilters = useCallback((newFilters: Partial<BidAnalysisFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except when changing page)
      page: 'page' in newFilters ? (newFilters.page || 1) : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const refresh = useCallback(async () => {
    await fetchRequisitions();
  }, [fetchRequisitions]);

  const goToPage = useCallback((page: number) => {
    setFiltersState(prev => ({ ...prev, page }));
  }, []);

  return {
    requisitions,
    pagination,
    filters,
    loading,
    error,
    setFilters,
    resetFilters,
    refresh,
    goToPage,
  };
}

export default useBidAnalysisRequisitions;
