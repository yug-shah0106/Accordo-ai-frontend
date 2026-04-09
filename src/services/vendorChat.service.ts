/**
 * Vendor Chat API Service
 * Public endpoints for vendor chat functionality (no authentication required)
 * Uses 'api' instead of 'authApi' for all requests
 */

import api from "../api";
import type { MesoResult, DecisionAction } from "../types/chatbot";

const VENDOR_CHAT_BASE = "/vendor-chat";

/**
 * Quote data structure
 */
export interface ContractDetails {
  products: Array<{
    productId: number;
    productName: string;
    quantity: number;
    quotedPrice: number | string;
    deliveryDate?: string;
  }>;
  additionalTerms?: {
    paymentTerms?: string;
    netPaymentDay?: number | string;
    prePaymentPercentage?: number | string;
    postPaymentPercentage?: number | string;
    additionalNotes?: string;
  };
}

/**
 * Pending structured prompt shape (April 2026).
 * Attached to ACCORDO messages that asked a structured question. The vendor
 * composer uses this to render the matching input mode (numeric percent,
 * payment terms dropdown). When the vendor answers via the dedicated
 * endpoint the prompt is considered resolved.
 */
export type PendingPrompt =
  | {
      type: "discount_percent";
      discount: { originalTotal: number; currency: string };
    }
  | {
      type: "payment_terms";
      paymentTerms: { presets: number[] };
    };

/**
 * Message structure
 */
export interface VendorChatMessage {
  id: string;
  dealId: string;
  role: "VENDOR" | "ACCORDO" | "SYSTEM";
  content: string;
  extractedOffer?: {
    unit_price?: number | null;
    total_price?: number | null;
    payment_terms?: string | null;
    payment_terms_days?: number | null;
  } | null;
  counterOffer?: {
    unit_price?: number | null;
    payment_terms?: string | null;
  } | null;
  engineDecision?: {
    action?: string;
    pendingPrompt?: PendingPrompt;
    discountApplied?: { percent: number; discountAppliedTo: number };
    [key: string]: unknown;
  } | null;
  decision?: string | null;
  createdAt: string;
}

/**
 * Deal structure
 */
export interface VendorDeal {
  id: string;
  title: string;
  status: "NEGOTIATING" | "ACCEPTED" | "WALKED_AWAY" | "ESCALATED";
  round: number;
  mode: "INSIGHTS" | "CONVERSATION";
  createdAt: string;
  updatedAt: string;
}

/**
 * Requisition product (vendor view - no PM targets)
 */
export interface VendorRequisitionProduct {
  id: number;
  name: string;
  quantity: number;
  unit: string | null;
}

/**
 * Requisition data for vendor (stripped of PM targets)
 */
export interface VendorRequisition {
  id: number;
  title: string;
  rfqNumber: string | null;
  products: VendorRequisitionProduct[];
}

/**
 * Deal data response for vendor
 */
export interface VendorDealData {
  deal: VendorDeal;
  messages: VendorChatMessage[];
  contract: any;
  requisition: VendorRequisition;
  vendorQuote: ContractDetails | null;
  isVendor: true;
}

/**
 * PM decision structure
 */
export interface PMDecision {
  action: DecisionAction;
  utilityScore: number;
  counterOffer?: {
    unit_price?: number | null;
    payment_terms?: string | null;
  } | null;
  reasons: string[];
}

/**
 * Vendor Chat Service - All public API methods (no auth)
 */
export const vendorChatService = {
  /**
   * Submit initial vendor quote
   * POST /api/vendor-chat/quote
   */
  submitQuote: async (
    uniqueToken: string,
    contractDetails: ContractDetails
  ): Promise<{
    data: {
      contractId: number;
      dealId: string | null;
      canEdit: boolean;
      chatUrl: string;
      status: string;
    };
  }> => {
    const res = await api.post<{
      message: string;
      data: {
        contractId: number;
        dealId: string | null;
        canEdit: boolean;
        chatUrl: string;
        status: string;
      };
    }>(`${VENDOR_CHAT_BASE}/quote`, {
      uniqueToken,
      contractDetails,
    });
    return { data: res.data.data };
  },

  /**
   * Check if quote can be edited (no messages yet)
   * GET /api/vendor-chat/can-edit-quote?uniqueToken=x
   */
  canEditQuote: async (
    uniqueToken: string
  ): Promise<{
    data: {
      canEdit: boolean;
      reason: string;
    };
  }> => {
    const res = await api.get<{
      message: string;
      data: {
        canEdit: boolean;
        reason: string;
      };
    }>(`${VENDOR_CHAT_BASE}/can-edit-quote`, {
      params: { uniqueToken },
    });
    return { data: res.data.data };
  },

  /**
   * Edit quote (if no messages yet)
   * PUT /api/vendor-chat/quote
   */
  editQuote: async (
    uniqueToken: string,
    contractDetails: ContractDetails
  ): Promise<{
    data: {
      contractId: number;
      status: string;
    };
  }> => {
    const res = await api.put<{
      message: string;
      data: {
        contractId: number;
        status: string;
      };
    }>(`${VENDOR_CHAT_BASE}/quote`, {
      uniqueToken,
      contractDetails,
    });
    return { data: res.data.data };
  },

  /**
   * Get deal data for vendor (strips PM targets)
   * GET /api/vendor-chat/deal?uniqueToken=x
   */
  getDeal: async (uniqueToken: string): Promise<{ data: VendorDealData }> => {
    const res = await api.get<{
      message: string;
      data: VendorDealData;
    }>(`${VENDOR_CHAT_BASE}/deal`, {
      params: { uniqueToken },
    });
    return { data: res.data.data };
  },

  /**
   * Enter chat - creates opening message from quote if needed
   * POST /api/vendor-chat/enter?uniqueToken=x
   */
  enterChat: async (
    uniqueToken: string
  ): Promise<{
    data: {
      deal: VendorDeal;
      openingMessage: VendorChatMessage | null;
    };
  }> => {
    const res = await api.post<{
      message: string;
      data: {
        deal: VendorDeal;
        openingMessage: VendorChatMessage | null;
      };
    }>(`${VENDOR_CHAT_BASE}/enter`, null, {
      params: { uniqueToken },
    });
    return { data: res.data.data };
  },

  /**
   * Send vendor message (instant save - Phase 1)
   * POST /api/vendor-chat/message
   */
  sendMessage: async (
    uniqueToken: string,
    content: string
  ): Promise<{
    data: {
      vendorMessage: VendorChatMessage;
      deal: VendorDeal;
    };
  }> => {
    const res = await api.post<{
      message: string;
      data: {
        vendorMessage: VendorChatMessage;
        deal: VendorDeal;
      };
    }>(`${VENDOR_CHAT_BASE}/message`, {
      uniqueToken,
      content,
    });
    return { data: res.data.data };
  },

  /**
   * Get PM response (async - Phase 2)
   * POST /api/vendor-chat/pm-response
   */
  getPMResponse: async (
    uniqueToken: string,
    vendorMessageId: string
  ): Promise<{
    data: {
      pmMessage: VendorChatMessage;
      decision: PMDecision;
      deal: VendorDeal;
      meso?: MesoResult;
      isFinal?: boolean;
    };
  }> => {
    const res = await api.post<{
      message: string;
      data: {
        pmMessage: VendorChatMessage;
        decision: PMDecision;
        deal: VendorDeal;
        meso?: MesoResult;
        isFinal?: boolean;
      };
    }>(`${VENDOR_CHAT_BASE}/pm-response`, {
      uniqueToken,
      vendorMessageId,
    });
    return { data: res.data.data };
  },

  // ============================================================================
  // MESO + Others Flow Endpoints (February 2026)
  // ============================================================================

  /**
   * Select a MESO option (auto-accepts deal)
   * POST /api/vendor-chat/meso/select
   */
  selectMesoOption: async (
    uniqueToken: string,
    selectedOptionId: string
  ): Promise<{
    data: {
      deal: VendorDeal;
      message: VendorChatMessage;
      selectedOffer: {
        total_price: number | null;
        payment_terms: string | null;
        payment_terms_days?: number | null;
        delivery_days?: number | null;
        warranty_months?: number | null;
      };
    };
  }> => {
    const res = await api.post<{
      message: string;
      data: {
        deal: VendorDeal;
        message: VendorChatMessage;
        selectedOffer: {
          total_price: number | null;
          payment_terms: string | null;
          payment_terms_days?: number | null;
          delivery_days?: number | null;
          warranty_months?: number | null;
        };
      };
    }>(`${VENDOR_CHAT_BASE}/meso/select`, {
      uniqueToken,
      selectedOptionId,
    });
    return { data: res.data.data };
  },

  /**
   * Submit "Others" form with custom price/terms
   * POST /api/vendor-chat/meso/others
   */
  submitOthers: async (
    uniqueToken: string,
    totalPrice: number,
    paymentTermsDays: number
  ): Promise<{
    data: {
      vendorMessage: VendorChatMessage;
      pmMessage: VendorChatMessage;
      decision: PMDecision;
      deal: VendorDeal;
      meso?: MesoResult;
    };
  }> => {
    const res = await api.post<{
      message: string;
      data: {
        vendorMessage: VendorChatMessage;
        pmMessage: VendorChatMessage;
        decision: PMDecision;
        deal: VendorDeal;
        meso?: MesoResult;
      };
    }>(`${VENDOR_CHAT_BASE}/meso/others`, {
      uniqueToken,
      totalPrice,
      paymentTermsDays,
    });
    return { data: res.data.data };
  },

  /**
   * Confirm or deny final offer
   * POST /api/vendor-chat/final-offer/confirm
   */
  confirmFinalOffer: async (
    uniqueToken: string,
    isConfirmedFinal: boolean
  ): Promise<{
    data: {
      pmMessage: VendorChatMessage;
      decision: PMDecision;
      deal: VendorDeal;
      meso?: MesoResult;
    };
  }> => {
    const res = await api.post<{
      message: string;
      data: {
        pmMessage: VendorChatMessage;
        decision: PMDecision;
        deal: VendorDeal;
        meso?: MesoResult;
      };
    }>(`${VENDOR_CHAT_BASE}/final-offer/confirm`, {
      uniqueToken,
      isConfirmedFinal,
    });
    return { data: res.data.data };
  },

  // ============================================================================
  // Structured Prompt Endpoints (April 2026)
  // Feature 1: initial discount ask; Feature 2: payment terms dropdown
  // ============================================================================

  /**
   * Submit initial discount percentage.
   * POST /api/vendor-chat/discount
   * @param percent integer 0..100
   */
  submitDiscount: async (
    uniqueToken: string,
    percent: number
  ): Promise<{
    data: {
      vendorMessage: VendorChatMessage;
      pmMessage: VendorChatMessage;
      decision: PMDecision;
      deal: VendorDeal;
      meso?: MesoResult;
    };
  }> => {
    const res = await api.post<{
      message: string;
      data: {
        vendorMessage: VendorChatMessage;
        pmMessage: VendorChatMessage;
        decision: PMDecision;
        deal: VendorDeal;
        meso?: MesoResult;
      };
    }>(`${VENDOR_CHAT_BASE}/discount`, {
      uniqueToken,
      percent,
    });
    return { data: res.data.data };
  },

  /**
   * Submit payment terms (integer days; 0 = immediate, 1..365 otherwise).
   * POST /api/vendor-chat/payment-terms
   */
  submitPaymentTerms: async (
    uniqueToken: string,
    days: number
  ): Promise<{
    data: {
      vendorMessage: VendorChatMessage;
      pmMessage: VendorChatMessage;
      decision: PMDecision;
      deal: VendorDeal;
      meso?: MesoResult;
    };
  }> => {
    const res = await api.post<{
      message: string;
      data: {
        vendorMessage: VendorChatMessage;
        pmMessage: VendorChatMessage;
        decision: PMDecision;
        deal: VendorDeal;
        meso?: MesoResult;
      };
    }>(`${VENDOR_CHAT_BASE}/payment-terms`, {
      uniqueToken,
      days,
    });
    return { data: res.data.data };
  },
};

export default vendorChatService;
