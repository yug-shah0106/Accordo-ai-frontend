import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// @ts-ignore - hooks are JS files without type definitions
import { useDealActions } from "../../hooks/chatbot";
// @ts-ignore - components barrel export is a JS file without type definitions
import { ChatTranscript, Composer } from "../../components/chatbot/chat";
import { exportDealAsPDF, exportDealAsCSV } from "../../utils/exportDeal";

/**
 * NegotiationRoom Page
 * Main negotiation interface with chat and controls
 */
export default function NegotiationRoom() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState<string>("");
  const [showExportDropdown, setShowExportDropdown] = useState<boolean>(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleExportPDF = (): void => {
    if (deal && messages) {
      exportDealAsPDF(deal, messages);
      setShowExportDropdown(false);
    }
  };

  const handleExportCSV = (): void => {
    if (deal && messages) {
      exportDealAsCSV(deal, messages);
      setShowExportDropdown(false);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showExportDropdown]);

  // Extract latest negotiation state from messages
  const getLatestNegotiationState = () => {
    // Get the most recent Accordo message with explainability data
    const accordoMessages = messages
      .filter((m: any) => m.role === "ACCORDO" && m.explainabilityJson)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestAccordo = accordoMessages[0];

    if (!latestAccordo?.explainabilityJson) {
      return null;
    }

    const explainability = latestAccordo.explainabilityJson;

    // Get all vendor offers to track history
    const vendorOffers = messages
      .filter((m: any) => m.role === "VENDOR" && m.extractedOffer)
      .map((m: any) => m.extractedOffer);

    // Get all Accordo counter-offers
    const accordoOffers = messages
      .filter((m: any) => m.role === "ACCORDO" && m.counterOffer)
      .map((m: any) => m.counterOffer);

    return {
      currentVendorOffer: explainability.vendorOffer,
      currentAccordoOffer: explainability.decision.counterOffer || latestAccordo.counterOffer,
      utilities: explainability.utilities,
      decision: explainability.decision,
      vendorOfferHistory: vendorOffers,
      accordoOfferHistory: accordoOffers,
    };
  };

  // Calculate adaptive config based on negotiation progress
  const getAdaptiveConfig = () => {
    if (!config || !negotiationState) return config;

    const { vendorOfferHistory, accordoOfferHistory } = negotiationState;
    const round = deal?.round || 0;

    // Create adaptive config by adjusting parameters based on negotiation progress
    const adaptiveConfig = { ...config };

    // Adaptive Price Parameters
    if (vendorOfferHistory.length > 0 && accordoOfferHistory.length > 0) {
      // Get price trends
      const vendorPrices = vendorOfferHistory
        .map((o: any) => o.unit_price)
        .filter((p: any) => p != null);

      const accordoPrices = accordoOfferHistory
        .map((o: any) => o.unit_price)
        .filter((p: any) => p != null);

      if (vendorPrices.length > 0 && accordoPrices.length > 0) {
        // Calculate convergence - are we getting closer?
        const latestVendorPrice = vendorPrices[vendorPrices.length - 1];
        const latestAccordoPrice = accordoPrices[accordoPrices.length - 1];
        const priceGap = Math.abs(latestVendorPrice - latestAccordoPrice);

        // Adjust anchor based on convergence (getting more flexible)
        const convergenceFactor = Math.min(round / (config.max_rounds || 10), 1);
        const adjustedAnchor = config.parameters.unit_price.anchor +
          (config.parameters.unit_price.target - config.parameters.unit_price.anchor) * convergenceFactor * 0.3;

        // Adjust target based on vendor's best offer
        const bestVendorPrice = Math.min(...vendorPrices);
        const adjustedTarget = bestVendorPrice < config.parameters.unit_price.target
          ? bestVendorPrice * 1.05 // 5% above their best offer
          : config.parameters.unit_price.target;

        adaptiveConfig.parameters.unit_price.anchor = adjustedAnchor;
        adaptiveConfig.parameters.unit_price.target = adjustedTarget;
      }
    }

    // Adaptive Thresholds - get more aggressive as rounds progress
    const roundProgress = Math.min(round / (config.max_rounds || 10), 1);

    // As rounds progress, become more willing to accept (lower accept threshold)
    // and less willing to walk away (also lower walkaway threshold)
    // The thresholds move inversely: accept goes down, walkaway goes down
    adaptiveConfig.accept_threshold = Math.max(
      config.accept_threshold - (roundProgress * 0.15),
      0.5 // Never go below 50%
    );

    // Walkaway threshold decreases as we get more desperate (inverse relationship)
    adaptiveConfig.walkaway_threshold = Math.max(
      config.walkaway_threshold - (roundProgress * 0.1),
      0.2 // Never go below 20%
    );

    // Adaptive Payment Terms Weights - based on what vendor offers
    if (negotiationState.currentVendorOffer.payment_terms) {
      const currentTerm = negotiationState.currentVendorOffer.payment_terms;
      // If vendor consistently offers good terms, increase weight of terms
      const termOffers = vendorOfferHistory
        .map((o: any) => o.payment_terms)
        .filter((t: any) => t != null);

      if (termOffers.filter((t: any) => t === "Net 30").length > termOffers.length * 0.6) {
        // Vendor prefers Net 30, adjust our preference
        adaptiveConfig.parameters.payment_terms.utility["Net 30"] =
          Math.min(config.parameters.payment_terms.utility["Net 30"] * 1.1, 1);
      }
    }

    return adaptiveConfig;
  };

  const negotiationState = getLatestNegotiationState();
  const adaptiveConfig = getAdaptiveConfig();

  if (loading && !deal) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="flex items-center justify-center h-full">
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
          <p className="text-gray-800 dark:text-dark-text font-medium mb-2">Failed to load deal</p>
          <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">{error.message}</p>
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

  // Check if deal is completed - show read-only summary
  const isCompletedDeal = deal?.status === 'ACCEPTED' || deal?.status === 'WALKED_AWAY';

  if (isCompletedDeal) {
    return (
      <div className="flex flex-col min-h-full bg-gray-100 dark:bg-dark-bg">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left - Back button */}
            <button
              onClick={() => navigate("/chatbot")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Deals
            </button>

            {/* Center - Deal title and status */}
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">{deal?.title || "Deal"}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                    deal?.status === "ACCEPTED"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {deal?.status}
                </span>
                <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Completed - Round {deal.round}
                </span>
              </div>
            </div>

            {/* Right - Export button */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
                <svg className={`w-4 h-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={handleExportPDF}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Export as PDF
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export as CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Read-Only Chat Transcript */}
        <div className="flex-1 pt-6 px-6 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">
                  This deal has been {deal?.status === 'ACCEPTED' ? 'accepted' : 'closed'}.
                  The negotiation history is shown below for reference.
                </span>
              </div>
            </div>

            <ChatTranscript messages={messages} isProcessing={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 dark:bg-dark-bg">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Back button */}
          <button
            onClick={() => navigate("/chatbot")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
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

          {/* Center - Deal title and status */}
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text">{deal?.title || "Deal"}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${
                  deal?.status === "NEGOTIATING"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : deal?.status === "ACCEPTED"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : deal?.status === "WALKED_AWAY"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : deal?.status === "ESCALATED"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                }`}
              >
                {deal?.status}
              </span>
              {deal?.round !== undefined && (
                <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Round {deal.round}</span>
              )}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex gap-2">
            <button
              onClick={reload}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              onClick={handleReset}
              disabled={resetLoading || !canReset}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-dark-surface border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"
            >
              {resetLoading ? "Resetting..." : "Reset"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Flex container for chat + sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area - Left column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages - Scrollable */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <ChatTranscript messages={messages} isProcessing={sending} />
          </div>

          {/* Composer - Fixed at bottom */}
          <div className="flex-shrink-0">
            <Composer
              onSend={handleSend}
              inputText={inputText}
              onInputChange={setInputText}
              sending={sending}
              dealStatus={deal?.status}
              canSend={canSend}
              dealId={dealId}
              currentRound={deal?.round || 0}
            />
          </div>
        </div>

        {/* Sidebar - Right column (Fixed width, independently scrollable) */}
        <div className="hidden lg:flex lg:flex-col w-80 bg-white dark:bg-dark-surface border-l border-gray-200 dark:border-dark-border flex-shrink-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-6">Negotiation Dashboard</h2>

            {config && adaptiveConfig ? (
            <div className="space-y-6">
              {/* Adaptive Mode Indicator */}
              {negotiationState && deal && deal.round > 0 && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                      <div className="text-xs font-bold">Adaptive AI Mode Active</div>
                      <div className="text-xs opacity-90">Config adjusting based on negotiation progress</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Progress - Moved to Top */}
              {deal && (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 shadow-sm border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Current Progress
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Current Round:</span>
                      <span className="font-bold text-gray-900">
                        {deal.round} / {adaptiveConfig.max_rounds}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          deal.round >= adaptiveConfig.max_rounds
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : deal.round >= adaptiveConfig.max_rounds * 0.7
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${Math.min((deal.round / adaptiveConfig.max_rounds) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Offers Section - Dynamic */}
              {negotiationState && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-5 shadow-sm border-2 border-emerald-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Current Offers
                  </h3>
                  <div className="space-y-4">
                    {/* Vendor Offer */}
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <div className="text-xs font-semibold text-gray-600 mb-2">Vendor's Offer</div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Price:</span>
                          <span className="text-sm font-bold text-gray-900">
                            ${negotiationState.currentVendorOffer.unit_price?.toFixed(2) || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Payment:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {negotiationState.currentVendorOffer.payment_terms || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Accordo Counter-Offer */}
                    {negotiationState.currentAccordoOffer && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs font-semibold text-blue-700 mb-2">Our Counter-Offer</div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Price:</span>
                            <span className="text-sm font-bold text-blue-900">
                              ${negotiationState.currentAccordoOffer.unit_price?.toFixed(2) || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Payment:</span>
                            <span className="text-sm font-medium text-blue-900">
                              {negotiationState.currentAccordoOffer.payment_terms || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Live Utility Score */}
                    <div className="pt-3 border-t border-emerald-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-700">Utility Score</span>
                        <span className="text-lg font-bold text-emerald-700">
                          {negotiationState.utilities.total ? (negotiationState.utilities.total * 100).toFixed(1) : "0"}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            (negotiationState.utilities.total || 0) >= adaptiveConfig.accept_threshold
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : (negotiationState.utilities.total || 0) >= adaptiveConfig.walkaway_threshold
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                              : 'bg-gradient-to-r from-orange-500 to-red-600'
                          }`}
                          style={{ width: `${(negotiationState.utilities.total || 0) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1.5 text-gray-600">
                        <span>Walk Away ({(adaptiveConfig.walkaway_threshold * 100).toFixed(0)}%)</span>
                        <span className="text-green-700">Accept ({(adaptiveConfig.accept_threshold * 100).toFixed(0)}%)</span>
                      </div>
                    </div>

                    {/* Utility Breakdown */}
                    <div className="pt-3 border-t border-emerald-200">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Utility Breakdown</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Price Utility:</span>
                          <span className="font-medium">
                            {negotiationState.utilities.priceUtility ? (negotiationState.utilities.priceUtility * 100).toFixed(1) : "0"}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Terms Utility:</span>
                          <span className="font-medium">
                            {negotiationState.utilities.termsUtility ? (negotiationState.utilities.termsUtility * 100).toFixed(1) : "0"}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Price Parameters */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Price Parameters
                  {deal && deal.round > 0 && (
                    <span className="ml-auto text-xs text-indigo-600 animate-pulse">● Live</span>
                  )}
                </h3>
                <div className="space-y-4">
                  {/* Anchor Price */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-700 font-medium">Anchor (Best Case)</span>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-green-700">
                          ${adaptiveConfig.parameters.unit_price.anchor.toFixed(2)}
                        </span>
                        {config.parameters.unit_price.anchor !== adaptiveConfig.parameters.unit_price.anchor && (
                          <span className="text-xs text-gray-500 line-through">
                            ${config.parameters.unit_price.anchor.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Target Price */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-700 font-medium">Target</span>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-blue-700">
                          ${adaptiveConfig.parameters.unit_price.target.toFixed(2)}
                        </span>
                        {config.parameters.unit_price.target !== adaptiveConfig.parameters.unit_price.target && (
                          <span className="text-xs text-gray-500 line-through">
                            ${config.parameters.unit_price.target.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Max Acceptable Price */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-700 font-medium">Max Acceptable</span>
                      <span className="font-bold text-orange-700">
                        ${adaptiveConfig.parameters.unit_price.max_acceptable.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Price Range Visualization with Current Position */}
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="text-xs text-gray-600 mb-2">Price Range & Current Position</div>
                    <div className="relative h-4 bg-gradient-to-r from-green-400 via-yellow-300 to-red-400 rounded-full overflow-hidden">
                      {/* Current Vendor Price Indicator */}
                      {negotiationState?.currentVendorOffer.unit_price && (
                        <>
                          {(() => {
                            const currentPrice = negotiationState.currentVendorOffer.unit_price;
                            const anchor = adaptiveConfig.parameters.unit_price.anchor;
                            const maxPrice = adaptiveConfig.parameters.unit_price.max_acceptable;
                            const priceRange = maxPrice - anchor;
                            const position = ((currentPrice - anchor) / priceRange) * 100;
                            const clampedPosition = Math.max(0, Math.min(100, position));

                            return (
                              <div
                                className="absolute top-0 h-full w-1 bg-gray-900 shadow-lg transition-all duration-700"
                                style={{ left: `${clampedPosition}%` }}
                                title={`Current: $${currentPrice.toFixed(2)}`}
                              >
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-900 whitespace-nowrap">
                                  ↓ ${currentPrice.toFixed(2)}
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                    <div className="flex justify-between text-xs mt-1.5 text-gray-600">
                      <span className="text-green-700">Ideal (${adaptiveConfig.parameters.unit_price.anchor.toFixed(2)})</span>
                      <span className="text-orange-700">Max (${adaptiveConfig.parameters.unit_price.max_acceptable.toFixed(2)})</span>
                    </div>
                  </div>

                  {/* Concession Step */}
                  <div className="flex justify-between text-xs pt-3 border-t border-blue-200">
                    <span className="text-gray-600">Concession Step:</span>
                    <span className="font-medium text-gray-900">
                      ${adaptiveConfig.parameters.unit_price.concession_step.toFixed(2)}
                    </span>
                  </div>

                  {/* Weight */}
                  <div className="pt-3 border-t border-blue-200">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-700 font-medium">Weight (Importance)</span>
                      <span className="font-bold text-blue-700">
                        {(adaptiveConfig.parameters.unit_price.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${adaptiveConfig.parameters.unit_price.weight * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Terms */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Payment Terms
                  {deal && deal.round > 0 && (
                    <span className="ml-auto text-xs text-purple-600 animate-pulse">● Live</span>
                  )}
                </h3>
                <div className="space-y-4">
                  {adaptiveConfig.parameters.payment_terms.options.map((term: string) => {
                    const utilityValue = adaptiveConfig.parameters.payment_terms.utility[term as keyof typeof adaptiveConfig.parameters.payment_terms.utility];
                    const originalUtility = config.parameters.payment_terms.utility[term as keyof typeof config.parameters.payment_terms.utility];
                    const percentage = (utilityValue * 100).toFixed(0);
                    const isCurrentTerm = negotiationState?.currentVendorOffer.payment_terms === term;
                    const hasChanged = utilityValue !== originalUtility;

                    return (
                      <div key={term} className={isCurrentTerm ? "ring-2 ring-purple-400 rounded-lg p-2 bg-white" : ""}>
                        <div className="flex justify-between text-xs mb-2">
                          <span className={`font-medium ${isCurrentTerm ? "text-purple-900 font-bold" : "text-gray-700"}`}>
                            {term} {isCurrentTerm && "← Current"}
                          </span>
                          <div className="flex flex-col items-end">
                            <span className={`font-bold ${isCurrentTerm ? "text-purple-900" : "text-purple-700"}`}>
                              {percentage}% utility
                            </span>
                            {hasChanged && (
                              <span className="text-xs text-gray-500 line-through">
                                {(originalUtility * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              utilityValue >= 0.8
                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                : utilityValue >= 0.5
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                : 'bg-gradient-to-r from-orange-500 to-red-600'
                            }`}
                            style={{ width: `${utilityValue * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Weight */}
                  <div className="pt-3 border-t border-purple-200">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-700 font-medium">Weight (Importance)</span>
                      <span className="font-bold text-purple-700">
                        {(adaptiveConfig.parameters.payment_terms.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${adaptiveConfig.parameters.payment_terms.weight * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Thresholds */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Decision Thresholds
                  {deal && deal.round > 0 && (
                    <span className="ml-auto text-xs text-amber-600 animate-pulse">● Live</span>
                  )}
                </h3>
                <div className="space-y-4">
                  {/* Accept Threshold */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-700 font-medium">Accept Threshold</span>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-green-700">
                          {(adaptiveConfig.accept_threshold * 100).toFixed(0)}% utility
                        </span>
                        {config.accept_threshold !== adaptiveConfig.accept_threshold && (
                          <span className="text-xs text-gray-500 line-through">
                            {(config.accept_threshold * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-700"
                        style={{ width: `${adaptiveConfig.accept_threshold * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5">
                      Offers above this utility score will be accepted
                    </p>
                  </div>

                  {/* Walk Away Threshold */}
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-700 font-medium">Walk Away Threshold</span>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-red-700">
                          {(adaptiveConfig.walkaway_threshold * 100).toFixed(0)}% utility
                        </span>
                        {config.walkaway_threshold !== adaptiveConfig.walkaway_threshold && (
                          <span className="text-xs text-gray-500 line-through">
                            {(config.walkaway_threshold * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-700"
                        style={{ width: `${adaptiveConfig.walkaway_threshold * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5">
                      Offers below this utility score will be rejected
                    </p>
                  </div>

                  {/* Max Rounds */}
                  <div className="pt-3 border-t border-orange-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-xs text-gray-700 font-medium">Max Rounds</span>
                      </div>
                      <span className="text-sm font-bold text-amber-700">
                        {adaptiveConfig.max_rounds} rounds
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Negotiation will escalate after {adaptiveConfig.max_rounds} rounds
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              Loading config...
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
