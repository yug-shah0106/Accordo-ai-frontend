/**
 * Bid Analysis Type Definitions
 *
 * Types for the bid analysis module, including requisition summaries,
 * top bids, action history, and approval workflows.
 */

// ============================================================================
// Bid Status Types
// ============================================================================

export type BidStatus = 'PENDING' | 'COMPLETED' | 'EXCLUDED' | 'SELECTED' | 'REJECTED';
export type DealStatus = 'NEGOTIATING' | 'ACCEPTED' | 'WALKED_AWAY' | 'ESCALATED';
export type BidActionType = 'SELECTED' | 'REJECTED' | 'RESTORED' | 'VIEWED' | 'EXPORTED' | 'COMPARISON_GENERATED';
export type BidAnalysisStatus = 'ready' | 'awaiting' | 'awarded' | 'all';

// ============================================================================
// Filter Types
// ============================================================================

export interface BidAnalysisFilters {
  search?: string;
  status?: BidAnalysisStatus;
  projectId?: number;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
  sortBy?: 'rfqId' | 'subject' | 'negotiationClosureDate' | 'bidsCount' | 'lowestPrice';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Requisition Types
// ============================================================================

export interface RequisitionWithBidSummary {
  id: number;
  rfqId: string;
  subject: string;
  description: string | null;
  status: string;
  negotiationClosureDate: string | null;
  deliveryDate: string | null;
  projectId: number | null;
  projectName: string | null;
  createdBy: number | null;
  createdByName: string | null;
  // Bid statistics
  bidsCount: number;
  completedBidsCount: number;
  pendingBidsCount: number;
  excludedBidsCount: number;
  // Price range
  lowestPrice: number | null;
  highestPrice: number | null;
  averagePrice: number | null;
  // Analysis status
  isReadyForAnalysis: boolean;
  hasAwardedVendor: boolean;
  awardedVendorName: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============================================================================
// Bid Types
// ============================================================================

export interface ChatSummaryMetrics {
  totalRounds: number;
  initialPrice: number | null;
  finalPrice: number | null;
  priceReductionPercent: number | null;
  initialPaymentTerms: string | null;
  finalPaymentTerms: string | null;
  keyDecisions: Array<{
    round: number;
    action: string;
    utilityScore: number;
  }>;
  negotiationDurationHours: number | null;
  averageUtilityScore: number | null;
}

export interface TopBidInfo {
  bidId: string;
  rank: number;
  vendorId: number;
  vendorName: string;
  vendorEmail: string;
  finalPrice: number;
  unitPrice: number | null;
  paymentTerms: string | null;
  deliveryDate: string | null;
  utilityScore: number | null;
  bidStatus: BidStatus;
  dealStatus: DealStatus;
  dealId: string;
  chatLink: string | null;
  chatSummaryMetrics: ChatSummaryMetrics | null;
  chatSummaryNarrative: string | null;
  isRejected: boolean;
  rejectedAt: string | null;
  rejectedBy: string | null;
  rejectedRemarks: string | null;
}

export interface BidWithDetails extends TopBidInfo {
  contractId: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Requisition Detail Types
// ============================================================================

export interface RequisitionBidDetail {
  requisition: {
    id: number;
    rfqId: string;
    subject: string;
    description: string | null;
    category: string | null;
    targetPrice: number | null;
    maxAcceptablePrice: number | null;
    negotiationClosureDate: string | null;
    deliveryDate: string | null;
    status: string;
    projectId: number | null;
    projectName: string | null;
    createdBy: number | null;
    createdByName: string | null;
    totalVendors: number;
    completedVendors: number;
  };
  priceRange: {
    lowest: number | null;
    highest: number | null;
    average: number | null;
    targetPrice: number | null;
    maxAcceptablePrice: number | null;
  };
  topBids: TopBidInfo[];
  allBids: BidWithDetails[];
  selectedBidId: string | null;
  selectedVendorId: number | null;
  selectedVendorName: string | null;
  isAwarded: boolean;
}

// ============================================================================
// Action History Types
// ============================================================================

export interface ActionDetails {
  vendorId?: number;
  vendorName?: string;
  bidPrice?: number;
  previousStatus?: string;
  newStatus?: string;
  selectionId?: number;
  poId?: number;
  pdfUrl?: string;
  [key: string]: unknown;
}

export interface BidActionHistoryEntry {
  id: number;
  requisitionId: number;
  bidId: string | null;
  userId: number;
  userName: string;
  userEmail: string;
  action: BidActionType;
  actionDetails: ActionDetails | null;
  remarks: string | null;
  createdAt: string;
  actionLabel: string;
  vendorName: string | null;
  bidPrice: number | null;
}

// ============================================================================
// Action Result Types
// ============================================================================

export interface RejectBidResult {
  success: boolean;
  bidId: string;
  previousStatus: BidStatus;
  newStatus: BidStatus;
  historyId: number;
}

export interface RestoreBidResult {
  success: boolean;
  bidId: string;
  previousStatus: BidStatus;
  newStatus: BidStatus;
  historyId: number;
}

export interface SelectBidResult {
  success: boolean;
  selectionId: number;
  vendorId: number;
  vendorName: string;
  poId: number | null;
  notificationsSent: number;
  historyId: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export type RequisitionsListResponse = ApiResponse<PaginatedResult<RequisitionWithBidSummary>>;
export type RequisitionDetailResponse = ApiResponse<RequisitionBidDetail>;
export type HistoryListResponse = ApiResponse<BidActionHistoryEntry[]>;
export type SelectBidResponse = ApiResponse<SelectBidResult>;
export type RejectBidResponse = ApiResponse<RejectBidResult>;
export type RestoreBidResponse = ApiResponse<RestoreBidResult>;

// ============================================================================
// Component Props Types
// ============================================================================

export interface RequisitionCardProps {
  requisition: RequisitionWithBidSummary;
  onClick?: (requisitionId: number) => void;
}

export interface TopBidCardProps {
  bid: TopBidInfo;
  isSelected: boolean;
  onSelect: (bidId: string) => void;
  onChatClick: (dealId: string, vendorId: number, requisitionId: number) => void;
  disabled?: boolean;
}

export interface AllocationTableProps {
  bids: BidWithDetails[];
  selectedBidId: string | null;
  onChatClick: (dealId: string, vendorId: number, requisitionId: number) => void;
}

export interface ApprovalsSidebarProps {
  selectedBid: TopBidInfo | null;
  history: BidActionHistoryEntry[];
  onAccept: (remarks?: string) => void;
  onReject: (remarks?: string) => void;
  onRestore: (bidId: string) => void;
  isAwarded: boolean;
  loading: boolean;
}

export interface HistoryTabProps {
  history: BidActionHistoryEntry[];
  loading: boolean;
}

// ============================================================================
// Display Constants
// ============================================================================

export const ACTION_LABELS: Record<BidActionType, string> = {
  SELECTED: 'Selected vendor',
  REJECTED: 'Rejected bid',
  RESTORED: 'Restored bid',
  VIEWED: 'Viewed analysis',
  EXPORTED: 'Exported PDF',
  COMPARISON_GENERATED: 'Generated comparison',
};

export const BID_STATUS_COLORS: Record<BidStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  EXCLUDED: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
  SELECTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export const ANALYSIS_STATUS_COLORS: Record<BidAnalysisStatus, { bg: string; text: string }> = {
  ready: { bg: 'bg-green-100', text: 'text-green-800' },
  awaiting: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  awarded: { bg: 'bg-blue-100', text: 'text-blue-800' },
  all: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export const RANK_LABELS: Record<number, string> = {
  1: 'L1',
  2: 'L2',
  3: 'L3',
};

export const RANK_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  2: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  3: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
};
