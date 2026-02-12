import { authApi } from "../api";

/**
 * Chat API Service
 * Handles all chat-related API calls for the negotiation chat
 */

// ============================================================================
// Types
// ============================================================================

interface ChatSession {
    id: string;
    negotiationId?: string;
    requisitionId?: number;
    createdAt: string;
    updatedAt: string;
    history?: ChatMessage[];
}

interface ChatMessage {
    id: string;
    sessionId: string;
    message: string;
    role: 'user' | 'assistant' | 'system';
    createdAt: string;
}

interface SendMessagePayload {
    message: string;
    negotiationId: string | null;
    requisitionId: number | null;
}

interface CreateSessionPayload {
    negotiationId: string | null;
    requisitionId: number | null;
}

interface ChatApiResponse<T> {
    data?: T;
}

// ============================================================================
// API Service
// ============================================================================

export const chatApi = {
    /**
     * Get all chat sessions for a negotiation
     * @param negotiationId - The negotiation ID to filter by
     * @returns List of chat sessions
     */
    getSessions: async (negotiationId: string | null = null): Promise<ChatSession[]> => {
        try {
            const params = negotiationId ? { negotiationId } : {};
            const response = await authApi.get<ChatApiResponse<ChatSession[]>>("/chat/sessions", { params });
            return response.data.data || (response.data as unknown as ChatSession[]) || [];
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get a specific chat session by ID
     * @param sessionId - The session ID
     * @returns Session details with history
     */
    getSession: async (sessionId: string): Promise<ChatSession> => {
        try {
            const response = await authApi.get<ChatApiResponse<ChatSession>>(`/chat/sessions/${sessionId}`);
            return response.data.data || (response.data as unknown as ChatSession);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Send a message in the chat
     * @param message - The message content
     * @param negotiationId - The negotiation ID
     * @param requisitionId - The requisition ID
     * @returns Response with message and sessionId
     */
    sendMessage: async (
        message: string,
        negotiationId: string | null = null,
        requisitionId: number | null = null
    ): Promise<ChatMessage> => {
        try {
            const payload: SendMessagePayload = {
                message,
                negotiationId,
                requisitionId,
            };
            const response = await authApi.post<ChatApiResponse<ChatMessage>>("/chat/message", payload);
            return response.data.data || (response.data as unknown as ChatMessage);
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a new chat session
     * @param negotiationId - The negotiation ID
     * @param requisitionId - The requisition ID
     * @returns New session details
     */
    createSession: async (
        negotiationId: string | null = null,
        requisitionId: number | null = null
    ): Promise<ChatSession> => {
        try {
            const payload: CreateSessionPayload = {
                negotiationId,
                requisitionId,
            };
            const response = await authApi.post<ChatApiResponse<ChatSession>>("/chat/sessions", payload);
            return response.data.data || (response.data as unknown as ChatSession);
        } catch (error) {
            throw error;
        }
    },

    /**
     * End a chat session
     * @param sessionId - The session ID to end
     * @returns Response confirming session end
     */
    endSession: async (sessionId: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await authApi.put<ChatApiResponse<{ success: boolean; message?: string }>>(
                `/chat/sessions/${sessionId}/end`
            );
            return response.data.data || (response.data as unknown as { success: boolean; message?: string });
        } catch (error) {
            throw error;
        }
    },
};

export default chatApi;

