import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import sideBarLogo from "../../assets/sideBarLogo.png";
import { chatApi } from "../../services/chat.service";
import { FiSend, FiX } from "react-icons/fi";

interface ChatMessage {
  id: number;
  role: "user" | "bot";
  message: string;
  isTyping?: boolean;
}

// Custom styles for enhanced UI
const customStyles = `
    .hide-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    
    .hide-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .hide-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        border-radius: 3px;
    }
    
    .hide-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #2563eb, #4f46e5);
    }
`;

const Chat = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [inputMessage, setInputMessage] = useState("");
    const [negotiationId, setNegotiationId] = useState<string | null>(null);
    const [requisitionId, setRequisitionId] = useState<number | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Get negotiationId and requisitionId from URL params or state
    useEffect(() => {
        const urlNegotiationId = searchParams.get("negotiationId");
        const urlRequisitionId = searchParams.get("requisitionId");
        
        if (urlNegotiationId) {
            setNegotiationId(urlNegotiationId);
        } else if (state?.negotiationId) {
            setNegotiationId(state.negotiationId);
        }
        
        if (urlRequisitionId) {
            setRequisitionId(parseInt(urlRequisitionId));
        } else if (state?.requisitionId) {
            setRequisitionId(state.requisitionId);
        }
    }, [searchParams, state]);

    // Load chat history from database
    useEffect(() => {
        const loadChatHistory = async () => {
            setIsLoadingHistory(true);
            try {
                // Try to get existing session
                const sessions = await chatApi.getSessions(negotiationId || undefined);
                if (sessions && sessions.length > 0) {
                    // Use the most recent session
                    const session = sessions[0];

                    // Load full session details with history
                    const sessionDetails = await chatApi.getSession(session.id);
                    if (sessionDetails.history && sessionDetails.history.length > 0) {
                        // Convert history to message format
                        const historyMessages: ChatMessage[] = sessionDetails.history.map((msg: any, index: number) => ({
                            id: index + 1,
                            role: msg.role === "user" ? "user" : "bot",
                            message: msg.content,
                        }));
                        setMessages(historyMessages);
                    } else {
                        // No history, show simple greeting - wait for user response before discussing quotation
                        setMessages([
                            {
                                id: 1,
                                role: "bot" as const,
                                message: "Hi, How are you?",
                            },
                        ]);
                    }
                } else {
                    // No existing session, show simple greeting - wait for user response before discussing quotation
                    setMessages([{
                        id: 1,
                        role: "bot" as const,
                        message: "Hi, How are you?",
                    }]);
                }
            } catch (error: any) {
                console.error("Error loading chat history:", error);
                // Don't show error toast if it's just no sessions found
                if (error.response?.status !== 404) {
                    toast.error("Failed to load chat history");
                }
                // Show initial message on error or no sessions - simple greeting only
                setMessages([{
                    id: 1,
                    role: "bot" as const,
                    message: "Hi, How are you?",
                }]);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        loadChatHistory();
    }, [negotiationId, requisitionId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || loading) return;

        const userMessage = inputMessage.trim();
        setInputMessage("");
        setLoading(true);

        // Add user message to UI immediately
        const newUserMessage: ChatMessage = {
            id: messages.length + 1,
            role: "user" as const,
            message: userMessage,
        };
        setMessages((prev) => [...prev, newUserMessage]);

        // Add typing indicator
        const typingMessage: ChatMessage = {
            id: messages.length + 2,
            role: "bot" as const,
            message: "",
            isTyping: true,
        };
        setMessages((prev) => [...prev, typingMessage]);

        try {
            const response = await chatApi.sendMessage(
                userMessage,
                negotiationId || undefined,
                requisitionId || undefined
            );

            // Remove typing indicator and add bot response
            setMessages((prev) => {
                const messagesWithoutTyping = prev.filter((msg) => !msg.isTyping);
                const newBotMessage: ChatMessage = {
                    id: messagesWithoutTyping.length + 1,
                    role: "bot" as const,
                    message: response.message || "I apologize, but I couldn't generate a response.",
                };
                return [
                    ...messagesWithoutTyping,
                    newBotMessage,
                ];
            });
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast.error(error.response?.data?.error || "Failed to send message. Please try again.");
            
            // Remove typing indicator on error
            setMessages((prev) => prev.filter((msg) => !msg.isTyping));
        } finally {
            setLoading(false);
        }
    };

    const handleCloseChat = () => {
        navigate(-1);
    };

    if (isLoadingHistory) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="flex space-x-2 justify-center mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <p className="text-gray-600">Loading chat history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <style>{customStyles}</style>

            <div className="flex flex-col w-full bg-white min-h-screen shadow-2xl">
                {/* Chat Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCloseChat}
                            className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
                            title="Close Chat"
                        >
                            <FiX className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <img
                                    src={sideBarLogo}
                                    alt="Accordo AI"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            </div>
                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-3 border-white shadow-sm"></span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Accordo AI</h2>
                            <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    {negotiationId && (
                        <div className="text-sm text-gray-500">
                            Negotiation: {negotiationId.substring(0, 8)}...
                        </div>
                    )}
                </div>

                {/* Messages Container */}
                <div className="flex-1 px-6 py-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
                    {messages.map((msg: ChatMessage) => {
                        // Skip rendering if message is empty and not a typing indicator
                        if (!msg.message && !msg.isTyping) {
                            return null;
                        }

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] ${msg.role === "user" ? "ml-4" : "mr-4"}`}
                                >
                                    <div
                                        className={`rounded-2xl p-6 shadow-lg ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md"
                                                : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                                        }`}
                                    >
                                        {msg.isTyping ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                                                </div>
                                                <span className="text-sm text-gray-600 font-medium">
                                                    Accordo AI is thinking...
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-base leading-relaxed whitespace-pre-wrap">
                                                {msg.message}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2 block text-center">
                                        {new Date().toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>


                {/* Message Input */}
                <div className="sticky bottom-0 z-10 px-6 py-4 pb-6 border-t border-gray-100 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || loading}
                            className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 transform hover:scale-105 ${
                                !inputMessage.trim() || loading
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                            }`}
                        >
                            <FiSend className="w-5 h-5" />
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
