/**
 * Chatbot API Service
 * Handles all API calls to the chatbot backend module
 *
 * API Structure (January 2026 Refactor):
 * All deal-related operations use nested URLs:
 * /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/...
 *
 * This enforces proper hierarchy and validates context at each level.
 */

import { authApi } from "../api/index";
import type {
  Deal,
  Message,
  NegotiationConfig,
  ExtendedNegotiationConfig,
  Explainability,
  ListDealsParams,
  GetDealResponse,
  SendMessageResponse,
  ConversationMessageResponse,
  MessageRole,
  CreateDealWithConfigInput,
  RequisitionSummary,
  VendorSummary,
  DeliveryAddress,
  SmartDefaults,
  DealDraft,
  DealWizardFormData,
  RequisitionsQueryParams,
  RequisitionsListResponse,
  RequisitionDealsQueryParams,
  RequisitionDealsResponse,
  DealSummaryResponse,
  DealMode,
  DealContext,
  QualityCertification,
} from "../types";

// Re-export DealContext for convenience
export type { DealContext } from "../types";

const CHATBOT_BASE = "/chatbot";

/**
 * Helper to build nested deal URL
 */
const buildDealUrl = (rfqId: number, vendorId: number, dealId?: string, suffix?: string): string => {
  const base = `${CHATBOT_BASE}/requisitions/${rfqId}/vendors/${vendorId}/deals`;
  if (dealId) {
    return suffix ? `${base}/${dealId}/${suffix}` : `${base}/${dealId}`;
  }
  return base;
};

/**
 * Helper to build nested draft URL
 */
const buildDraftUrl = (rfqId: number, vendorId: number, draftId?: string): string => {
  const base = `${CHATBOT_BASE}/requisitions/${rfqId}/vendors/${vendorId}/drafts`;
  return draftId ? `${base}/${draftId}` : base;
};

/**
 * Chatbot Service - All API methods
 */
export const chatbotService = {
  // ==================== REQUISITION VIEWS ====================

  /**
   * Get all requisitions with their deal summaries
   * Used for the main requisition list page
   * GET /api/chatbot/requisitions
   * Params: projectId, status, archived, dateFrom, dateTo, sortBy, sortOrder, page, limit
   */
  getRequisitionsWithDeals: async (
    params: RequisitionsQueryParams = {}
  ): Promise<{ data: RequisitionsListResponse }> => {
    const res = await authApi.get<{ data: RequisitionsListResponse }>(
      `${CHATBOT_BASE}/requisitions`,
      { params }
    );
    return res.data;
  },

  /**
   * Get requisitions available for negotiation (from requisition module)
   * GET /api/chatbot/requisitions/for-negotiation
   *
   * Backend returns: { message: string, data: { requisitions: [...], total: number } }
   * We extract just the requisitions array for simpler frontend usage
   */
  getRequisitionsForNegotiation: async (): Promise<{ data: RequisitionSummary[] }> => {
    const res = await authApi.get<{
      data: { requisitions: RequisitionSummary[]; total: number }
    }>(
      `${CHATBOT_BASE}/requisitions/for-negotiation`
    );
    // Extract the requisitions array from the nested response
    return { data: res.data.data?.requisitions || [] };
  },

  /**
   * Get all deals for a specific requisition (cross-vendor view)
   * GET /api/chatbot/requisitions/:rfqId/deals
   * Params: status, archived, sortBy, sortOrder
   */
  getRequisitionDeals: async (
    rfqId: number,
    params: RequisitionDealsQueryParams = {}
  ): Promise<{ data: RequisitionDealsResponse }> => {
    const res = await authApi.get<{ data: RequisitionDealsResponse }>(
      `${CHATBOT_BASE}/requisitions/${rfqId}/deals`,
      { params }
    );
    return res.data;
  },

  /**
   * Get vendors attached to a specific requisition
   * GET /api/chatbot/requisitions/:rfqId/vendors
   *
   * Backend returns: { message: string, data: VendorSummary[] }
   * We extract just the vendors array for simpler frontend usage
   */
  getRequisitionVendors: async (
    rfqId: number
  ): Promise<{ data: VendorSummary[] }> => {
    const res = await authApi.get<{ message: string; data: VendorSummary[] }>(
      `${CHATBOT_BASE}/requisitions/${rfqId}/vendors`
    );
    // Extract the vendors array from the response
    return { data: res.data.data || [] };
  },

  /**
   * Archive a requisition (cascades to all deals)
   * POST /api/chatbot/requisitions/:rfqId/archive
   */
  archiveRequisition: async (
    rfqId: number
  ): Promise<{ data: { requisition: any; archivedDealsCount: number } }> => {
    const res = await authApi.post<{ data: { requisition: any; archivedDealsCount: number } }>(
      `${CHATBOT_BASE}/requisitions/${rfqId}/archive`
    );
    return res.data;
  },

  /**
   * Unarchive a requisition
   * POST /api/chatbot/requisitions/:rfqId/unarchive
   */
  unarchiveRequisition: async (
    rfqId: number,
    unarchiveDeals: boolean = true
  ): Promise<{ data: { requisition: any; unarchivedDealsCount: number } }> => {
    const res = await authApi.post<{ data: { requisition: any; unarchivedDealsCount: number } }>(
      `${CHATBOT_BASE}/requisitions/${rfqId}/unarchive`,
      { unarchiveDeals }
    );
    return res.data;
  },

  // ==================== SMART DEFAULTS & DRAFTS ====================

  /**
   * Get smart defaults based on vendor and RFQ history
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/smart-defaults
   */
  getSmartDefaults: async (
    rfqId: number,
    vendorId: number
  ): Promise<{ data: SmartDefaults }> => {
    const res = await authApi.get<{ data: SmartDefaults }>(
      `${CHATBOT_BASE}/requisitions/${rfqId}/vendors/${vendorId}/smart-defaults`
    );
    return res.data;
  },

  /**
   * Save a deal draft
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/drafts
   */
  saveDraft: async (
    rfqId: number,
    vendorId: number,
    draftData: Partial<DealWizardFormData>,
    title?: string
  ): Promise<{ data: DealDraft }> => {
    const res = await authApi.post<{ data: DealDraft }>(
      buildDraftUrl(rfqId, vendorId),
      { draftData, title }
    );
    return res.data;
  },

  /**
   * Get user's deal drafts for a specific RFQ+Vendor
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/drafts
   */
  getDrafts: async (
    rfqId: number,
    vendorId: number
  ): Promise<{ data: DealDraft[] }> => {
    const res = await authApi.get<{ data: DealDraft[] }>(
      buildDraftUrl(rfqId, vendorId)
    );
    return res.data;
  },

  /**
   * Get a specific draft
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/drafts/:draftId
   */
  getDraft: async (
    rfqId: number,
    vendorId: number,
    draftId: string
  ): Promise<{ data: DealDraft }> => {
    const res = await authApi.get<{ data: DealDraft }>(
      buildDraftUrl(rfqId, vendorId, draftId)
    );
    return res.data;
  },

  /**
   * Delete a draft
   * DELETE /api/chatbot/requisitions/:rfqId/vendors/:vendorId/drafts/:draftId
   */
  deleteDraft: async (
    rfqId: number,
    vendorId: number,
    draftId: string
  ): Promise<{ data: { success: boolean } }> => {
    const res = await authApi.delete<{ data: { success: boolean } }>(
      buildDraftUrl(rfqId, vendorId, draftId)
    );
    return res.data;
  },

  // ==================== DEAL MANAGEMENT (NESTED) ====================

  /**
   * List deals for a specific RFQ+Vendor combination
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals
   */
  listDeals: async (
    rfqId: number,
    vendorId: number,
    params: ListDealsParams = {}
  ): Promise<{ data: { deals: Deal[]; total: number; page: number; limit: number } }> => {
    const res = await authApi.get<{
      data: { deals: Deal[]; total: number; page: number; limit: number };
    }>(buildDealUrl(rfqId, vendorId), { params });
    return res.data;
  },

  /**
   * Create a new deal with full wizard configuration
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals
   */
  createDealWithConfig: async (
    rfqId: number,
    vendorId: number,
    data: Omit<CreateDealWithConfigInput, 'requisitionId' | 'vendorId'>
  ): Promise<{ data: Deal }> => {
    const res = await authApi.post<{ data: Deal }>(
      buildDealUrl(rfqId, vendorId),
      { ...data, requisitionId: rfqId, vendorId }
    );
    return res.data;
  },

  /**
   * Get a deal with messages
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId
   */
  getDeal: async (ctx: DealContext): Promise<{ data: GetDealResponse }> => {
    const res = await authApi.get<{ data: GetDealResponse }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId)
    );
    return res.data;
  },

  /**
   * Get negotiation config for a deal
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/config
   */
  getDealConfig: async (ctx: DealContext): Promise<{ data: { config: ExtendedNegotiationConfig } }> => {
    const res = await authApi.get<{ data: { config: ExtendedNegotiationConfig } }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'config')
    );
    return res.data;
  },

  /**
   * Get weighted utility calculation for a deal
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/utility
   */
  getDealUtility: async (
    ctx: DealContext
  ): Promise<{
    data: {
      totalUtility: number;
      totalUtilityPercent: number;
      parameterUtilities: Record<
        string,
        {
          parameterId: string;
          parameterName: string;
          utility: number;
          weight: number;
          contribution: number;
          currentValue: number | string | boolean | null;
          targetValue: number | string | boolean | null;
          maxValue?: number | string | null;
          status: "excellent" | "good" | "warning" | "critical";
          color: string;
        }
      >;
      thresholds: {
        accept: number;
        escalate: number;
        walkAway: number;
      };
      recommendation: "ACCEPT" | "COUNTER" | "ESCALATE" | "WALK_AWAY";
      recommendationReason: string;
    };
  }> => {
    const res = await authApi.get(buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'utility'));
    return res.data;
  },

  /**
   * Get deal summary for modal display
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/summary
   */
  getDealSummary: async (ctx: DealContext): Promise<{ data: DealSummaryResponse }> => {
    const res = await authApi.get<{ data: DealSummaryResponse }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'summary')
    );
    return res.data;
  },

  /**
   * Export deal summary as PDF (direct download)
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/export-pdf
   *
   * Returns the PDF as a binary blob for client-side download
   */
  exportDealPDF: async (
    ctx: DealContext
  ): Promise<{ data: Blob; headers: Record<string, string> }> => {
    const res = await authApi.post(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'export-pdf'),
      {},
      {
        responseType: 'blob',
      }
    );
    return {
      data: res.data,
      headers: res.headers as Record<string, string>,
    };
  },

  /**
   * Email deal summary PDF to a recipient
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/email-pdf
   *
   * Generates PDF server-side and sends to specified email address
   */
  emailDealPDF: async (
    ctx: DealContext,
    email: string
  ): Promise<{ data: { message: string; email: string; sentAt: string } }> => {
    const res = await authApi.post<{ data: { message: string; email: string; sentAt: string } }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'email-pdf'),
      { email }
    );
    return res.data;
  },

  /**
   * Get last explainability for a deal
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/explainability
   */
  getExplainability: async (
    ctx: DealContext
  ): Promise<{ data: { explainability: Explainability } }> => {
    const res = await authApi.get<{ data: { explainability: Explainability } }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'explainability')
    );
    return res.data;
  },

  // ==================== MESSAGING (MERGED INSIGHTS + CONVERSATION) ====================

  /**
   * Send a message (unified endpoint for both INSIGHTS and CONVERSATION modes)
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/messages
   * Query: ?mode=INSIGHTS or ?mode=CONVERSATION
   *
   * - mode=INSIGHTS: Deterministic decision engine (processVendorMessage)
   * - mode=CONVERSATION: LLM-driven conversational (sendConversationMessage)
   */
  sendMessage: async (
    ctx: DealContext,
    content: string,
    role: MessageRole = "VENDOR",
    mode: DealMode = "INSIGHTS"
  ): Promise<SendMessageResponse> => {
    const res = await authApi.post<{ message: string; data: SendMessageResponse }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'messages'),
      { content, role },
      { params: { mode } }
    );
    // DEBUG: Log the full response structure
    console.log('[DEBUG chatbot.service] sendMessage raw res.data:', JSON.stringify(res.data, null, 2));
    console.log('[DEBUG chatbot.service] sendMessage res.data.data:', res.data.data);
    console.log('[DEBUG chatbot.service] sendMessage res.data.data?.messages:', res.data.data?.messages);
    // Extract inner data to return clean SendMessageResponse
    // Backend wraps response in { message: string, data: SendMessageResponse }
    return res.data.data;
  },

  /**
   * Start a conversation (CONVERSATION mode only)
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/start
   */
  startConversation: async (
    ctx: DealContext
  ): Promise<{ data: ConversationMessageResponse }> => {
    const res = await authApi.post<{ data: ConversationMessageResponse }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'start')
    );
    return res.data;
  },

  /**
   * Get AI-generated counter suggestions
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/suggestions
   */
  getSuggestedCounters: async (
    ctx: DealContext
  ): Promise<{
    data: {
      HARD: string[];
      MEDIUM: string[];
      SOFT: string[];
      WALK_AWAY: string[];
    };
  }> => {
    const res = await authApi.post<{
      data: {
        HARD: string[];
        MEDIUM: string[];
        SOFT: string[];
        WALK_AWAY: string[];
      };
    }>(buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'suggestions'));
    return res.data;
  },

  // ==================== DEAL LIFECYCLE ====================

  /**
   * Reset a deal (clear messages and state)
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/reset
   */
  resetDeal: async (ctx: DealContext): Promise<{ data: GetDealResponse }> => {
    const res = await authApi.post<{ data: GetDealResponse }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'reset')
    );
    return res.data;
  },

  /**
   * Archive a deal
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/archive
   */
  archiveDeal: async (ctx: DealContext): Promise<{ data: { deal: Deal } }> => {
    const res = await authApi.post<{ data: { deal: Deal } }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'archive')
    );
    return res.data;
  },

  /**
   * Unarchive a deal
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/unarchive
   */
  unarchiveDeal: async (ctx: DealContext): Promise<{ data: { deal: Deal } }> => {
    const res = await authApi.post<{ data: { deal: Deal } }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'unarchive')
    );
    return res.data;
  },

  /**
   * Retry sending deal notification email to vendor
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/retry-email
   */
  retryDealEmail: async (
    ctx: DealContext
  ): Promise<{ data: { success: boolean; messageId?: string; error?: string } }> => {
    const res = await authApi.post<{ data: { success: boolean; messageId?: string; error?: string } }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'retry-email')
    );
    return res.data;
  },

  // ==================== VENDOR SIMULATION & DEMO ====================

  /**
   * Generate simulated vendor message (autopilot)
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/simulate
   */
  generateVendorMessage: async (
    ctx: DealContext,
    scenario: "HARD" | "SOFT" | "WALK_AWAY"
  ): Promise<{
    data: {
      vendorMessage: Message;
      accordoMessage: Message;
      deal: Deal;
      completed: boolean;
    };
  }> => {
    const res = await authApi.post<{
      data: {
        vendorMessage: Message;
        accordoMessage: Message;
        deal: Deal;
        completed: boolean;
      };
    }>(buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'simulate'), {
      scenario,
    });
    return res.data;
  },

  /**
   * Run full demo negotiation with autopilot vendor
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/demo
   */
  runDemo: async (
    ctx: DealContext,
    scenario: "HARD" | "SOFT" | "WALK_AWAY",
    maxRounds = 10
  ): Promise<{
    data: {
      deal: Deal;
      messages: Message[];
      steps: Array<{
        vendorMessage: Message;
        accordoMessage: Message;
        round: number;
      }>;
      finalStatus: string;
      totalRounds: number;
      finalUtility: number | null;
    };
  }> => {
    const res = await authApi.post(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'demo'),
      { scenario, maxRounds }
    );
    return res.data;
  },

  /**
   * Resume an escalated deal
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/resume
   */
  resumeDeal: async (ctx: DealContext): Promise<{ data: Deal }> => {
    const res = await authApi.post<{ data: Deal }>(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'resume')
    );
    return res.data;
  },

  // ==================== VENDOR NEGOTIATION (AI-PM MODE) ====================
  // These endpoints support the vendor-perspective negotiation flow where:
  // - Vendor is the active user who sends offers
  // - AI simulates the Procurement Manager (PM) and responds automatically
  // - Scenario chips are generated based on vendor's profit goals

  /**
   * Start negotiation - generates AI-PM's opening offer
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/start-negotiation
   *
   * Called when vendor opens the deal for the first time.
   * AI-PM generates opening offer based on wizard config values.
   */
  startNegotiation: async (
    ctx: DealContext
  ): Promise<{
    data: {
      deal: Deal;
      messages: Message[];
      pmOpeningMessage: Message;
    };
  }> => {
    const res = await authApi.post(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'start-negotiation')
    );
    return res.data;
  },

  /**
   * Get vendor scenarios - scenario chips for vendor based on current state
   * GET /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/vendor-scenarios
   *
   * Returns HARD/MEDIUM/SOFT scenario chips calculated from:
   * - PM's last offer
   * - Product category margins
   * - Vendor's profit goals
   */
  getVendorScenarios: async (
    ctx: DealContext
  ): Promise<{
    data: {
      scenarios: Array<{
        type: 'HARD' | 'MEDIUM' | 'SOFT';
        label: string;
        message: string;
        offer: {
          price: number;
          paymentTerms: string;
          deliveryDate: string;
        };
        estimatedProfit: number;
      }>;
      pmLastOffer: {
        price: number;
        paymentTerms: string;
        deliveryDate: string;
      } | null;
      productCategory: string;
    };
  }> => {
    const res = await authApi.get(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'vendor-scenarios')
    );
    return res.data;
  },

  /**
   * Vendor sends message - vendor sends offer, AI-PM responds immediately
   * POST /api/chatbot/requisitions/:rfqId/vendors/:vendorId/deals/:dealId/vendor-message
   *
   * Flow:
   * 1. Vendor sends message
   * 2. System parses vendor's offer
   * 3. AI-PM evaluates against PM's config
   * 4. AI-PM generates response (ACCEPT/COUNTER/ESCALATE/WALK_AWAY)
   * 5. Both messages returned to frontend
   */
  sendVendorMessage: async (
    ctx: DealContext,
    content: string
  ): Promise<{
    data: {
      deal: Deal;
      messages: Message[];
      vendorMessage: Message;
      pmResponse: Message;
      pmDecision: {
        action: 'ACCEPT' | 'COUNTER' | 'ESCALATE' | 'WALK_AWAY';
        utilityScore: number;
        counterOffer?: {
          price: number;
          paymentTerms: string;
          deliveryDate: string;
        };
        reasoning: string;
      };
    };
  }> => {
    const res = await authApi.post(
      buildDealUrl(ctx.rfqId, ctx.vendorId, ctx.dealId, 'vendor-message'),
      { content }
    );
    return res.data;
  },

  // ==================== VENDOR ADDRESSES ====================

  /**
   * Get delivery addresses for a specific vendor
   * GET /api/chatbot/vendors/:vendorId/addresses
   */
  getVendorAddresses: async (
    vendorId: number
  ): Promise<{ data: DeliveryAddress[] }> => {
    const res = await authApi.get<{ data: DeliveryAddress[] }>(
      `${CHATBOT_BASE}/vendors/${vendorId}/addresses`
    );
    return res.data;
  },

  /**
   * Get delivery addresses for the company
   * GET /company/addresses
   */
  getDeliveryAddresses: async (): Promise<{ data: DeliveryAddress[] }> => {
    const res = await authApi.get<{ data: DeliveryAddress[] }>(
      `/company/addresses`
    );
    return res.data;
  },

  /**
   * Create a new delivery address
   * POST /company/addresses
   */
  createDeliveryAddress: async (data: Omit<DeliveryAddress, 'id'>): Promise<{ data: DeliveryAddress }> => {
    const res = await authApi.post<{ data: DeliveryAddress }>(
      `/company/addresses`,
      data
    );
    return res.data;
  },

  // ==================== TEMPLATE MANAGEMENT ====================

  /**
   * Get default template
   * GET /api/chatbot/templates/default
   */
  getDefaultTemplate: async (): Promise<{
    data: { template: NegotiationConfig | null };
  }> => {
    const res = await authApi.get<{ data: { template: NegotiationConfig | null } }>(
      `${CHATBOT_BASE}/templates/default`
    );
    return res.data;
  },

  /**
   * Create a new negotiation template
   * POST /api/chatbot/templates
   */
  createTemplate: async (data: {
    name: string;
    description?: string;
    configJson?: object;
    isActive?: boolean;
  }): Promise<{ data: { template: NegotiationConfig } }> => {
    const res = await authApi.post<{ data: { template: NegotiationConfig } }>(
      `${CHATBOT_BASE}/templates`,
      data
    );
    return res.data;
  },

  /**
   * List all templates
   * GET /api/chatbot/templates
   */
  listTemplates: async (params?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: {
      templates: NegotiationConfig[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    const res = await authApi.get<{
      data: {
        templates: NegotiationConfig[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`${CHATBOT_BASE}/templates`, { params });
    return res.data;
  },

  /**
   * Get a template by ID
   * GET /api/chatbot/templates/:id
   */
  getTemplate: async (
    id: string,
    includeParameters = false
  ): Promise<{ data: { template: NegotiationConfig } }> => {
    const res = await authApi.get<{ data: { template: NegotiationConfig } }>(
      `${CHATBOT_BASE}/templates/${id}`,
      { params: { includeParameters } }
    );
    return res.data;
  },

  /**
   * Update a template by ID
   * PUT /api/chatbot/templates/:id
   */
  updateTemplate: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      configJson?: object;
      isActive?: boolean;
    }
  ): Promise<{ data: { template: NegotiationConfig } }> => {
    const res = await authApi.put<{ data: { template: NegotiationConfig } }>(
      `${CHATBOT_BASE}/templates/${id}`,
      data
    );
    return res.data;
  },

  /**
   * Set a template as default
   * POST /api/chatbot/templates/:id/set-default
   */
  setDefaultTemplate: async (
    id: string,
    deactivateOthers = false
  ): Promise<{ data: { template: NegotiationConfig } }> => {
    const res = await authApi.post<{ data: { template: NegotiationConfig } }>(
      `${CHATBOT_BASE}/templates/${id}/set-default`,
      { deactivateOthers }
    );
    return res.data;
  },

  /**
   * Delete a template (soft delete)
   * DELETE /api/chatbot/templates/:id
   */
  deleteTemplate: async (
    id: string
  ): Promise<{ data: { success: boolean; message: string } }> => {
    const res = await authApi.delete<{ data: { success: boolean; message: string } }>(
      `${CHATBOT_BASE}/templates/${id}`
    );
    return res.data;
  },

  /**
   * Permanently delete a template
   * DELETE /api/chatbot/templates/:id/permanent
   */
  permanentlyDeleteTemplate: async (
    id: string
  ): Promise<{ data: { success: boolean; message: string } }> => {
    const res = await authApi.delete<{ data: { success: boolean; message: string } }>(
      `${CHATBOT_BASE}/templates/${id}/permanent`
    );
    return res.data;
  },

  // ==================== DEAL LOOKUP (FLAT ACCESS) ====================

  /**
   * Look up a deal by ID only (no nested path required)
   * GET /api/chatbot/deals/:dealId/lookup
   *
   * This convenience endpoint allows fetching a deal when only dealId is available
   * (e.g., from URL params). Returns deal with context for subsequent nested calls.
   */
  lookupDeal: async (
    dealId: string
  ): Promise<{
    data: {
      deal: Deal;
      messages: Message[];
      context: DealContext;
    };
  }> => {
    const res = await authApi.get<{
      data: {
        deal: Deal;
        messages: Message[];
        context: DealContext;
      };
    }>(`${CHATBOT_BASE}/deals/${dealId}/lookup`);
    return res.data;
  },

  // ==================== CONVENIENCE HELPERS ====================

  /**
   * Build DealContext from a Deal object
   * Useful when you have a deal and need to make subsequent API calls
   */
  contextFromDeal: (deal: Deal): DealContext | null => {
    if (deal.requisitionId && deal.vendorId) {
      return {
        rfqId: deal.requisitionId,
        vendorId: deal.vendorId,
        dealId: deal.id,
      };
    }
    return null;
  },

  // ==================== QUALITY CERTIFICATIONS ====================

  /**
   * Get all quality certifications
   * Returns hardcoded list of common certifications (no backend endpoint needed)
   */
  getQualityCertifications: async (): Promise<{ data: QualityCertification[] }> => {
    // Return hardcoded list of common certifications
    // This can be converted to an API call if certifications need to be dynamic
    return {
      data: [
        { id: 'ISO_9001', name: 'ISO 9001:2015', category: 'Quality Management' },
        { id: 'ISO_14001', name: 'ISO 14001:2015', category: 'Environmental' },
        { id: 'ISO_27001', name: 'ISO 27001:2022', category: 'Information Security' },
        { id: 'CE', name: 'CE Marking', category: 'European Conformity' },
        { id: 'FDA', name: 'FDA Registered', category: 'Food & Drug' },
        { id: 'UL', name: 'UL Listed', category: 'Safety' },
        { id: 'RoHS', name: 'RoHS Compliant', category: 'Hazardous Substances' },
      ],
    };
  },

  // ==================== LEGACY COMPATIBILITY (DEPRECATED) ====================
  // These methods maintain backward compatibility but will be removed in future

  /**
   * @deprecated Use getRequisitionsForNegotiation() instead
   */
  getRequisitions: async (): Promise<{ data: RequisitionSummary[] }> => {
    console.warn('chatbotService.getRequisitions() is deprecated. Use getRequisitionsForNegotiation() instead.');
    return chatbotService.getRequisitionsForNegotiation();
  },
};

export default chatbotService;
