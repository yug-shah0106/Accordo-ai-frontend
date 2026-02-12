/**
 * Hook for fetching and managing bid analysis detail for a requisition
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { bidAnalysisService } from '../../services/bidAnalysis.service';
import type {
  RequisitionBidDetail,
  BidActionHistoryEntry,
  TopBidInfo,
} from '../../types/bidAnalysis';
import toast from 'react-hot-toast';

// Polling interval in milliseconds (30 seconds)
const POLLING_INTERVAL = 30000;

interface UseBidAnalysisDetailResult {
  detail: RequisitionBidDetail | null;
  history: BidActionHistoryEntry[];
  selectedBid: TopBidInfo | null;
  loading: boolean;
  historyLoading: boolean;
  error: string | null;
  selectBidForReview: (bidId: string) => void;
  clearSelection: () => void;
  refresh: () => Promise<void>;
  refreshHistory: () => Promise<void>;
}

export function useBidAnalysisDetail(requisitionId: number | null): UseBidAnalysisDetailResult {
  const [detail, setDetail] = useState<RequisitionBidDetail | null>(null);
  const [history, setHistory] = useState<BidActionHistoryEntry[]>([]);
  const [selectedBid, setSelectedBid] = useState<TopBidInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if component is mounted
  const isMounted = useRef(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!requisitionId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await bidAnalysisService.getRequisitionDetail(requisitionId);

      if (isMounted.current) {
        setDetail(result);

        // Auto-select L1 bid if available and nothing selected
        if (!selectedBid && result.topBids.length > 0) {
          const l1Bid = result.topBids.find(b => b.rank === 1 && !b.isRejected);
          if (l1Bid) {
            setSelectedBid(l1Bid);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load requisition detail';
      if (isMounted.current) {
        setError(message);
        toast.error(message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [requisitionId, selectedBid]);

  const fetchHistory = useCallback(async () => {
    if (!requisitionId) return;

    try {
      setHistoryLoading(true);

      const result = await bidAnalysisService.getHistory(requisitionId);

      if (isMounted.current) {
        setHistory(result);
      }
    } catch (err) {
      // Don't show toast for history errors - it's secondary data
      console.error('Failed to load history:', err);
    } finally {
      if (isMounted.current) {
        setHistoryLoading(false);
      }
    }
  }, [requisitionId]);

  // Fetch on mount and when requisitionId changes
  useEffect(() => {
    if (requisitionId) {
      fetchDetail();
      fetchHistory();
    }
  }, [requisitionId, fetchDetail, fetchHistory]);

  // Setup polling
  useEffect(() => {
    if (!requisitionId) return;

    pollingRef.current = setInterval(() => {
      if (isMounted.current) {
        fetchDetail();
        fetchHistory();
      }
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [requisitionId, fetchDetail, fetchHistory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const selectBidForReview = useCallback((bidId: string) => {
    if (!detail) return;

    const bid = detail.topBids.find(b => b.bidId === bidId) ||
                detail.allBids.find(b => b.bidId === bidId);

    if (bid) {
      setSelectedBid(bid);
    }
  }, [detail]);

  const clearSelection = useCallback(() => {
    setSelectedBid(null);
  }, []);

  const refresh = useCallback(async () => {
    await fetchDetail();
  }, [fetchDetail]);

  const refreshHistory = useCallback(async () => {
    await fetchHistory();
  }, [fetchHistory]);

  return {
    detail,
    history,
    selectedBid,
    loading,
    historyLoading,
    error,
    selectBidForReview,
    clearSelection,
    refresh,
    refreshHistory,
  };
}

export default useBidAnalysisDetail;
