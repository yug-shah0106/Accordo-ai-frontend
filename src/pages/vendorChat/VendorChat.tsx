import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import vendorChatService, {
  type VendorDealData,
  type VendorChatMessage,
  type VendorDeal,
  type VendorStructuredSuggestion,
  type VendorSuggestionEmphasis,
  type VendorScenarioType,
} from "../../services/vendorChat.service";

/**
 * VendorChat Page
 * Simplified negotiation interface for vendors
 * - No sidebar, Reset, Refresh, Summary, Back-to-Deals buttons
 * - Shows: Header with title/status, chat area, composer (if NEGOTIATING)
 * - PM targets hidden from vendors
 */

// Status badge colors
const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  NEGOTIATING: { bg: "bg-blue-100", text: "text-blue-800", label: "In Progress" },
  ACCEPTED: { bg: "bg-green-100", text: "text-green-800", label: "Accepted" },
  WALKED_AWAY: { bg: "bg-red-100", text: "text-red-800", label: "Walked Away" },
  ESCALATED: { bg: "bg-orange-100", text: "text-orange-800", label: "Escalated" },
};

/**
 * Status Badge Component
 */
const StatusBadge = ({ status }: { status: string }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.NEGOTIATING;
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
      {colors.label}
    </span>
  );
};

/**
 * Message Bubble Component
 */
const MessageBubble = ({ message }: { message: VendorChatMessage }) => {
  const isVendor = message.role === "VENDOR";
  const isSystem = message.role === "SYSTEM";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg max-w-md text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isVendor ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] px-4 py-3 rounded-lg ${
          isVendor
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white text-gray-800 shadow-sm border border-gray-200 rounded-bl-sm"
        }`}
      >
        <div className="text-xs font-medium mb-1 opacity-75">
          {isVendor ? "You" : "Procurement Manager"}
        </div>
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className={`text-xs mt-2 ${isVendor ? "text-blue-200" : "text-gray-400"}`}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

/**
 * Chat Transcript Component
 */
const ChatTranscript = ({
  messages,
  isProcessing,
}: {
  messages: VendorChatMessage[];
  isProcessing: boolean;
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsNearBottom(distanceFromBottom < 100);
  }, []);

  useEffect(() => {
    if (isNearBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing, isNearBottom]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-6 py-4"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-lg">No messages yet</p>
            <p className="text-sm mt-2">Start the negotiation by sending a message</p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isProcessing && (
            <div className="flex justify-start mb-4">
              <div className="bg-white text-gray-800 shadow-sm border border-gray-200 rounded-lg rounded-bl-sm px-4 py-3">
                <div className="text-xs font-medium mb-1 opacity-75">Procurement Manager</div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

/**
 * Scenario type labels and colors
 */
const SCENARIO_CONFIG: Record<VendorScenarioType, { label: string; bgActive: string; bgInactive: string; text: string }> = {
  STRONG: {
    label: "Strong Position",
    bgActive: "bg-red-100 border-red-400 text-red-800",
    bgInactive: "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200",
    text: "text-red-600",
  },
  BALANCED: {
    label: "Balanced Offer",
    bgActive: "bg-yellow-100 border-yellow-400 text-yellow-800",
    bgInactive: "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200",
    text: "text-yellow-600",
  },
  FLEXIBLE: {
    label: "Flexible Offer",
    bgActive: "bg-green-100 border-green-400 text-green-800",
    bgInactive: "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200",
    text: "text-green-600",
  },
};

/**
 * Emphasis chip colors
 */
const EMPHASIS_COLORS: Record<VendorSuggestionEmphasis, { base: string; selected: string }> = {
  price: {
    base: "bg-green-100 text-green-800 border-green-300",
    selected: "bg-green-200 text-green-900 border-green-500 ring-2 ring-green-400 scale-105",
  },
  terms: {
    base: "bg-blue-100 text-blue-800 border-blue-300",
    selected: "bg-blue-200 text-blue-900 border-blue-500 ring-2 ring-blue-400 scale-105",
  },
  delivery: {
    base: "bg-purple-100 text-purple-800 border-purple-300",
    selected: "bg-purple-200 text-purple-900 border-purple-500 ring-2 ring-purple-400 scale-105",
  },
};

/**
 * Composer Component with Vendor Suggestions
 */
const Composer = ({
  onSend,
  disabled,
  sending,
  uniqueToken,
  hasPMResponse,
}: {
  onSend: (content: string) => void;
  disabled: boolean;
  sending: boolean;
  uniqueToken: string;
  hasPMResponse: boolean;
}) => {
  const [input, setInput] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<VendorScenarioType>("BALANCED");
  const [selectedEmphases, setSelectedEmphases] = useState<Set<VendorSuggestionEmphasis>>(new Set());
  const [suggestions, setSuggestions] = useState<Record<VendorScenarioType, VendorStructuredSuggestion[]>>({
    STRONG: [] as VendorStructuredSuggestion[],
    BALANCED: [] as VendorStructuredSuggestion[],
    FLEXIBLE: [] as VendorStructuredSuggestion[],
  });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [hasPMCounterOffer, setHasPMCounterOffer] = useState(false);
  const [priceInfo, setPriceInfo] = useState<{ vendorQuotePrice: number | null; pmCounterPrice: number | null }>({
    vendorQuotePrice: null,
    pmCounterPrice: null,
  });

  // Fetch suggestions when component mounts or emphases change
  const fetchSuggestions = useCallback(async () => {
    if (!uniqueToken || !hasPMResponse) return;

    try {
      setLoadingSuggestions(true);
      const emphases = selectedEmphases.size > 0 ? Array.from(selectedEmphases) : undefined;
      const response = await vendorChatService.getSuggestions(uniqueToken, emphases);

      // Backend returns suggestions as { STRONG: [...], BALANCED: [...], FLEXIBLE: [...] }
      const suggestionsData = (response.data as any).suggestions;
      if (suggestionsData && typeof suggestionsData === 'object' && !Array.isArray(suggestionsData)) {
        setSuggestions({
          STRONG: Array.isArray(suggestionsData.STRONG) ? suggestionsData.STRONG : [],
          BALANCED: Array.isArray(suggestionsData.BALANCED) ? suggestionsData.BALANCED : [],
          FLEXIBLE: Array.isArray(suggestionsData.FLEXIBLE) ? suggestionsData.FLEXIBLE : [],
        });
      } else {
        setSuggestions({ STRONG: [], BALANCED: [], FLEXIBLE: [] });
      }
      setHasPMCounterOffer(response.data.hasPMCounterOffer ?? false);
      setPriceInfo({
        vendorQuotePrice: response.data.vendorQuotePrice,
        pmCounterPrice: response.data.pmCounterPrice,
      });
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [uniqueToken, hasPMResponse, selectedEmphases]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Toggle emphasis selection
  const toggleEmphasis = (emphasis: VendorSuggestionEmphasis) => {
    setSelectedEmphases((prev) => {
      const next = new Set(prev);
      if (next.has(emphasis)) {
        next.delete(emphasis);
      } else {
        next.add(emphasis);
      }
      return next;
    });
  };

  // Get suggestions for selected scenario
  const filteredSuggestions = useMemo(() => {
    const scenarioSuggestions = suggestions[selectedScenario];
    return Array.isArray(scenarioSuggestions) ? scenarioSuggestions : [];
  }, [suggestions, selectedScenario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled || sending) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (message: string) => {
    if (disabled || sending) return;
    onSend(message);
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      {/* Vendor Suggestions Section - Only show if PM has responded */}
      {hasPMResponse && hasPMCounterOffer && (
        <div className="mb-4 space-y-3">
          {/* Price Context */}
          {priceInfo.vendorQuotePrice && priceInfo.pmCounterPrice && (
            <div className="text-xs text-gray-500 flex items-center gap-4">
              <span>Your quote: <strong className="text-gray-700">${priceInfo.vendorQuotePrice.toFixed(2)}</strong></span>
              <span className="text-gray-300">|</span>
              <span>PM counter: <strong className="text-blue-600">${priceInfo.pmCounterPrice.toFixed(2)}</strong></span>
            </div>
          )}

          {/* Scenario Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Quick Offers:</span>
            {(Object.keys(SCENARIO_CONFIG) as VendorScenarioType[]).map((scenario) => {
              const config = SCENARIO_CONFIG[scenario];
              const isActive = selectedScenario === scenario;
              return (
                <button
                  key={scenario}
                  onClick={() => setSelectedScenario(scenario)}
                  disabled={sending}
                  className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                    isActive ? config.bgActive : config.bgInactive
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Emphasis Chips - Interactive */}
          <div className="flex flex-wrap gap-2">
            {(["price", "terms", "delivery"] as VendorSuggestionEmphasis[]).map((emphasis) => {
              const isSelected = selectedEmphases.has(emphasis);
              const colors = EMPHASIS_COLORS[emphasis];
              return (
                <button
                  key={emphasis}
                  onClick={() => toggleEmphasis(emphasis)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border cursor-pointer transition-all duration-200 capitalize ${
                    isSelected ? colors.selected : colors.base
                  }`}
                  title={isSelected ? `Remove ${emphasis} filter` : `Prioritize ${emphasis}`}
                >
                  {emphasis}
                </button>
              );
            })}
            {selectedEmphases.size > 0 && (
              <span className="text-xs text-gray-500 flex items-center ml-2">
                Filtering by: {Array.from(selectedEmphases).join(", ")}
              </span>
            )}
          </div>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-2">
            {loadingSuggestions ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded h-8 min-w-[200px] max-w-[400px]"
                  >
                    <div className="h-3 bg-gray-300 rounded animate-pulse w-full" />
                  </div>
                ))}
              </>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion.message)}
                  disabled={sending || disabled}
                  className="px-3 py-1.5 text-xs border rounded transition-all duration-200 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed h-8 text-left overflow-hidden max-w-[500px]"
                  title={suggestion.message}
                >
                  <span className="block truncate">
                    {suggestion.message.length > 80 ? suggestion.message.slice(0, 77) + "..." : suggestion.message}
                  </span>
                </button>
              ))
            ) : (
              <span className="text-xs text-gray-500">No suggestions available for this scenario</span>
            )}
          </div>
        </div>
      )}

      {/* No PM response yet - show hint */}
      {hasPMResponse && !hasPMCounterOffer && (
        <div className="mb-3 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded">
          Suggestions will appear after the PM makes a counter-offer.
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-end space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || sending}
            placeholder={disabled ? "Negotiation has ended" : "Type your message..."}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={2}
          />
          <button
            type="submit"
            disabled={!input.trim() || disabled || sending}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {sending ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Send"
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
};

/**
 * Deal Outcome Component (shown when negotiation ends)
 */
const DealOutcome = ({ status }: { status: string }) => {
  const outcomes: Record<string, { icon: string; title: string; message: string; color: string }> = {
    ACCEPTED: {
      icon: "M5 13l4 4L19 7",
      title: "Negotiation Successful!",
      message: "The procurement manager has accepted your offer. You will be contacted with the next steps.",
      color: "text-green-600",
    },
    WALKED_AWAY: {
      icon: "M6 18L18 6M6 6l12 12",
      title: "Negotiation Ended",
      message: "The procurement manager has decided to walk away from this negotiation. Thank you for your participation.",
      color: "text-red-600",
    },
    ESCALATED: {
      icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      title: "Negotiation Escalated",
      message: "This negotiation has been escalated to a senior manager for review. You will be notified of the outcome.",
      color: "text-orange-600",
    },
  };

  const outcome = outcomes[status] || outcomes.ESCALATED;

  return (
    <div className="border-t border-gray-200 p-6 bg-gray-50 text-center">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow mb-4`}>
        <svg className={`w-8 h-8 ${outcome.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={outcome.icon} />
        </svg>
      </div>
      <h3 className={`text-xl font-semibold ${outcome.color} mb-2`}>{outcome.title}</h3>
      <p className="text-gray-600 max-w-md mx-auto">{outcome.message}</p>
    </div>
  );
};

/**
 * Loading Skeleton
 */
const LoadingSkeleton = () => (
  <div className="flex flex-col h-screen bg-gray-100">
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div className="animate-pulse flex items-center space-x-4">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>
    </div>
    <div className="flex-1 p-6">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-start">
            <div className="animate-pulse bg-gray-200 rounded-lg h-20 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Main VendorChat Component
 */
export default function VendorChat() {
  const { uniqueToken } = useParams<{ uniqueToken: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VendorDealData | null>(null);
  const [messages, setMessages] = useState<VendorChatMessage[]>([]);
  const [deal, setDeal] = useState<VendorDeal | null>(null);
  const [sending, setSending] = useState(false);
  const [pmTyping, setPmTyping] = useState(false);

  // Fetch deal data
  const fetchDeal = useCallback(async () => {
    if (!uniqueToken) {
      setLoading(false);
      setError("Invalid or missing negotiation token");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // First enter chat (creates opening message if needed)
      try {
        await vendorChatService.enterChat(uniqueToken);
      } catch (enterError) {
        // Ignore errors here - deal might already be entered
        console.log("Enter chat:", enterError);
      }

      // Fetch deal data
      const response = await vendorChatService.getDeal(uniqueToken);
      setData(response.data);
      const currentMessages = response.data.messages || [];
      setMessages(currentMessages);
      setDeal(response.data.deal);

      // Check if we need to auto-generate PM response
      // Condition: There's a vendor message but no PM (ACCORDO) response yet
      const hasVendorMessage = currentMessages.some((m: VendorChatMessage) => m.role === "VENDOR");
      const hasPMMessage = currentMessages.some((m: VendorChatMessage) => m.role === "ACCORDO");
      const openingVendorMessage = currentMessages.find((m: VendorChatMessage) => m.role === "VENDOR");

      if (hasVendorMessage && !hasPMMessage && openingVendorMessage && response.data.deal.status === "NEGOTIATING") {
        // Auto-trigger PM response for the opening message
        try {
          setPmTyping(true);
          const pmResponse = await vendorChatService.getPMResponse(
            uniqueToken,
            openingVendorMessage.id
          );

          // Add PM message to messages
          setMessages((prev) => [...prev, pmResponse.data.pmMessage]);
          setDeal(pmResponse.data.deal);

          // Show notification based on decision
          if (pmResponse.data.decision.action === "ACCEPT") {
            toast.success("Your offer has been accepted!");
          } else if (pmResponse.data.decision.action === "WALK_AWAY") {
            toast.error("The procurement manager has walked away from this negotiation.");
          } else if (pmResponse.data.decision.action === "ESCALATE") {
            toast("This negotiation has been escalated for review.", { icon: "⚠️" });
          }
        } catch (pmError) {
          console.error("Failed to get PM response:", pmError);
          // Don't fail the whole page - vendor can still see their message
        } finally {
          setPmTyping(false);
        }
      }
    } catch (err: any) {
      console.error("Error fetching deal:", err);
      setError(err.response?.data?.message || "Failed to load negotiation");
      if (err.response?.status === 404) {
        toast.error("Negotiation not found. Please check your link.");
      }
    } finally {
      setLoading(false);
    }
  }, [uniqueToken]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  // Send message handler
  const handleSend = async (content: string) => {
    if (!uniqueToken || !content.trim() || sending) return;

    try {
      setSending(true);

      // Phase 1: Send vendor message (instant)
      const messageResponse = await vendorChatService.sendMessage(uniqueToken, content);

      // Add vendor message to UI immediately
      setMessages((prev) => [...prev, messageResponse.data.vendorMessage]);
      setDeal(messageResponse.data.deal);

      // Phase 2: Get PM response (async)
      setPmTyping(true);
      const pmResponse = await vendorChatService.getPMResponse(
        uniqueToken,
        messageResponse.data.vendorMessage.id
      );

      // Add PM message to UI
      setMessages((prev) => [...prev, pmResponse.data.pmMessage]);
      setDeal(pmResponse.data.deal);

      // Show notification if deal status changed
      if (pmResponse.data.decision.action === "ACCEPT") {
        toast.success("Your offer has been accepted!");
      } else if (pmResponse.data.decision.action === "WALK_AWAY") {
        toast.error("The procurement manager has walked away from this negotiation.");
      } else if (pmResponse.data.decision.action === "ESCALATE") {
        toast("This negotiation has been escalated for review.", { icon: "⚠️" });
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
      setPmTyping(false);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Negotiation</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDeal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No deal found
  if (!deal) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Negotiation Found</h2>
          <p className="text-gray-600">
            This negotiation may not have started yet. Please submit your quote first.
          </p>
        </div>
      </div>
    );
  }

  const canNegotiate = deal.status === "NEGOTIATING";

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Simple Header - Title + Status only */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {deal.title || "Negotiation"}
            </h1>
            <StatusBadge status={deal.status} />
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Round {deal.round}</span>
            {data?.requisition && (
              <span className="text-gray-400">|</span>
            )}
            {data?.requisition?.rfqNumber && (
              <span>{data.requisition.rfqNumber}</span>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area - Full Width, No Sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatTranscript messages={messages} isProcessing={pmTyping} />

        {/* Composer - Only if NEGOTIATING */}
        {canNegotiate ? (
          <Composer
            onSend={handleSend}
            disabled={!canNegotiate}
            sending={sending}
            uniqueToken={uniqueToken || ""}
            hasPMResponse={messages.some((m) => m.role === "ACCORDO")}
          />
        ) : (
          <DealOutcome status={deal.status} />
        )}
      </div>
    </div>
  );
}
