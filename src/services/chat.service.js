import { authApi } from "../api";

/**
 * Chat API Service
 * Handles all chat-related API calls for the negotiation chat
 */
export const chatApi = {
    /**
     * Get all chat sessions for a negotiation
     * @param {string|null} negotiationId - The negotiation ID to filter by
     * @returns {Promise<Array>} - List of chat sessions
     */
    getSessions: async (negotiationId = null) => {
        try {
            const params = negotiationId ? { negotiationId } : {};
            const response = await authApi.get("/chat/sessions", { params });
            return response.data.data || response.data || [];
        } catch (error) {
            console.error("Error fetching chat sessions:", error);
            throw error;
        }
    },

    /**
     * Get a specific chat session by ID
     * @param {string} sessionId - The session ID
     * @returns {Promise<Object>} - Session details with history
     */
    getSession: async (sessionId) => {
        try {
            const response = await authApi.get(`/chat/sessions/${sessionId}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error fetching chat session:", error);
            throw error;
        }
    },

    /**
     * Send a message in the chat
     * @param {string} message - The message content
     * @param {string|null} negotiationId - The negotiation ID
     * @param {number|null} requisitionId - The requisition ID
     * @returns {Promise<Object>} - Response with message and sessionId
     */
    sendMessage: async (message, negotiationId = null, requisitionId = null) => {
        try {
            const payload = {
                message,
                negotiationId,
                requisitionId,
            };
            const response = await authApi.post("/chat/message", payload);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error sending chat message:", error);
            throw error;
        }
    },

    /**
     * Create a new chat session
     * @param {string|null} negotiationId - The negotiation ID
     * @param {number|null} requisitionId - The requisition ID
     * @returns {Promise<Object>} - New session details
     */
    createSession: async (negotiationId = null, requisitionId = null) => {
        try {
            const payload = {
                negotiationId,
                requisitionId,
            };
            const response = await authApi.post("/chat/sessions", payload);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error creating chat session:", error);
            throw error;
        }
    },

    /**
     * End a chat session
     * @param {string} sessionId - The session ID to end
     * @returns {Promise<Object>} - Response confirming session end
     */
    endSession: async (sessionId) => {
        try {
            const response = await authApi.put(`/chat/sessions/${sessionId}/end`);
            return response.data.data || response.data;
        } catch (error) {
            console.error("Error ending chat session:", error);
            throw error;
        }
    },
};

export default chatApi;

