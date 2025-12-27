import React, { useState, useEffect, useRef } from "react";
import { chatApi } from "../services/chat.service";

const NegotiationChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [negotiationId, setNegotiationId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await chatApi.sendMessage(input, negotiationId);

            // Update negotiation ID if it's new
            if (response.sessionId && !negotiationId) {
                setNegotiationId(response.sessionId);
            }

            const aiMessage = { role: "assistant", content: response.message };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage = { role: "system", content: "Error: Failed to get response from AI." };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto border rounded-lg shadow-lg bg-white">
            <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                <h2 className="text-lg font-semibold text-gray-800">Accordo AI Negotiation</h2>
                <p className="text-sm text-gray-500">Negotiating RFQ #1001</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        Start the conversation by saying "Hi" or making an offer.
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : msg.role === "system"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className={`px-4 py-2 rounded-md text-white font-medium ${loading || !input.trim()
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NegotiationChat;

