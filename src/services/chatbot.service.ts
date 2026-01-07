/**
 * Chatbot API Service
 * Handles all API calls to the chatbot backend module
 */

import { authApi } from "../api/index";
import type {
  Deal,
  Message,
  NegotiationConfig,
  Explainability,
  CreateDealInput,
  ListDealsParams,
  GetDealResponse,
  SendMessageResponse,
  ConversationMessageResponse,
  MessageRole,
} from "../types";

const CHATBOT_BASE = "/chatbot";

/**
 * Deal Management APIs
 */
export const chatbotService = {
  /**
   * Create a new negotiation deal
   */
  createDeal: async (data: CreateDealInput): Promise<{ data: Deal }> => {
    const res = await authApi.post<{ data: Deal }>(`${CHATBOT_BASE}/deals`, data);
    return res.data;
  },

  /**
   * List deals with optional filters
   */
  listDeals: async (
    params: ListDealsParams = {}
  ): Promise<{ data: { deals: Deal[]; total: number; page: number; limit: number } }> => {
    const res = await authApi.get<{
      data: { deals: Deal[]; total: number; page: number; limit: number };
    }>(`${CHATBOT_BASE}/deals`, { params });
    return res.data;
  },

  /**
   * Get a deal with messages
   */
  getDeal: async (dealId: string): Promise<{ data: GetDealResponse }> => {
    const res = await authApi.get<{ data: GetDealResponse }>(
      `${CHATBOT_BASE}/deals/${dealId}`
    );
    return res.data;
  },

  /**
   * Get negotiation config for a deal
   */
  getDealConfig: async (dealId: string): Promise<{ data: { config: NegotiationConfig } }> => {
    const res = await authApi.get<{ data: { config: NegotiationConfig } }>(
      `${CHATBOT_BASE}/deals/${dealId}/config`
    );
    return res.data;
  },

  /**
   * Get last explainability for a deal
   */
  getExplainability: async (
    dealId: string
  ): Promise<{ data: { explainability: Explainability } }> => {
    const res = await authApi.get<{ data: { explainability: Explainability } }>(
      `${CHATBOT_BASE}/deals/${dealId}/explainability`
    );
    return res.data;
  },

  /**
   * Process a vendor message (INSIGHTS mode)
   */
  sendMessage: async (
    dealId: string,
    content: string,
    role: MessageRole = "VENDOR"
  ): Promise<{ data: SendMessageResponse }> => {
    const res = await authApi.post<{ data: SendMessageResponse }>(
      `${CHATBOT_BASE}/deals/${dealId}/messages`,
      {
        content,
        role,
      }
    );
    return res.data;
  },

  /**
   * Create a system message
   */
  createSystemMessage: async (
    dealId: string,
    content: string
  ): Promise<{ data: { message: Message } }> => {
    const res = await authApi.post<{ data: { message: Message } }>(
      `${CHATBOT_BASE}/deals/${dealId}/system-message`,
      {
        content,
      }
    );
    return res.data;
  },

  /**
   * Reset a deal (clear messages and state)
   */
  resetDeal: async (dealId: string): Promise<{ data: GetDealResponse }> => {
    const res = await authApi.post<{ data: GetDealResponse }>(
      `${CHATBOT_BASE}/deals/${dealId}/reset`
    );
    return res.data;
  },

  /**
   * Archive a deal
   */
  archiveDeal: async (dealId: string): Promise<{ data: { deal: Deal } }> => {
    const res = await authApi.post<{ data: { deal: Deal } }>(
      `${CHATBOT_BASE}/deals/${dealId}/archive`
    );
    return res.data;
  },

  /**
   * Unarchive a deal
   */
  unarchiveDeal: async (dealId: string): Promise<{ data: { deal: Deal } }> => {
    const res = await authApi.post<{ data: { deal: Deal } }>(
      `${CHATBOT_BASE}/deals/${dealId}/unarchive`
    );
    return res.data;
  },

  /**
   * Soft delete a deal
   */
  softDeleteDeal: async (dealId: string): Promise<{ data: { deal: Deal } }> => {
    const res = await authApi.delete<{ data: { deal: Deal } }>(
      `${CHATBOT_BASE}/deals/${dealId}`
    );
    return res.data;
  },

  /**
   * Restore a soft-deleted deal
   */
  restoreDeal: async (dealId: string): Promise<{ data: { deal: Deal } }> => {
    const res = await authApi.post<{ data: { deal: Deal } }>(
      `${CHATBOT_BASE}/deals/${dealId}/restore`
    );
    return res.data;
  },

  /**
   * Permanently delete a deal
   */
  permanentlyDeleteDeal: async (
    dealId: string
  ): Promise<{ data: { success: boolean; message: string } }> => {
    const res = await authApi.delete<{ data: { success: boolean; message: string } }>(
      `${CHATBOT_BASE}/deals/${dealId}/permanent`
    );
    return res.data;
  },

  /**
   * ==================== CONVERSATION MODE APIs ====================
   */

  /**
   * Start a conversation (auto-sends greeting)
   * CONVERSATION mode only
   */
  startConversation: async (
    dealId: string
  ): Promise<{ data: ConversationMessageResponse }> => {
    const res = await authApi.post<{ data: ConversationMessageResponse }>(
      `${CHATBOT_BASE}/conversation/deals/${dealId}/start`
    );
    return res.data;
  },

  /**
   * Send a message in conversation mode
   */
  sendConversationMessage: async (
    dealId: string,
    content: string
  ): Promise<{ data: ConversationMessageResponse }> => {
    const res = await authApi.post<{ data: ConversationMessageResponse }>(
      `${CHATBOT_BASE}/conversation/deals/${dealId}/messages`,
      {
        content,
      }
    );
    return res.data;
  },

  /**
   * Get last explainability for conversation mode
   */
  getConversationExplainability: async (
    dealId: string
  ): Promise<{ data: { explainability: Explainability } }> => {
    const res = await authApi.get<{ data: { explainability: Explainability } }>(
      `${CHATBOT_BASE}/conversation/deals/${dealId}/explainability`
    );
    return res.data;
  },

  /**
   * Track deal access (updates view count and last accessed)
   */
  trackDealAccess: async (
    dealId: string
  ): Promise<{ data: { success: boolean } }> => {
    const res = await authApi.post<{ data: { success: boolean } }>(
      `${CHATBOT_BASE}/deals/${dealId}/track-access`
    );
    return res.data;
  },

  /**
   * ==================== DEMO MODE APIs ====================
   */

  /**
   * Generate next vendor message (autopilot)
   * POST /api/chatbot/vendor/deals/:dealId/vendor/next
   */
  generateVendorMessage: async (
    dealId: string,
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
    }>(`${CHATBOT_BASE}/vendor/deals/${dealId}/vendor/next`, {
      scenario,
    });
    return res.data;
  },

  /**
   * Run full demo negotiation with autopilot vendor
   * POST /api/chatbot/deals/:dealId/run-demo
   */
  runDemo: async (
    dealId: string,
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
    const res = await authApi.post<{
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
    }>(`${CHATBOT_BASE}/deals/${dealId}/run-demo`, {
      scenario,
      maxRounds,
    });
    return res.data;
  },

  /**
   * Resume an escalated deal
   * POST /api/chatbot/deals/:dealId/resume
   */
  resumeDeal: async (dealId: string): Promise<{ data: Deal }> => {
    const res = await authApi.post<{ data: Deal }>(
      `${CHATBOT_BASE}/deals/${dealId}/resume`
    );
    return res.data;
  },

  /**
   * Get AI-generated scenario suggestions for a deal
   * POST /api/chatbot/deals/:dealId/suggest-counters
   *
   * Uses AI to analyze the conversation and generate contextually relevant
   * counter-offer suggestions for each scenario type (HARD, MEDIUM, SOFT, WALK_AWAY).
   *
   * @param dealId - Deal UUID
   * @returns Scenario suggestions object with arrays of 4 suggestions per scenario
   */
  getSuggestedCounters: async (
    dealId: string
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
    }>(`${CHATBOT_BASE}/deals/${dealId}/suggest-counters`);
    return res.data;
  },

  /**
   * ==================== TEMPLATE MANAGEMENT APIs ====================
   */

  /**
   * Create a new negotiation template
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
   */
  getTemplate: async (
    id: string,
    includeParameters = false
  ): Promise<{ data: { template: NegotiationConfig } }> => {
    const res = await authApi.get<{ data: { template: NegotiationConfig } }>(
      `${CHATBOT_BASE}/templates/${id}`,
      {
        params: { includeParameters },
      }
    );
    return res.data;
  },

  /**
   * Get the default template
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
   * Update a template by ID
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
   */
  permanentlyDeleteTemplate: async (
    id: string
  ): Promise<{ data: { success: boolean; message: string } }> => {
    const res = await authApi.delete<{ data: { success: boolean; message: string } }>(
      `${CHATBOT_BASE}/templates/${id}/permanent`
    );
    return res.data;
  },
};

export default chatbotService;
