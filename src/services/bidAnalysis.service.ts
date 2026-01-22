/**
 * Bid Analysis API Service
 * Handles all API calls to the bid analysis backend module
 *
 * API Structure:
 * All operations use /api/bid-analysis/ prefix
 * /api/bid-analysis/requisitions - List with filters
 * /api/bid-analysis/requisitions/:id - Detail with top bids
 * /api/bid-analysis/requisitions/:id/history - Action history
 * /api/bid-analysis/requisitions/:id/select/:bidId - Select bid
 * /api/bid-analysis/requisitions/:id/reject/:bidId - Reject bid
 * /api/bid-analysis/requisitions/:id/restore/:bidId - Restore bid
 */

import { authApi } from '../api/index';
import type {
  BidAnalysisFilters,
  RequisitionWithBidSummary,
  PaginatedResult,
  RequisitionBidDetail,
  BidActionHistoryEntry,
  SelectBidResult,
  RejectBidResult,
  RestoreBidResult,
} from '../types/bidAnalysis';

const BID_ANALYSIS_BASE = '/bid-analysis';

/**
 * Build requisition URL
 */
const buildRequisitionUrl = (requisitionId?: number, suffix?: string): string => {
  const base = `${BID_ANALYSIS_BASE}/requisitions`;
  if (requisitionId) {
    return suffix ? `${base}/${requisitionId}/${suffix}` : `${base}/${requisitionId}`;
  }
  return base;
};

/**
 * Build bid action URL
 */
const buildBidActionUrl = (requisitionId: number, action: string, bidId: string): string => {
  return `${BID_ANALYSIS_BASE}/requisitions/${requisitionId}/${action}/${bidId}`;
};

/**
 * Bid Analysis Service - All API methods
 */
export const bidAnalysisService = {
  // ==================== REQUISITION LIST ====================

  /**
   * Get requisitions with bid summaries
   * GET /api/bid-analysis/requisitions
   * Params: search, status, projectId, dateFrom, dateTo, page, limit, sortBy, sortOrder
   */
  getRequisitions: async (
    filters: Partial<BidAnalysisFilters> = {}
  ): Promise<PaginatedResult<RequisitionWithBidSummary>> => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      ...filters,
    };
    const res = await authApi.get<{ data: PaginatedResult<RequisitionWithBidSummary> }>(
      buildRequisitionUrl(),
      { params }
    );
    return res.data.data;
  },

  // ==================== REQUISITION DETAIL ====================

  /**
   * Get detailed bid analysis for a requisition
   * GET /api/bid-analysis/requisitions/:requisitionId
   */
  getRequisitionDetail: async (requisitionId: number): Promise<RequisitionBidDetail> => {
    const res = await authApi.get<{ data: RequisitionBidDetail }>(
      buildRequisitionUrl(requisitionId)
    );
    return res.data.data;
  },

  // ==================== ACTION HISTORY ====================

  /**
   * Get action history for a requisition
   * GET /api/bid-analysis/requisitions/:requisitionId/history
   */
  getHistory: async (requisitionId: number): Promise<BidActionHistoryEntry[]> => {
    const res = await authApi.get<{ data: BidActionHistoryEntry[] }>(
      buildRequisitionUrl(requisitionId, 'history')
    );
    return res.data.data;
  },

  // ==================== BID ACTIONS ====================

  /**
   * Select a bid (award requisition to vendor)
   * POST /api/bid-analysis/requisitions/:requisitionId/select/:bidId
   */
  selectBid: async (
    requisitionId: number,
    bidId: string,
    remarks?: string
  ): Promise<SelectBidResult> => {
    const res = await authApi.post<{ data: SelectBidResult }>(
      buildBidActionUrl(requisitionId, 'select', bidId),
      { remarks }
    );
    return res.data.data;
  },

  /**
   * Reject a bid
   * POST /api/bid-analysis/requisitions/:requisitionId/reject/:bidId
   */
  rejectBid: async (
    requisitionId: number,
    bidId: string,
    remarks?: string
  ): Promise<RejectBidResult> => {
    const res = await authApi.post<{ data: RejectBidResult }>(
      buildBidActionUrl(requisitionId, 'reject', bidId),
      { remarks }
    );
    return res.data.data;
  },

  /**
   * Restore a rejected bid
   * POST /api/bid-analysis/requisitions/:requisitionId/restore/:bidId
   */
  restoreBid: async (requisitionId: number, bidId: string): Promise<RestoreBidResult> => {
    const res = await authApi.post<{ data: RestoreBidResult }>(
      buildBidActionUrl(requisitionId, 'restore', bidId)
    );
    return res.data.data;
  },

  /**
   * Log export action (for audit trail)
   * POST /api/bid-analysis/requisitions/:requisitionId/export
   */
  logExport: async (requisitionId: number): Promise<void> => {
    await authApi.post(buildRequisitionUrl(requisitionId, 'export'));
  },

  // ==================== PDF DOWNLOAD ====================

  /**
   * Get PDF download URL
   * Uses the bid-analysis module endpoint which generates PDFs on-the-fly
   */
  getPdfDownloadUrl: (requisitionId: number): string => {
    return `/api/bid-analysis/requisitions/${requisitionId}/pdf`;
  },
};

export default bidAnalysisService;
