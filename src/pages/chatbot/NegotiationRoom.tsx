import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
// @ts-ignore - hooks are JS files without type definitions
import { useDealActions } from "../../hooks/chatbot";
// @ts-ignore - components barrel export is a JS file without type definitions
import { ChatTranscript } from "../../components/chatbot/chat";
import { exportDealAsPDF, exportDealAsCSV } from "../../utils/exportDeal";
import chatbotService from "../../services/chatbot.service";
import type { DealSummaryResponse, ExtendedNegotiationConfig, BehavioralData } from "../../types/chatbot";
import { FiMessageSquare, FiFileText, FiTrendingUp, FiClock, FiCheckCircle, FiXCircle, FiDollarSign, FiCreditCard, FiTruck, FiClipboard, FiSettings, FiActivity, FiRefreshCw, FiAlertCircle, FiZap, FiChevronDown, FiChevronUp } from "react-icons/fi";
import {
  CollapsibleSection,
  ParameterRow,
  UnifiedUtilityBar,
  AiReasoningModal,
  type UnifiedRecommendationAction as RecommendationAction,
} from "../../components/chatbot/sidebar";

// Type for weighted utility data from API
interface WeightedUtilityData {
  totalUtility: number;
  totalUtilityPercent: number;
  parameterUtilities: Record<string, {
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
  }>;
  thresholds: {
    accept: number;
    escalate: number;
    walkAway: number;
  };
  recommendation: "ACCEPT" | "COUNTER" | "ESCALATE" | "WALK_AWAY";
  recommendationReason: string;
}

/**
 * NegotiationRoom Page
 * Main negotiation interface with chat and controls
 */
type TabType = "chat" | "summary";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function NegotiationRoom() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();

  // DEBUG: Log component mount and dealId
  console.log('[NegotiationRoom] MOUNTED with dealId:', dealId);

  const [showExportDropdown, setShowExportDropdown] = useState<boolean>(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [isInvalidDeal, setIsInvalidDeal] = useState<boolean>(false);
  const [summary, setSummary] = useState<DealSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Weighted utility state
  const [utilityData, setUtilityData] = useState<WeightedUtilityData | null>(null);
  const [_utilityLoading, setUtilityLoading] = useState<boolean>(false);

  // Behavioral analysis state (Adaptive Negotiation Engine)
  const [behavioralData, setBehavioralData] = useState<BehavioralData | null>(null);

  // AI Reasoning section state
  const [showAiReasoning, setShowAiReasoning] = useState<boolean>(true);
  const [reasoningModalIndex, setReasoningModalIndex] = useState<number | null>(null);

  // Accordion state for collapsible sidebar sections
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Status change notification banner
  const [statusBanner, setStatusBanner] = useState<{
    show: boolean;
    status: string;
    message: string;
  } | null>(null);

  // Track previous status for change detection
  const previousStatusRef = useRef<string | null>(null);
  const previousMessageCountRef = useRef<number>(0);

  // Validate dealId early - show error UI instead of redirecting (prevents white screen)
  useEffect(() => {
    if (!dealId || dealId === 'undefined' || !UUID_REGEX.test(dealId)) {
      setIsInvalidDeal(true);
    }
  }, [dealId]);

  const {
    deal,
    messages,
    config,
    context,
    loading,
    error,
    sending,
    resetLoading,
    canReset,
    pmTyping,
    reset,
    reload,
  } = useDealActions(dealId);

  // Compute back URL based on context - navigate to requisition's deals page if available
  // Using useMemo to make this reactive when context loads asynchronously
  const backUrl = useMemo(() => {
    if (context?.rfqId) {
      return `/chatbot/requisitions/${context.rfqId}`;
    }
    return "/chatbot";
  }, [context?.rfqId]);

  // Build per-round strategy info for ChatTranscript round dividers
  const roundStrategyInfo = useMemo(() => {
    if (!behavioralData?.roundHistory?.length) return undefined;
    const info: Record<number, { strategy?: string; utility?: number | null; isConverging?: boolean; isStalling?: boolean; isDiverging?: boolean }> = {};
    for (const rh of behavioralData.roundHistory) {
      info[rh.round] = {
        utility: rh.utility,
        // Strategy/convergence status applies to the latest state; show on all rounds for context
        strategy: behavioralData.strategy,
        isConverging: behavioralData.isConverging,
        isStalling: behavioralData.isStalling,
        isDiverging: behavioralData.isDiverging,
      };
    }
    // Only the latest round gets the current strategy label; earlier rounds just show utility
    const maxRound = Math.max(...behavioralData.roundHistory.map(r => r.round));
    for (const rh of behavioralData.roundHistory) {
      if (rh.round < maxRound) {
        info[rh.round] = { utility: rh.utility };
      }
    }
    return info;
  }, [behavioralData]);

  // Polling for real-time updates (every 5 seconds)
  useEffect(() => {
    // Only poll if deal is active (NEGOTIATING status)
    if (!deal || deal.status !== 'NEGOTIATING') {
      return;
    }

    const pollInterval = setInterval(() => {
      reload();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [deal?.status, reload]);

  // Detect status changes and show notifications
  useEffect(() => {
    if (!deal) return;

    const currentStatus = deal.status;
    const previousStatus = previousStatusRef.current;

    // Only notify if status changed (not on initial load)
    if (previousStatus && previousStatus !== currentStatus) {
      let message = '';
      let toastType: 'success' | 'error' | 'info' = 'info';

      switch (currentStatus) {
        case 'ACCEPTED':
          message = 'The vendor has accepted the deal!';
          toastType = 'success';
          break;
        case 'WALKED_AWAY':
          message = 'The negotiation has ended - AI Negotiator walked away.';
          toastType = 'error';
          break;
        case 'ESCALATED':
          message = 'The deal has been escalated for human review.';
          toastType = 'info';
          break;
        default:
          message = `Status changed to ${currentStatus}`;
      }

      // Show toast notification
      if (toastType === 'success') {
        toast.success(message, { duration: 5000 });
      } else if (toastType === 'error') {
        toast.error(message, { duration: 5000 });
      } else {
        toast(message, { duration: 5000, icon: '⚠️' });
      }

      // Show banner
      setStatusBanner({
        show: true,
        status: currentStatus,
        message,
      });
    }

    previousStatusRef.current = currentStatus;
  }, [deal?.status]);

  // Detect new messages and show subtle notification
  useEffect(() => {
    if (!messages) return;

    const currentCount = messages.length;
    const previousCount = previousMessageCountRef.current;

    // Only notify if new messages arrived (not on initial load)
    if (previousCount > 0 && currentCount > previousCount) {
      const newMessageCount = currentCount - previousCount;
      toast(`${newMessageCount} new message${newMessageCount > 1 ? 's' : ''} received`, {
        duration: 2000,
        icon: '💬',
      });
    }

    previousMessageCountRef.current = currentCount;
  }, [messages?.length]);

  const handleReset = async (): Promise<void> => {
    const confirmMessage =
      "⚠️ WARNING: This action cannot be undone!\n\n" +
      "Resetting this deal will:\n" +
      "• Delete ALL messages in this negotiation\n" +
      "• Reset the negotiation round to 0\n" +
      "• Require the vendor to start over\n\n" +
      "Are you absolutely sure you want to reset this deal?";

    if (window.confirm(confirmMessage)) {
      // Double confirmation for destructive action
      if (window.confirm("Final confirmation: Reset the entire negotiation?")) {
        try {
          await reset();
          toast.success("Deal has been reset. Vendor will need to start negotiation again.");
          setStatusBanner(null); // Clear any status banner
        } catch (err) {
          console.error("Failed to reset deal:", err);
          toast.error("Failed to reset deal. Please try again.");
        }
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

  // Fetch summary when summary tab is selected
  const fetchSummary = async (): Promise<void> => {
    if (!context) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const response = await chatbotService.getDealSummary(context);
      setSummary(response.data);
    } catch (err: any) {
      console.error("Failed to fetch deal summary:", err);
      setSummaryError(err.response?.data?.message || "Failed to load deal summary");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch summary when switching to summary tab
  useEffect(() => {
    if (activeTab === "summary" && !summary && !summaryLoading && context) {
      fetchSummary();
    }
  }, [activeTab, context]);

  // Fetch weighted utility data
  const fetchUtilityData = useCallback(async (): Promise<void> => {
    if (!context) return;
    setUtilityLoading(true);
    try {
      const response = await chatbotService.getDealUtility(context);
      setUtilityData(response.data);
    } catch (err) {
      console.error("Failed to fetch utility data:", err);
      // Silently fail - utility data is optional enhancement
    } finally {
      setUtilityLoading(false);
    }
  }, [context]);

  // Fetch behavioral data (Adaptive Negotiation Engine)
  const fetchBehavioralData = useCallback(async (): Promise<void> => {
    if (!context) return;
    try {
      const response = await chatbotService.getBehavioralData(context);
      setBehavioralData(response.data);
    } catch (err) {
      console.debug("Behavioral data not available:", err);
      // Silently fail - behavioral data is an optional enhancement
    }
  }, [context]);

  // Fetch utility data and behavioral data when deal round changes
  useEffect(() => {
    if (deal && deal.round > 0) {
      fetchUtilityData();
      fetchBehavioralData();
    }
  }, [deal?.round, fetchUtilityData, fetchBehavioralData]);

  const CURRENCY_SYMBOL_MAP: Record<string, string> = {
    USD: '$', INR: '₹', EUR: '€', GBP: '£', AUD: 'A$',
  };
  const dealCurrencyCode = (config as ExtendedNegotiationConfig | null)?.currency ?? 'USD';
  const dealCurrencySymbol = CURRENCY_SYMBOL_MAP[dealCurrencyCode] ?? dealCurrencyCode + ' ';

  const formatCurrency = (value: number | null): string => {
    if (value === null) return "N/A";
    return dealCurrencySymbol + new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Click outside to close dropdown
  useEffect(() => {
    if (!showExportDropdown) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportDropdown]);

  // Extract latest negotiation state from messages
  const getLatestNegotiationState = () => {
    // Safety check: ensure messages is an array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return null;
    }

    // Get the most recent Accordo message with explainability data
    const accordoMessages = messages
      .filter((m: any) => m.role === "ACCORDO" && m.explainabilityJson)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestAccordo = accordoMessages[0];

    if (!latestAccordo?.explainabilityJson) {
      return null;
    }

    const explainability = latestAccordo.explainabilityJson;

    // Safety check: ensure explainability has required properties
    if (!explainability.vendorOffer || !explainability.utilities || !explainability.decision) {
      return null;
    }

    // Get all vendor offers to track history
    const vendorOffers = messages
      .filter((m: any) => m.role === "VENDOR" && m.extractedOffer)
      .map((m: any) => m.extractedOffer);

    // Get all Accordo counter-offers
    const accordoOffers = messages
      .filter((m: any) => m.role === "ACCORDO" && m.counterOffer)
      .map((m: any) => m.counterOffer);

    return {
      currentVendorOffer: explainability.vendorOffer || {},
      currentAccordoOffer: explainability.decision?.counterOffer || latestAccordo.counterOffer || null,
      utilities: explainability.utilities || {},
      decision: explainability.decision || {},
      vendorOfferHistory: vendorOffers || [],
      accordoOfferHistory: accordoOffers || [],
    };
  };

  // Get negotiation state first
  const negotiationState = getLatestNegotiationState();

  // Helper to build human-readable reasoning text (defined before useMemo that uses it)
  const buildReasoningText = (
    decision: any,
    utilities: any,
    counterOffer: any,
    utilityScore: number | null
  ): string[] => {
    const reasons: string[] = [];

    // Add decision reasons
    if (decision.reasons && Array.isArray(decision.reasons)) {
      reasons.push(...decision.reasons);
    }

    // Add utility-based reasoning
    if (utilityScore !== null) {
      const utilityPercent = (utilityScore * 100).toFixed(0);
      if (utilityScore >= 0.7) {
        reasons.push(`Utility score of ${utilityPercent}% meets acceptance threshold`);
      } else if (utilityScore >= 0.5) {
        reasons.push(`Utility score of ${utilityPercent}% is in counter-offer zone`);
      } else if (utilityScore >= 0.3) {
        reasons.push(`Utility score of ${utilityPercent}% suggests escalation may be needed`);
      } else {
        reasons.push(`Utility score of ${utilityPercent}% is below walk-away threshold`);
      }
    }

    // Add counter-offer reasoning
    if (counterOffer) {
      if (counterOffer.total_price) {
        reasons.push(`Counter-offered price: ${dealCurrencySymbol}${counterOffer.total_price.toLocaleString()}`);
      }
      if (counterOffer.payment_terms) {
        reasons.push(`Counter-offered terms: ${counterOffer.payment_terms}`);
      }
    }

    // Add utility breakdown if available
    if (utilities.priceUtility !== undefined && utilities.priceUtility !== null) {
      const priceUtil = (utilities.priceUtility * 100).toFixed(0);
      reasons.push(`Price utility: ${priceUtil}%`);
    }
    if (utilities.termsUtility !== undefined && utilities.termsUtility !== null) {
      const termsUtil = (utilities.termsUtility * 100).toFixed(0);
      reasons.push(`Terms utility: ${termsUtil}%`);
    }

    return reasons.length > 0 ? reasons : ['Analyzing vendor offer...'];
  };

  // Extract AI reasoning timeline from ACCORDO messages
  const getAiReasoningTimeline = useMemo(() => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return [];
    }

    // Get all ACCORDO messages with explainability data, sorted by round
    const accordoMessages = messages
      .filter((m: any) => m.role === "ACCORDO" && (m.explainabilityJson || m.engineDecision))
      .sort((a: any, b: any) => (a.round || 0) - (b.round || 0));

    return accordoMessages.map((msg: any) => {
      const explainability = msg.explainabilityJson || {};
      const decision = explainability.decision || msg.engineDecision || {};
      const utilities = explainability.utilities || {};
      const counterOffer = decision.counterOffer || msg.counterOffer;

      // Extract MESO info if present in the message
      const mesoInfo = msg.mesoOptions || null;

      // Build reasoning object for this round
      return {
        round: msg.round || 0,
        timestamp: msg.createdAt,
        action: decision.action || msg.decisionAction || 'COUNTER',
        utilityScore: msg.utilityScore || utilities.total || null,
        reasons: decision.reasons || [],
        counterOffer: counterOffer,
        mesoOptions: mesoInfo,
        // Build human-readable reasoning
        reasoning: buildReasoningText(decision, utilities, counterOffer, msg.utilityScore),
      };
    });
  }, [messages]);

  // Calculate adaptive config based on negotiation progress
  const getAdaptiveConfig = () => {
    // Safety check: ensure we have config
    if (!config) return null;

    // If no negotiation state, return base config
    if (!negotiationState) return config;

    // Safety check: ensure negotiationState has required properties
    const vendorOfferHistory = negotiationState.vendorOfferHistory || [];
    const accordoOfferHistory = negotiationState.accordoOfferHistory || [];
    const round = deal?.round || 0;

    // Safety check: ensure config has required parameters structure
    if (!config.parameters?.unit_price || !config.parameters?.payment_terms) {
      return config;
    }

    // Create adaptive config by adjusting parameters based on negotiation progress
    const adaptiveConfig = JSON.parse(JSON.stringify(config)); // Deep clone to avoid mutation

    // Adaptive Price Parameters
    if (vendorOfferHistory.length > 0 && accordoOfferHistory.length > 0) {
      // Get price trends
      const vendorPrices = vendorOfferHistory
        .map((o: any) => o?.unit_price)
        .filter((p: any) => p != null);

      const accordoPrices = accordoOfferHistory
        .map((o: any) => o?.unit_price)
        .filter((p: any) => p != null);

      if (vendorPrices.length > 0 && accordoPrices.length > 0) {
        // Calculate convergence - are we getting closer?
        // These values used for debugging convergence
        // const _latestVendorPrice = vendorPrices[vendorPrices.length - 1];
        // const _latestAccordoPrice = accordoPrices[accordoPrices.length - 1];

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
      (config.accept_threshold || 0.7) - (roundProgress * 0.15),
      0.5 // Never go below 50%
    );

    // Walkaway threshold decreases as we get more desperate (inverse relationship)
    adaptiveConfig.walkaway_threshold = Math.max(
      (config.walkaway_threshold || 0.3) - (roundProgress * 0.1),
      0.2 // Never go below 20%
    );

    // Adaptive Payment Terms Weights - based on what vendor offers
    if (negotiationState.currentVendorOffer?.payment_terms && config.parameters.payment_terms?.utility) {
      // If vendor consistently offers good terms, increase weight of terms
      const termOffers = vendorOfferHistory
        .map((o: any) => o?.payment_terms)
        .filter((t: any) => t != null);

      if (termOffers.length > 0 && termOffers.filter((t: any) => t === "Net 30").length > termOffers.length * 0.6) {
        // Vendor prefers Net 30, adjust our preference
        const currentNet30Utility = config.parameters.payment_terms.utility["Net 30"] || 0.7;
        adaptiveConfig.parameters.payment_terms.utility["Net 30"] = Math.min(currentNet30Utility * 1.1, 1);
      }
    }

    return adaptiveConfig;
  };

  const adaptiveConfig = getAdaptiveConfig();

  // Extract wizardConfig and parameterWeights from extended config
  const extendedConfig = config as ExtendedNegotiationConfig | null;
  const wizardConfig = extendedConfig?.wizardConfig;
  const parameterWeights = extendedConfig?.parameterWeights || {};

  // Helper to get weight for a section (sums all parameter weights in that section)
  const getSectionWeight = useMemo(() => {
    return (section: 'price' | 'payment' | 'delivery' | 'contract' | 'custom') => {
      const weights = parameterWeights;
      switch (section) {
        case 'price':
          return (weights.targetUnitPrice || 0) + (weights.maxAcceptablePrice || 0) + (weights.minOrderQuantity || 0);
        case 'payment':
          return (weights.paymentTermsRange || 0);
        case 'delivery':
          return (weights.requiredDate || 0) + (weights.partialDelivery || 0);
        case 'contract':
          return (weights.warrantyPeriod || 0) + (weights.lateDeliveryPenalty || 0);
        case 'custom':
          return Object.entries(weights)
            .filter(([key]) => key.startsWith('custom_'))
            .reduce((sum, [, val]) => sum + (val || 0), 0);
        default:
          return 0;
      }
    };
  }, [parameterWeights]);

  // Check if section has any displayable (non-zero) values
  // Falls back to engine config parameters if wizardConfig is not available
  const sectionHasContent = useMemo(() => {
    const engineParams = adaptiveConfig?.parameters;
    return {
      // Price: check wizardConfig first, then engine config
      price: !!(wizardConfig?.priceQuantity?.targetUnitPrice ||
                wizardConfig?.priceQuantity?.maxAcceptablePrice ||
                wizardConfig?.priceQuantity?.minOrderQuantity ||
                engineParams?.unit_price?.target ||
                engineParams?.unit_price?.anchor),
      // Payment: check wizardConfig first, then engine config options
      payment: !!(wizardConfig?.paymentTerms?.minDays ||
                  wizardConfig?.paymentTerms?.maxDays ||
                  engineParams?.payment_terms?.options?.length),
      // Delivery: only wizardConfig has delivery info
      delivery: !!(wizardConfig?.delivery?.requiredDate ||
                   wizardConfig?.delivery?.preferredDate),
      // Contract: only wizardConfig has contract SLA info
      contract: !!(wizardConfig?.contractSla?.warrantyPeriod ||
                   wizardConfig?.contractSla?.lateDeliveryPenaltyPerDay),
      // Custom: only wizardConfig has custom parameters
      custom: !!(wizardConfig?.customParameters && wizardConfig.customParameters.length > 0),
    };
  }, [wizardConfig, adaptiveConfig]);

  // Helper to get recommendation action type
  const getRecommendationAction = (): RecommendationAction => {
    if (utilityData?.recommendation) {
      return utilityData.recommendation as RecommendationAction;
    }
    // Fallback based on utility percentage
    const utility = utilityData?.totalUtilityPercent || 0;
    if (utility >= 70) return 'ACCEPT';
    if (utility >= 50) return 'COUNTER';
    if (utility >= 30) return 'ESCALATE';
    return 'WALK_AWAY';
  };

  // Helper to get utility info for a specific parameter (for display in ParameterRow)
  const getParamUtilityInfo = useCallback((parameterId: string) => {
    if (!utilityData?.parameterUtilities || !utilityData.parameterUtilities[parameterId]) {
      return undefined;
    }
    const paramUtil = utilityData.parameterUtilities[parameterId];
    return {
      utility: paramUtil.utility,
      contribution: paramUtil.contribution,
      status: paramUtil.status,
      currentValue: paramUtil.currentValue,
    };
  }, [utilityData]);

  // Early return for invalid deal ID (all hooks have been called above)
  if (isInvalidDeal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-bg">
        <div className="text-center p-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-800 dark:text-dark-text font-medium mb-2">Invalid Deal ID</p>
          <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">
            The deal ID &quot;{dealId}&quot; is not valid.
          </p>
          <button
            onClick={() => navigate('/chatbot')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Negotiations
          </button>
        </div>
      </div>
    );
  }

  if (loading && !deal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-secondary">Loading deal...</p>
        </div>
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-bg">
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
            onClick={() => navigate(backUrl)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Deals
          </button>
        </div>
      </div>
    );
  }

  // Check if deal is completed or escalated - show read-only summary
  // ESCALATED deals are also read-only as they're waiting for human review
  const isCompletedDeal = deal?.status === 'ACCEPTED' || deal?.status === 'WALKED_AWAY' || deal?.status === 'ESCALATED';

  // Fallback: If loading is done but deal is still null (no error set), show error state
  if (!loading && !error && !deal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark-bg">
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
          <p className="text-gray-800 dark:text-dark-text font-medium mb-2">Deal not found</p>
          <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">
            The deal may have been deleted or you don&apos;t have access to it.
          </p>
          <button
            onClick={() => navigate("/chatbot/requisitions")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Requisitions
          </button>
        </div>
      </div>
    );
  }

  if (isCompletedDeal) {
    return (
      <div className="flex flex-col overflow-y-auto bg-gray-100 dark:bg-dark-bg" style={{ height: 'calc(100vh - 2rem)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 pt-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left - Back button */}
            <button
              onClick={() => navigate(backUrl)}
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

            <ChatTranscript messages={messages} isProcessing={false} pmMode={true} roundStrategyInfo={roundStrategyInfo} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-dark-bg overflow-hidden" style={{ height: 'calc(100vh - 2rem)' }}>
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Back button */}
          <button
            onClick={() => navigate(backUrl)}
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
                <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Round {deal.round}
                  {behavioralData?.dynamicRounds && (
                    <span className="text-gray-400">/{behavioralData.dynamicRounds.softMax}</span>
                  )}
                  {behavioralData?.dynamicRounds?.extendLikely && deal.round >= (behavioralData.dynamicRounds.softMax * 0.7) && (
                    <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">(extending — converging)</span>
                  )}
                  {behavioralData?.isStalling && deal.round >= (behavioralData?.dynamicRounds?.softMax ?? Infinity) * 0.5 && (
                    <span className="ml-1.5 text-xs text-orange-600 dark:text-orange-400 font-medium">(may escalate — stalling)</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex gap-2">
            <button
              onClick={async () => {
                try {
                  await reload();
                  toast.success("Data refreshed");
                } catch {
                  toast.error("Failed to refresh");
                }
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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
        {/* Main Area - Left column with tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex-shrink-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "chat"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <FiMessageSquare className="w-4 h-4" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "summary"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <FiFileText className="w-4 h-4" />
                Summary
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "chat" ? (
            <>
              {/* Status Change Banner */}
              {statusBanner?.show && (
                <div
                  className={`flex-shrink-0 px-4 py-3 flex items-center justify-between ${
                    statusBanner.status === "ACCEPTED"
                      ? "bg-green-100 border-b border-green-200"
                      : statusBanner.status === "WALKED_AWAY"
                      ? "bg-red-100 border-b border-red-200"
                      : statusBanner.status === "ESCALATED"
                      ? "bg-orange-100 border-b border-orange-200"
                      : "bg-blue-100 border-b border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {statusBanner.status === "ACCEPTED" ? (
                      <FiCheckCircle className="w-5 h-5 text-green-600" />
                    ) : statusBanner.status === "WALKED_AWAY" ? (
                      <FiXCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-orange-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        statusBanner.status === "ACCEPTED"
                          ? "text-green-800"
                          : statusBanner.status === "WALKED_AWAY"
                          ? "text-red-800"
                          : "text-orange-800"
                      }`}
                    >
                      {statusBanner.message}
                    </span>
                  </div>
                  <button
                    onClick={() => setStatusBanner(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiXCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Messages - Scrollable (PM Read-Only View) */}
              <div className="flex-1 px-6 py-6 overflow-y-auto">
                <ChatTranscript
                  messages={messages}
                  isProcessing={pmTyping || sending}
                  processingType={pmTyping ? "analyzing" : "vendor-typing"}
                  pmMode={true}
                  roundStrategyInfo={roundStrategyInfo}
                />
              </div>

              {/* Read-Only Notice - Fixed at bottom (replaces Composer) */}
              <div className="flex-shrink-0 bg-gray-50 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border px-6 py-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-dark-text-secondary">
                  <FiMessageSquare className="w-4 h-4" />
                  <span>
                    {deal?.status === "NEGOTIATING"
                      ? "Watching live negotiation. The AI Negotiator is handling this deal on your behalf."
                      : deal?.status === "ACCEPTED"
                      ? "This negotiation has been completed successfully."
                      : deal?.status === "WALKED_AWAY"
                      ? "This negotiation has ended."
                      : deal?.status === "ESCALATED"
                      ? "This deal has been escalated for human review."
                      : "Viewing negotiation history."}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Summary Tab Content */
            <div className="flex-1 px-6 py-6 overflow-y-auto">
              {summaryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-dark-text-secondary">Loading summary...</p>
                  </div>
                </div>
              ) : summaryError ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-2">
                    <FiXCircle className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 dark:text-dark-text-secondary">{summaryError}</p>
                  <button
                    onClick={fetchSummary}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : summary ? (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Deal Status Banner */}
                  <div className={`rounded-xl p-5 ${
                    summary.deal.status === "ACCEPTED"
                      ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      : summary.deal.status === "WALKED_AWAY"
                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                      : summary.deal.status === "ESCALATED"
                      ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                      : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                  }`}>
                    <div className="flex items-center gap-3">
                      {summary.deal.status === "ACCEPTED" ? (
                        <FiCheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      ) : summary.deal.status === "WALKED_AWAY" ? (
                        <FiXCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      ) : (
                        <FiMessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      )}
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          summary.deal.status === "ACCEPTED"
                            ? "text-green-800 dark:text-green-300"
                            : summary.deal.status === "WALKED_AWAY"
                            ? "text-red-800 dark:text-red-300"
                            : "text-blue-800 dark:text-blue-300"
                        }`}>
                          {summary.deal.status === "ACCEPTED"
                            ? "Deal Accepted"
                            : summary.deal.status === "WALKED_AWAY"
                            ? "Deal Walked Away"
                            : summary.deal.status === "ESCALATED"
                            ? "Deal Escalated"
                            : "Negotiation In Progress"
                          }
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {summary.deal.vendorName} • {summary.deal.companyName || summary.deal.vendorEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Final Offer Card */}
                  <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-5">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide mb-4">
                      {summary.deal.status === "NEGOTIATING" ? "Current Offer" : "Final Offer"}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Unit Price</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-dark-text">
                          {formatCurrency(summary.finalOffer.unitPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Total Value</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-dark-text">
                          {formatCurrency(summary.finalOffer.totalValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Payment Terms</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-dark-text">
                          {summary.finalOffer.paymentTerms || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Delivery Date</p>
                        <p className="text-lg font-medium text-gray-900 dark:text-dark-text">
                          {summary.finalOffer.deliveryDate
                            ? new Date(summary.finalOffer.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "N/A"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                      <FiTrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {summary.metrics.utilityScore !== null
                          ? `${Math.round(summary.metrics.utilityScore * 100)}%`
                          : "N/A"
                        }
                      </p>
                      <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Utility Score</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                      <FiMessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {summary.metrics.totalRounds}/{summary.metrics.maxRounds}
                      </p>
                      <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Rounds Used</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                      <FiClock className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {summary.metrics.durationDays !== null
                          ? `${summary.metrics.durationDays}d`
                          : "Active"
                        }
                      </p>
                      <p className="text-xs text-gray-600/70 dark:text-gray-400/70">Duration</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  {summary.timeline.length > 0 && (
                    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border p-5">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide mb-4">
                        Negotiation Timeline
                      </h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {summary.timeline.map((item, index) => (
                          <div key={index} className="flex items-start gap-3 text-sm">
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                              {item.round}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-600 dark:text-dark-text-secondary truncate">
                                <span className="font-medium text-gray-900 dark:text-dark-text">Vendor:</span> {item.vendorOffer}
                              </p>
                              <p className="text-gray-600 dark:text-dark-text-secondary truncate">
                                <span className="font-medium text-blue-600 dark:text-blue-400">Accordo:</span> {item.accordoResponse}
                              </p>
                            </div>
                            <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded ${
                              item.action === "ACCEPT"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                : item.action === "COUNTER"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
                            }`}>
                              {item.action}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-gray-500 dark:text-dark-text-secondary flex justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
                    <span>Started: {formatDate(summary.metrics.startedAt)}</span>
                    <span>
                      {summary.metrics.completedAt
                        ? `Completed: ${formatDate(summary.metrics.completedAt)}`
                        : "In Progress"
                      }
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-dark-text-secondary">No summary available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Right column (Fixed width, independently scrollable) */}
        <div className="hidden lg:flex lg:flex-col w-[324px] bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-dark-surface dark:via-dark-surface dark:to-dark-surface border-l border-indigo-100 dark:border-dark-border flex-shrink-0 overflow-hidden">
          {/* Sidebar Header - Sticky with blue/indigo theme */}
          <div className="flex-shrink-0 px-6 pt-5 pb-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 shadow-md">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FiActivity className="w-5 h-5" />
              Negotiation Dashboard
            </h2>
            <p className="text-xs text-indigo-200 mt-0.5">Real-time utility monitoring</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 sidebar-scroll">

            {config && adaptiveConfig ? (
            <div className="space-y-4">
              {/* 1. Unified Utility & Threshold Bar */}
              <UnifiedUtilityBar
                percentage={utilityData?.totalUtilityPercent || (negotiationState?.utilities?.total ? (negotiationState?.utilities?.total ?? 0) * 100 : 0)}
                recommendation={getRecommendationAction()}
                thresholds={{
                  accept: adaptiveConfig.accept_threshold || 0.7,
                  escalate: 0.5,
                  walkAway: adaptiveConfig.walkaway_threshold || 0.3,
                }}
                dealStatus={deal?.status as "NEGOTIATING" | "ACCEPTED" | "WALKED_AWAY" | "ESCALATED" | undefined}
                recommendationReason={utilityData?.recommendationReason}
              />

              {/* AI Reasoning Section - Timeline of MESO decisions */}
              {deal && deal.round > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-emerald-900/20 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-800 overflow-hidden">
                  {/* Header - Collapsible */}
                  <button
                    onClick={() => setShowAiReasoning(!showAiReasoning)}
                    className="w-full flex items-center justify-between p-4 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-md">
                        <FiZap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">AI Reasoning</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                        {getAiReasoningTimeline.length} rounds
                      </span>
                    </div>
                    {showAiReasoning ? (
                      <FiChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>

                  {/* Timeline Content */}
                  {showAiReasoning && (
                    <div className="px-4 pb-4 max-h-80 overflow-y-auto">
                      {getAiReasoningTimeline.length === 0 ? (
                        <div className="text-center text-sm text-emerald-600 dark:text-emerald-400 py-4">
                          Waiting for first MESO offer...
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-emerald-200 dark:bg-emerald-700" />

                          {/* Timeline items - show most recent first */}
                          {[...getAiReasoningTimeline].reverse().map((item: any, index: number) => (
                            <div
                              key={item.round || index}
                              className="relative pl-8 pb-4 last:pb-0 cursor-pointer hover:bg-emerald-100/40 dark:hover:bg-emerald-900/20 rounded-md transition-colors"
                              onClick={() => setReasoningModalIndex(getAiReasoningTimeline.length - 1 - index)}
                            >
                              {/* Timeline dot */}
                              <div className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                                item.action === 'ACCEPT' ? 'bg-green-500' :
                                item.action === 'COUNTER' ? 'bg-blue-500' :
                                item.action === 'ESCALATE' ? 'bg-orange-500' :
                                item.action === 'WALK_AWAY' ? 'bg-red-500' :
                                'bg-gray-400'
                              }`} />

                              {/* Round header */}
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                                  Round {item.round}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  item.action === 'ACCEPT' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                  item.action === 'COUNTER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                  item.action === 'ESCALATE' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                  item.action === 'WALK_AWAY' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {item.action?.replace('_', ' ')}
                                </span>
                                {item.utilityScore && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                    {(item.utilityScore * 100).toFixed(0)}% utility
                                  </span>
                                )}
                              </div>

                              {/* Reasoning points */}
                              <div className="space-y-1">
                                {item.reasoning.slice(0, 4).map((reason: string, rIndex: number) => (
                                  <div key={rIndex} className="flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                                    <span className="text-emerald-400 mt-0.5">•</span>
                                    <span>{reason}</span>
                                  </div>
                                ))}
                                {item.reasoning.length > 4 && (
                                  <div className="text-[10px] text-emerald-500 dark:text-emerald-400 italic underline decoration-dotted">
                                    +{item.reasoning.length - 4} more insights
                                  </div>
                                )}
                              </div>

                              {/* MESO Options Summary (if available) */}
                              {item.mesoOptions && item.mesoOptions.length > 0 && (
                                <div className="mt-2 p-2 bg-white/50 dark:bg-gray-800/30 rounded border border-emerald-100 dark:border-emerald-800">
                                  <div className="text-[10px] font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                                    MESO Options Offered:
                                  </div>
                                  <div className="space-y-1">
                                    {item.mesoOptions.map((opt: any, oIndex: number) => (
                                      <div key={oIndex} className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                        <span className="font-medium">{opt.label}:</span>{' '}
                                        {opt.offer?.total_price ? `${dealCurrencySymbol}${opt.offer.total_price.toLocaleString()}` : 'N/A'}{' '}
                                        {opt.emphasis && `(${Array.isArray(opt.emphasis) ? opt.emphasis.join(', ') : opt.emphasis})`}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Current Decision Summary */}
                      {utilityData?.recommendationReason && (
                        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                          <div className="text-[10px] font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                            Current Analysis:
                          </div>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 italic">
                            {utilityData.recommendationReason}
                          </p>
                        </div>
                      )}

                      {/* Behavioral Insights */}
                      {behavioralData && (
                        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                          <div className="text-[10px] font-medium text-emerald-800 dark:text-emerald-200 mb-1">
                            Behavioral Insights:
                          </div>
                          <div className="space-y-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                            {behavioralData.isConverging && (
                              <div>✓ Negotiation is converging - vendor moving toward agreement</div>
                            )}
                            {behavioralData.isStalling && (
                              <div>⚠ Vendor appears to be stalling - limited progress</div>
                            )}
                            {behavioralData.isDiverging && (
                              <div>✗ Gap is widening - may need to adjust strategy</div>
                            )}
                            {behavioralData.latestSentiment && (
                              <div>Vendor sentiment: {behavioralData.latestSentiment}</div>
                            )}
                            {behavioralData.strategy && (
                              <div>AI strategy: {behavioralData.strategy}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Collapsible Parameter Sections (Accordion) */}

              {/* Price Parameters */}
              {sectionHasContent.price && (
                <CollapsibleSection
                  title="Price Parameters"
                  icon={<FiDollarSign className="w-4 h-4" />}
                  weight={getSectionWeight('price')}
                  isOpen={openSection === 'price'}
                  onToggle={() => setOpenSection(openSection === 'price' ? null : 'price')}
                  gradientColors="from-blue-50 to-indigo-50"
                  borderColor="border-blue-200"
                  iconBgColor="bg-blue-100 dark:bg-blue-900/40"
                  iconColor="text-blue-600 dark:text-blue-400"
                  isLive={(deal?.round ?? 0) > 0}
                >
                  <div className="space-y-2">
                    {/* Target Unit Price: wizardConfig fallback to engine target - with range visualization */}
                    <ParameterRow
                      label="Target Unit Price"
                      value={wizardConfig?.priceQuantity?.targetUnitPrice || adaptiveConfig?.parameters?.unit_price?.target}
                      type="currency"
                      currencyCode={dealCurrencyCode}
                      utilityInfo={getParamUtilityInfo('unit_price')}
                      rangeMin={adaptiveConfig?.parameters?.unit_price?.anchor}
                      rangeMax={wizardConfig?.priceQuantity?.maxAcceptablePrice || adaptiveConfig?.parameters?.unit_price?.max_acceptable}
                    />
                    {/* Max Acceptable Price: wizardConfig fallback to engine max */}
                    <ParameterRow
                      label="Max Acceptable Price"
                      value={wizardConfig?.priceQuantity?.maxAcceptablePrice || adaptiveConfig?.parameters?.unit_price?.max_acceptable}
                      type="currency"
                      currencyCode={dealCurrencyCode}
                    />
                    {/* Min Order Quantity: only from wizardConfig */}
                    <ParameterRow
                      label="Min Order Quantity"
                      value={wizardConfig?.priceQuantity?.minOrderQuantity}
                      type="number"
                      utilityInfo={getParamUtilityInfo('quantity')}
                    />
                    {/* Preferred Quantity: only from wizardConfig */}
                    <ParameterRow
                      label="Preferred Quantity"
                      value={wizardConfig?.priceQuantity?.preferredQuantity}
                      type="number"
                    />
                    {/* Anchor Price from engine config */}
                    <ParameterRow
                      label="Anchor Price"
                      value={adaptiveConfig?.parameters?.unit_price?.anchor}
                      type="currency"
                      currencyCode={dealCurrencyCode}
                      highlight
                    />
                    {/* Concession Step from engine config */}
                    <ParameterRow
                      label="Concession Step"
                      value={adaptiveConfig?.parameters?.unit_price?.concession_step}
                      type="currency"
                      currencyCode={dealCurrencyCode}
                    />
                  </div>
                </CollapsibleSection>
              )}

              {/* Payment Terms */}
              {sectionHasContent.payment && (
                <CollapsibleSection
                  title="Payment Terms"
                  icon={<FiCreditCard className="w-4 h-4" />}
                  weight={getSectionWeight('payment')}
                  isOpen={openSection === 'payment'}
                  onToggle={() => setOpenSection(openSection === 'payment' ? null : 'payment')}
                  gradientColors="from-purple-50 to-pink-50"
                  borderColor="border-purple-200"
                  iconBgColor="bg-purple-100 dark:bg-purple-900/40"
                  iconColor="text-purple-600 dark:text-purple-400"
                  isLive={(deal?.round ?? 0) > 0}
                >
                  <div className="space-y-2">
                    {/* Payment Terms from wizardConfig - user-entered values */}
                    {/* Payment Terms Range with utility info */}
                    {wizardConfig?.paymentTerms?.minDays && wizardConfig?.paymentTerms?.maxDays && (
                      <ParameterRow
                        label="Payment Terms Range"
                        value={`${wizardConfig.paymentTerms.minDays} - ${wizardConfig.paymentTerms.maxDays} days`}
                        type="text"
                        utilityInfo={getParamUtilityInfo('payment_terms')}
                      />
                    )}
                    {/* Min Payment Days - only show if no range */}
                    {(!wizardConfig?.paymentTerms?.maxDays) && (
                      <ParameterRow
                        label="Minimum Payment Days"
                        value={wizardConfig?.paymentTerms?.minDays}
                        type="days"
                        utilityInfo={getParamUtilityInfo('payment_terms')}
                      />
                    )}
                    {/* Max Payment Days - only show if no range */}
                    {(!wizardConfig?.paymentTerms?.minDays) && (
                      <ParameterRow
                        label="Maximum Payment Days"
                        value={wizardConfig?.paymentTerms?.maxDays}
                        type="days"
                      />
                    )}
                    {/* Accepted Payment Methods */}
                    {wizardConfig?.paymentTerms?.acceptedMethods && wizardConfig.paymentTerms.acceptedMethods.length > 0 && (
                      <ParameterRow
                        label="Accepted Methods"
                        value={wizardConfig.paymentTerms.acceptedMethods.map((method: string) => {
                          // Format method names for display
                          switch (method) {
                            case 'BANK_TRANSFER': return 'Bank Transfer';
                            case 'CREDIT': return 'Credit';
                            case 'LC': return 'Letter of Credit';
                            default: return method;
                          }
                        }).join(', ')}
                        type="text"
                      />
                    )}
                    {/* Show message if no wizard config payment terms */}
                    {!wizardConfig?.paymentTerms && (
                      <div className="text-xs text-gray-500 italic py-2">
                        No payment terms configured
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* Delivery Terms */}
              {sectionHasContent.delivery && (
                <CollapsibleSection
                  title="Delivery Terms"
                  icon={<FiTruck className="w-4 h-4" />}
                  weight={getSectionWeight('delivery')}
                  isOpen={openSection === 'delivery'}
                  onToggle={() => setOpenSection(openSection === 'delivery' ? null : 'delivery')}
                  gradientColors="from-cyan-50 to-sky-50"
                  borderColor="border-cyan-200"
                  iconBgColor="bg-cyan-100 dark:bg-cyan-900/40"
                  iconColor="text-cyan-600 dark:text-cyan-400"
                  isLive={(deal?.round ?? 0) > 0}
                >
                  <div className="space-y-2">
                    <ParameterRow
                      label="Required Date"
                      value={wizardConfig?.delivery?.requiredDate}
                      type="date"
                      utilityInfo={getParamUtilityInfo('delivery_date')}
                    />
                    <ParameterRow
                      label="Preferred Date"
                      value={wizardConfig?.delivery?.preferredDate}
                      type="date"
                    />
                    <ParameterRow
                      label="Delivery Location"
                      value={wizardConfig?.delivery?.locationAddress}
                      type="text"
                    />
                    <ParameterRow
                      label="Partial Delivery"
                      value={wizardConfig?.delivery?.partialDelivery?.allowed}
                      type="boolean"
                    />
                    {wizardConfig?.delivery?.partialDelivery?.allowed && (
                      <>
                        <ParameterRow
                          label="Partial Type"
                          value={wizardConfig.delivery.partialDelivery.type}
                          type="text"
                        />
                        <ParameterRow
                          label="Min Partial Value"
                          value={wizardConfig.delivery.partialDelivery.minValue}
                          type="currency"
                          currencyCode={dealCurrencyCode}
                        />
                      </>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* Contract & SLA */}
              {sectionHasContent.contract && (
                <CollapsibleSection
                  title="Contract & SLA"
                  icon={<FiClipboard className="w-4 h-4" />}
                  weight={getSectionWeight('contract')}
                  isOpen={openSection === 'contract'}
                  onToggle={() => setOpenSection(openSection === 'contract' ? null : 'contract')}
                  gradientColors="from-amber-50 to-orange-50"
                  borderColor="border-amber-200"
                  iconBgColor="bg-amber-100 dark:bg-amber-900/40"
                  iconColor="text-amber-600 dark:text-amber-400"
                  isLive={(deal?.round ?? 0) > 0}
                >
                  <div className="space-y-2">
                    <ParameterRow
                      label="Warranty Period"
                      value={wizardConfig?.contractSla?.warrantyPeriod}
                      type="text"
                    />
                    <ParameterRow
                      label="Defect Liability"
                      value={wizardConfig?.contractSla?.defectLiabilityMonths}
                      type="days"
                    />
                    <ParameterRow
                      label="Late Delivery Penalty"
                      value={wizardConfig?.contractSla?.lateDeliveryPenaltyPerDay}
                      type="percentage"
                    />
                    {wizardConfig?.contractSla?.maxPenaltyCap && (
                      <ParameterRow
                        label="Max Penalty Cap"
                        value={wizardConfig.contractSla.maxPenaltyCap.type === 'PERCENTAGE'
                          ? `${wizardConfig.contractSla.maxPenaltyCap.value}%`
                          : `$${wizardConfig.contractSla.maxPenaltyCap.value}`}
                        type="text"
                      />
                    )}
                    {wizardConfig?.contractSla?.qualityStandards && wizardConfig.contractSla.qualityStandards.length > 0 && (
                      <ParameterRow
                        label="Quality Standards"
                        value={wizardConfig.contractSla.qualityStandards.join(', ')}
                        type="text"
                      />
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* Custom Parameters */}
              {sectionHasContent.custom && (
                <CollapsibleSection
                  title="Custom Parameters"
                  icon={<FiSettings className="w-4 h-4" />}
                  weight={getSectionWeight('custom')}
                  isOpen={openSection === 'custom'}
                  onToggle={() => setOpenSection(openSection === 'custom' ? null : 'custom')}
                  gradientColors="from-slate-50 to-gray-100"
                  borderColor="border-gray-300"
                  iconBgColor="bg-slate-200 dark:bg-slate-700/40"
                  iconColor="text-slate-600 dark:text-slate-400"
                  isLive={(deal?.round ?? 0) > 0}
                >
                  <div className="space-y-2">
                    {wizardConfig?.customParameters
                      ?.filter((param) => param.includeInNegotiation)
                      .map((param, index) => (
                        <ParameterRow
                          key={index}
                          label={param.name}
                          value={param.targetValue}
                          type={param.type === 'NUMBER' ? 'number' : 'text'}
                        />
                      ))}
                  </div>
                </CollapsibleSection>
              )}

            </div>
          ) : (
            <div className="text-center text-indigo-600 text-sm py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
              <p className="font-medium">Loading dashboard...</p>
              <p className="text-xs text-indigo-400 mt-1">Fetching negotiation parameters</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* AI Reasoning Detail Modal */}
      <AiReasoningModal
        isOpen={reasoningModalIndex !== null}
        onClose={() => setReasoningModalIndex(null)}
        timeline={getAiReasoningTimeline}
        currentIndex={reasoningModalIndex ?? 0}
        onNavigate={setReasoningModalIndex}
      />
    </div>
  );
}
