import React, { useState, useEffect, useRef } from "react";
import ReviewModal from "../ReviewModel";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import sideBarLogo from "../../assets/sideBarLogo.png";
import { authApi } from "../../api";
import { FiSend, FiPaperclip, FiX } from "react-icons/fi";
import Markdown from 'react-markdown'

// Custom styles for enhanced UI
const customStyles = `
    .slider::-webkit-slider-thumb {
        appearance: none;
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        transition: all 0.2s ease;
    }
    
    .slider::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .slider::-moz-range-thumb {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        cursor: pointer;
        border: none;
        box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
    }
    
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
    console.log(state);
    const [otp, setOtp] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(true);

    const messagesEndRef = useRef(null);
    const data = JSON.parse(state.contractDetails);
    const uniqueToken = state.uniqueToken;

    const [messages, setMessages] = useState([
        { id: 1, role: "bot", message: "👋 Welcome to Accordo AI . I'm ChatBot, your AI assistant. Let me know how I can help you.", }
    ]);

    const [loading, setLoading] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [inputMessage, setInputMessage] = useState("");
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [showOptionsPrompt, setShowOptionsPrompt] = useState(false);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentPromptMessage, setCurrentPromptMessage] = useState("");

    const [sliderValues, setSliderValues] = useState({});
    console.log(sliderValues);
    const [sendSliderResponse, setSendSliderResponse] = useState(false)

    const handleSliderChange = (key, value) => {
        setSliderValues((prev) => ({
            ...prev,
            [key]: value
        }));
    };
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.Seller_Negotiation_Preferences) {
                setSliderValues(lastMsg.Seller_Negotiation_Preferences);
            }
        }
    }, [messages]);
    useEffect(() => {
        const fetchChatCode = async () => {
            try {
                // First, check if there's existing chat history
                const response2 = await axios.post("https://xty6rtagba4qk77slodw5enqfq0vwjep.lambda-url.ap-south-1.on.aws/", {
                    session_id: uniqueToken
                });
                console.log(response2)
                
                // Check if there's existing chat history
                if(response2.data && response2.data.length > 0) {
                    // If there's existing history, just load it
                    setMessages(prev => [...prev, ...response2.data]);
                    console.log("Loaded existing chat history");
                } else {
                    // Only call the first API if there's no existing history
                    console.log("No existing chat history, initializing new session");
                    const response = await axios.post("https://r27jgyqboover7i4sn23pg6i2y0xjxfg.lambda-url.ap-south-1.on.aws/", {
                        user_input: "",
                        uniqueToken: uniqueToken
                    });
                    
                    if (response.data && response.data.session_id) {
                        // if response.data.end is true then hit api to end the session
                        if(response.data.end ){
                            const res = await authApi.post(`/contract/update-status`,response.data )
                            console.log(res,'RESSSSS');
                            return
                        }

                        setCurrentSessionId(response.data.session_id);  
                        // Add the welcome message from the API response
                        setMessages(prev => [...prev, {
                            id: prev.length + 1,
                            role: "bot",
                            message: response.data.message || "Welcome to negotiation."
                        }]);
                        
                        // Handle options prompt from initial response
                        if (response.data.options && Array.isArray(response.data.options) && response.data.options.length > 0) {
                            setCurrentOptions(response.data.options);
                            setCurrentPromptMessage(response.data.message || "");
                            setShowOptionsPrompt(true);
                        }
                    }
                }

            } catch (error) {
                console.error("Error fetching chat data:", error);
                toast.error("Failed to initialize chat session");
            }
        };

        fetchChatCode();
    }, [uniqueToken]);
    const changeContractStatus = async () => {
        try {
            const res = await authApi.put(`/contract/update/${state?.id}`, { status: "negotiationStart" })
            console.log(res);


        } catch (error) {
            console.log(error);


        }
    }

    // useEffect(() => {
    //     changeContractStatus()
    // }, [isVerified])









    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    const handleSendSuggestion = async (suggestion) => {
        if (loading) return;

        setLoading(true);

        try {
            // Add message for user input
            const newUserMessage = {
                id: messages.length + 1,
                role: "user",
                message: suggestion,
            };

            setMessages((prevMessages) => [...prevMessages, newUserMessage]);

            // Add typing indicator
            const typingMessage = {
                id: messages.length + 2,
                role: "bot",
                message: "",
                isTyping: true,
            };
            setMessages((prevMessages) => [...prevMessages, typingMessage]);

            // Send data to backend using POST request
            const response = await axios.post("https://r27jgyqboover7i4sn23pg6i2y0xjxfg.lambda-url.ap-south-1.on.aws/", {
                user_input: suggestion,
                session_id: currentSessionId,
                uniqueToken: uniqueToken
            });

            if(response.data.end ){
                const res = await authApi.post(`/contract/update-status`,response.data )
                console.log(res,'RESSSSS');
                return
            }
            // Update session ID from response
            if (response.data.session_id) {
                setCurrentSessionId(response.data.session_id);
            }

            // Handle session timeout
            if (response.data.error === "session_timeout") {
                toast.error("Session timed out. Starting new session.");
                setCurrentSessionId(response.data.session_id);
            }

            // Remove typing indicator and add bot response message
            setMessages((prevMessages) => {
                const messagesWithoutTyping = prevMessages.filter(msg => !msg.isTyping);
                return [...messagesWithoutTyping, {
                    id: messagesWithoutTyping.length + 1,
                    role: "bot",
                    message: response.data.message || "Thank you! I'll get back to you shortly.",
                }];
            });

            // Handle options prompt
            if (response.data.options && Array.isArray(response.data.options) && response.data.options.length > 0) {
                setCurrentOptions(response.data.options);
                setCurrentPromptMessage(response.data.message || "");
                setShowOptionsPrompt(true);
            }

            // Handle specific states and their responses
            if (response.data.state === "ask_contract") {
                toast.info("Please provide a contract ID");
            } else if (response.data.state === "ask_condition") {
                toast.info("Please provide a condition ID");
            } else if (response.data.state === "confirm_start") {
                toast.info("Do you want to proceed with negotiation? (yes/no)");
            } else if (response.data.state === "choose_price_option") {
                toast.info("Would you like the suggested price or manual update?");
            } else if (response.data.state === "confirm_offer") {
                toast.info("Do you accept the offer? (yes/no)");
            } else if (response.data.state === "choose_alternative") {
                toast.info("Choose: modify, unable to cater, see alternate, discuss individual item");
            } else if (response.data.state === "ask_weightage") {
                toast.info("Enter weightage (0-5) for price,time,payment (e.g. 5,3,4)");
            }

        } catch (error) {
            // Remove typing indicator on error
            setMessages((prevMessages) => prevMessages.filter(msg => !msg.isTyping));
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setLoading(false);
        }
    };


    const handleOtpSubmit = (e) => {
        e.preventDefault();
        if (otp === "1234") {
            setIsVerified(true);
            setShowOtpModal(false);

        } else {
            toast.error("Invalid OTP! Please try again.")
        }
    };

    useEffect(() => {
        // Check if the last message contains Seller_Negotiation_Preferences and update state
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.Seller_Negotiation_Preferences) {
                setSliderValues(lastMsg.Seller_Negotiation_Preferences);
            }
        }
    }, [messages]);
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.Seller_Negotiation_Preferences) {
                setSliderValues(lastMsg.Seller_Negotiation_Preferences);
            }
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (inputMessage.trim() && !loading) {
            handleSendSuggestion(inputMessage);
            setInputMessage("");
        }
    };

    const handleCloseChat = () => {
        navigate('/group-summary');
    };

    const handleOptionSelect = async (option) => {
        setShowOptionsPrompt(false);
        setCurrentOptions([]);
        setCurrentPromptMessage("");
        
        // Send the selected option as a message
        await handleSendSuggestion(option);
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <style>{customStyles}</style>
            
            {showOtpModal && !isVerified && (
                <div className="fixed inset-0 flex z-50 items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-gray-100">
                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Enter OTP</h2>
                        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength="4"
                                placeholder="Enter OTP"
                                className="border-2 border-gray-200 p-4 rounded-xl text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
                            >
                                Verify OTP
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isVerified && (
                <div className="flex flex-col w-full bg-white h-full shadow-2xl">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50 shadow-sm">
                        <div className="flex items-center gap-4">
                            {/* <button
                                onClick={handleCloseChat}
                                className="p-3 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
                                title="Close Chat"
                            >
                                <FiX className="w-6 h-6 text-gray-600" />
                            </button> */}
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <img src={sideBarLogo} alt="" className="w-10 h-10 rounded-full object-cover" />
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
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar bg-gradient-to-b from-gray-50 to-white">
                        {messages?.map((msg, index) => {
                            const isFirstCustomerMessage = msg.role === "user" && (index === 0 || messages[index - 1].role !== "user");
                            
                            // Skip rendering if message is empty and not a typing indicator
                            if(msg.message === '' && !msg.isTyping){
                                return null;
                            }

                            return (
                                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] ${msg.role === "user" ? "ml-4" : "mr-4"}`}>
                                        <div className={`rounded-2xl px-6 py-4 shadow-lg ${
                                            msg.role === "user" 
                                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md" 
                                                : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
                                        }`}>
                                            {msg.isTyping ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                                                    </div>
                                                    <span className="text-sm text-gray-600 font-medium">Accordo AI is thinking...</span>
                                                </div>
                                            ) : (
                                                <div className="text-sm leading-relaxed">
                                                    <div 
                                                        className={`${msg.role === "user" ? "text-white" : "text-gray-800"}`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: msg?.message?.replace(
                                                                /<table/g, 
                                                                '<table class="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm"'
                                                            ).replace(
                                                                /<th/g, 
                                                                '<th class="bg-gray-100 text-gray-800 font-semibold text-left p-3 border border-gray-300"'
                                                            ).replace(
                                                                /<td/g, 
                                                                '<td class="p-3 border border-gray-300 text-sm"'
                                                            ).replace(
                                                                /<tr/g, 
                                                                '<tr class="hover:bg-gray-50 transition-colors"'
                                                            )
                                                        }}
                                                    ></div>
                                                    
                                                    {/* Slider Preferences */}
                                                    {msg?.Seller_Negotiation_Preferences && Object.keys(msg.Seller_Negotiation_Preferences).length > 0 && (
                                                        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                                                            <h3 className="font-bold text-gray-800 mb-4 text-center">Rate Each Aspect (0 to 10)</h3>
                                                            <div className="space-y-5">
                                                                {Object.entries(sliderValues).map(([key, value], i) => (
                                                                    <div key={i} className="space-y-3">
                                                                        <div className="flex justify-between items-center">
                                                                            <label className="text-sm font-semibold text-gray-700 capitalize">
                                                                                {key.replace(/_/g, " ")}
                                                                            </label>
                                                                            <span className="text-lg font-bold text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm">
                                                                                {value}
                                                                            </span>
                                                                        </div>
                                                                        <div className="relative">
                                                                            <input
                                                                                type="range"
                                                                                min="0"
                                                                                max="10"
                                                                                step="1"
                                                                                value={value}
                                                                                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                                                                onChange={(e) => handleSliderChange(key, parseInt(e.target.value))}
                                                                            />
                                                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                                                <span>0</span>
                                                                                <span>5</span>
                                                                                <span>10</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2 block text-center">
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-6 border-t border-gray-100 bg-white">
                        {showOptionsPrompt && (
                            <div className="mb-6">
                                <div className="grid grid-cols-1 gap-3">
                                    {currentOptions.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleOptionSelect(option)}
                                            disabled={loading}
                                            className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-200 text-left border-2 transform hover:scale-105
                                                ${loading 
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 active:bg-blue-100 border-blue-200 hover:border-blue-400 shadow-md hover:shadow-lg'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {!showOptionsPrompt && !loading && (
                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim()}
                                    className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 transform hover:scale-105
                                        ${!inputMessage.trim()
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    <FiSend className="w-5 h-5" />
                                    Send
                                </button>
                            </form>
                        )}
                        
                        {loading && !showOptionsPrompt && (
                            <div className="flex items-center justify-center py-4">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                    <span className="text-sm font-medium">Processing your message...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <ReviewModal
                show={showReviewModal}
                rating={rating}
                setRating={setRating}
                review={review}
                setReview={setReview}
                onClose={() => setShowReviewModal(false)}
            />
        </div>
    );
};

export default Chat;
