import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// @ts-ignore - hooks are JS files without type definitions
import { useDealActions } from "../../hooks/chatbot";
// @ts-ignore - components barrel export is a JS file without type definitions
import { ChatTranscript, Composer } from "../../components/chatbot/chat";

/**
 * NegotiationRoom Page
 * Main negotiation interface with chat and controls
 */
export default function NegotiationRoom() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState<string>("");

  const {
    deal,
    messages,
    config,
    loading,
    error,
    sending,
    resetLoading,
    canSend,
    canReset,
    sendVendorMessage,
    reset,
    reload,
  } = useDealActions(dealId);

  const handleSend = async (text: string): Promise<void> => {
    if (!text.trim()) return;
    try {
      await sendVendorMessage(text);
      setInputText(""); // Clear input after successful send
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleReset = async (): Promise<void> => {
    if (
      window.confirm("Are you sure you want to reset this deal? All messages will be deleted.")
    ) {
      try {
        await reset();
        setInputText("");
      } catch (err) {
        console.error("Failed to reset deal:", err);
      }
    }
  };

  if (loading && !deal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-800 font-medium mb-2">Failed to load deal</p>
          <p className="text-gray-600 text-sm mb-4">{error.message}</p>
          <button
            onClick={() => navigate("/chatbot")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Deals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/chatbot")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Deals
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{deal?.title || "Deal"}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                  deal?.status === "NEGOTIATING"
                    ? "bg-blue-100 text-blue-700"
                    : deal?.status === "ACCEPTED"
                    ? "bg-green-100 text-green-700"
                    : deal?.status === "WALKED_AWAY"
                    ? "bg-red-100 text-red-700"
                    : deal?.status === "ESCALATED"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {deal?.status}
              </span>
              {deal?.round !== undefined && (
                <span className="text-sm text-gray-600">Round {deal.round}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={reload}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              onClick={handleReset}
              disabled={resetLoading || !canReset}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {resetLoading ? "Resetting..." : "Reset"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Transcript */}
        <div className="flex-1 flex flex-col">
          <ChatTranscript messages={messages} isProcessing={sending} />
          <Composer
            onSend={handleSend}
            inputText={inputText}
            onInputChange={setInputText}
            sending={sending}
            dealStatus={deal?.status}
            canSend={canSend}
          />
        </div>

        {/* Sidebar - Negotiation Info */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Negotiation Config</h2>

          {config ? (
            <div className="space-y-4">
              {/* Price Parameters */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Parameters</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Anchor:</span>
                    <span className="font-medium">
                      ${config.parameters.unit_price.anchor}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium">
                      ${config.parameters.unit_price.target}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Acceptable:</span>
                    <span className="font-medium">
                      ${config.parameters.unit_price.max_acceptable}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">
                      {(config.parameters.unit_price.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Terms</h3>
                <div className="space-y-2 text-sm">
                  {config.parameters.payment_terms.options.map((term: string) => (
                    <div key={term} className="flex justify-between">
                      <span className="text-gray-600">{term}:</span>
                      <span className="font-medium">
                        {(config.parameters.payment_terms.utility[term as keyof typeof config.parameters.payment_terms.utility] * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">
                      {(config.parameters.payment_terms.weight * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Thresholds */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Thresholds</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accept:</span>
                    <span className="font-medium">
                      {(config.accept_threshold * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Walk Away:</span>
                    <span className="font-medium">
                      {(config.walkaway_threshold * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Rounds:</span>
                    <span className="font-medium">{config.max_rounds}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm">Loading config...</div>
          )}
        </div>
      </div>
    </div>
  );
}
