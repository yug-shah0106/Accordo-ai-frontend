/**
 * Composer Component
 *
 * Message input with quick scenario chips for negotiation.
 *
 * Updated January 2026:
 * - Uses wizard config for dynamic scenario generation
 * - Removed WALK_AWAY scenario (per user request)
 * - Uses context object for API calls
 * - Hybrid approach: frontend generates initial, backend refines
 * - Added vendor mode for AI-PM negotiation (vendor perspective)
 * - Now displays delivery terms alongside price and payment terms
 * - Structured suggestions with price, terms, delivery, and emphasis
 * - Interactive emphasis chips for filtering suggestions by priority (price/terms/delivery)
 * - Full multi-select emphasis support with weighted blend
 * - Scale + glow visual feedback on selected chips
 * - Emphasis selection persists across scenario changes
 */

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { DealStatus, DealContext, WizardConfig, StructuredSuggestion, ScenarioSuggestions, SuggestionEmphasis } from '../../../types';
import { chatbotService } from '../../../services/chatbot.service';
import {
  generateScenarioMessages,
  getScenarioColorClass,
  generateVendorFallbackScenarios,
  convertVendorScenariosToConfig,
  generateEmphasisAwareFallback,
  type ScenarioType,
  type ScenarioConfig,
  type VendorScenario,
  type OfferChip,
} from '../../../utils/scenarioGenerator';

interface ComposerProps {
  onSend: (message: string) => void;
  inputText: string;
  onInputChange: (text: string) => void;
  sending: boolean;
  dealStatus?: DealStatus;
  canSend?: boolean;
  dealId?: string;
  context?: DealContext | null;  // For API calls
  wizardConfig?: WizardConfig | null;  // For scenario generation
  currentRound?: number;
  vendorMode?: boolean;  // Enable vendor perspective mode (AI-PM mode)
}

// Emphasis type for chip selection
type EmphasisType = 'price' | 'terms' | 'delivery';

/**
 * Helper to format delivery date for display
 */
function formatDeliveryDisplay(date: string, days: number): string {
  try {
    const dateObj = new Date(date);
    const formatted = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${formatted} (${days} days)`;
  } catch {
    return `${days} days`;
  }
}

/**
 * Generate chips from a structured suggestion
 */
function generateChipsFromSuggestion(suggestion: StructuredSuggestion): OfferChip[] {
  return [
    {
      type: 'price' as const,
      label: 'Price',
      value: `$${suggestion.price.toFixed(2)}`,
    },
    {
      type: 'terms' as const,
      label: 'Terms',
      value: suggestion.paymentTerms,
    },
    {
      type: 'delivery' as const,
      label: 'Delivery',
      value: formatDeliveryDisplay(suggestion.deliveryDate, suggestion.deliveryDays),
    },
  ];
}

// Note: Client-side filtering removed - we now fetch emphasis-specific suggestions from backend
// The backend generates all 4 suggestions focused on the selected emphasis(es)

export default function Composer({
  onSend,
  inputText,
  onInputChange,
  sending,
  dealStatus,
  canSend = true,
  dealId: _dealId,
  context,
  wizardConfig,
  currentRound = 0,
  vendorMode = false,
}: ComposerProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>("HARD");
  const [scenarios, setScenarios] = useState<ScenarioConfig[]>([]);
  const [structuredSuggestions, setStructuredSuggestions] = useState<ScenarioSuggestions | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [pmLastOffer, setPmLastOffer] = useState<{
    price: number;
    paymentTerms: string;
    deliveryDate: string;
  } | null>(null);

  // Emphasis selection state - persists across scenario changes
  const [selectedEmphases, setSelectedEmphases] = useState<Set<EmphasisType>>(new Set());

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Toggle emphasis selection
  const toggleEmphasis = useCallback((emphasis: EmphasisType) => {
    setSelectedEmphases(prev => {
      const next = new Set(prev);
      if (next.has(emphasis)) {
        next.delete(emphasis);
      } else {
        next.add(emphasis);
      }
      return next;
    });
  }, []);

  // Generate scenarios from wizard config (frontend generation)
  // VENDOR PERSPECTIVE (January 2026): All scenarios now use vendor perspective pricing
  // - Strong Position (HARD) = HIGHEST price (vendor wants max profit)
  // - Balanced Offer (MEDIUM) = MID-RANGE price
  // - Flexible Offer (SOFT) = LOWEST price (near PM's target, quick close)
  const generatedScenarios = useMemo(() => {
    if (vendorMode) {
      // In vendor mode, use vendor fallback scenarios with wizard config for price calculation
      // UPDATED January 2026: Now passes wizardConfig so vendor scenarios are calculated
      // relative to PM's target/max prices from the wizard configuration
      return generateVendorFallbackScenarios(pmLastOffer, wizardConfig);
    }
    // Default mode also uses vendor perspective (updated January 2026)
    return generateScenarioMessages(wizardConfig, currentRound);
  }, [wizardConfig, currentRound, vendorMode, pmLastOffer]);

  // Initialize scenarios with frontend-generated values
  useEffect(() => {
    setScenarios(generatedScenarios);
  }, [generatedScenarios]);

  // HYBRID APPROACH: Instant frontend fallback + silent backend update
  // 1. When emphasis changes, IMMEDIATELY show frontend-generated suggestions (instant)
  // 2. Silently fetch from backend in the background
  // 3. When backend responds, update suggestions seamlessly

  // STEP 1: INSTANT - Generate frontend fallback immediately when emphasis changes
  // This runs even WITHOUT context - uses wizardConfig for price/terms/delivery ranges
  useEffect(() => {
    // Skip for vendor mode - it has its own fallback mechanism
    if (vendorMode) return;

    const instantFallback = generateEmphasisAwareFallback(wizardConfig, selectedEmphases);

    // Convert to ScenarioSuggestions format for compatibility
    const convertedFallback: ScenarioSuggestions = {
      HARD: instantFallback.HARD.map(s => ({
        message: s.message,
        price: s.price,
        paymentTerms: s.paymentTerms,
        deliveryDate: s.deliveryDate,
        deliveryDays: s.deliveryDays,
        emphasis: s.emphasis as SuggestionEmphasis,
      })),
      MEDIUM: instantFallback.MEDIUM.map(s => ({
        message: s.message,
        price: s.price,
        paymentTerms: s.paymentTerms,
        deliveryDate: s.deliveryDate,
        deliveryDays: s.deliveryDays,
        emphasis: s.emphasis as SuggestionEmphasis,
      })),
      SOFT: instantFallback.SOFT.map(s => ({
        message: s.message,
        price: s.price,
        paymentTerms: s.paymentTerms,
        deliveryDate: s.deliveryDate,
        deliveryDays: s.deliveryDays,
        emphasis: s.emphasis as SuggestionEmphasis,
      })),
      WALK_AWAY: instantFallback.WALK_AWAY.map(s => ({
        message: s.message,
        price: s.price,
        paymentTerms: s.paymentTerms,
        deliveryDate: s.deliveryDate,
        deliveryDays: s.deliveryDays,
        emphasis: s.emphasis as SuggestionEmphasis,
      })),
    };

    // Set instant fallback immediately (no loading state!)
    setStructuredSuggestions(convertedFallback);

    // Update scenario messages from instant fallback
    setScenarios(prev => prev.map(scenario => {
      const scenarioSuggestions = convertedFallback[scenario.type as keyof ScenarioSuggestions];
      if (scenarioSuggestions && scenarioSuggestions.length > 0) {
        return {
          ...scenario,
          messages: scenarioSuggestions.map(s => s.message),
        };
      }
      return scenario;
    }));
  }, [vendorMode, wizardConfig, selectedEmphases]); // Runs immediately when emphases change

  // STEP 2: SILENT BACKGROUND - Fetch from backend (only if context available)
  useEffect(() => {
    if (!context) return;

    const fetchScenarios = async () => {
      try {
        if (vendorMode) {
          // Vendor mode: Fetch from /vendor-scenarios endpoint
          setLoadingSuggestions(true); // Vendor mode still shows loading (no fallback)
          const response = await chatbotService.getVendorScenarios(context);
          const { scenarios: vendorScenarios, pmLastOffer: lastOffer } = response.data;

          // Store PM's last offer for fallback generation
          if (lastOffer) {
            setPmLastOffer(lastOffer);
          }

          // Convert vendor scenarios to ScenarioConfig format
          if (vendorScenarios && vendorScenarios.length > 0) {
            const convertedScenarios = convertVendorScenariosToConfig(
              vendorScenarios as VendorScenario[]
            );
            setScenarios(convertedScenarios);
          }
          setLoadingSuggestions(false);
        } else {
          // Buyer/PM mode: Silently fetch structured suggestions from /suggestions endpoint
          // Pass current emphasis selection so backend generates focused suggestions
          const emphasisArray = selectedEmphases.size > 0
            ? Array.from(selectedEmphases) as Array<'price' | 'terms' | 'delivery' | 'value'>
            : undefined;

          const response = await chatbotService.getSuggestedCounters(context, emphasisArray);
          const backendSuggestions = response.data as ScenarioSuggestions;

          if (backendSuggestions) {
            // SILENTLY update with backend suggestions (better quality)
            setStructuredSuggestions(backendSuggestions);

            // Also update scenarios with the message texts for quick chips
            setScenarios(prev => prev.map(scenario => {
              const scenarioSuggestions = backendSuggestions[scenario.type as keyof ScenarioSuggestions];
              if (scenarioSuggestions && scenarioSuggestions.length > 0) {
                return {
                  ...scenario,
                  messages: scenarioSuggestions.map(s => s.message),
                };
              }
              return scenario;
            }));
          }
        }
      } catch (error) {
        // Backend unavailable - we already have frontend fallback showing, so just log
        console.warn('[Composer] Backend scenarios unavailable, using frontend fallback:', error);
        if (vendorMode) {
          setLoadingSuggestions(false);
        }
      }
    };

    fetchScenarios();
  }, [context, currentRound, vendorMode, selectedEmphases, wizardConfig]); // Include wizardConfig for fallback generation

  // Reset suggestion index when scenario changes
  useEffect(() => {
    setSelectedSuggestionIndex(0);
  }, [selectedScenario]);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const lineHeight = 24;
      const minHeight = lineHeight * 1;
      const maxHeight = lineHeight * 5;
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputText]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !sending) {
        onSend(inputText);
      }
    }
  };

  // Get current scenario's messages and chips
  const currentScenario = scenarios.find(s => s.type === selectedScenario);

  // Get structured suggestions for the current scenario (this has 4 items from fallback/backend)
  const currentStructuredSuggestions = structuredSuggestions?.[selectedScenario as keyof ScenarioSuggestions] || [];

  // IMPORTANT: Use structuredSuggestions messages (4 items) if available, otherwise fall back to scenario messages
  // This ensures we always show 4 message chips when emphasis tabs are used
  const currentMessages = currentStructuredSuggestions.length > 0
    ? currentStructuredSuggestions.map(s => s.message)
    : (currentScenario?.messages || []);

  // Get chips - from structured suggestions (buyer mode) or scenario chips (vendor mode)
  const currentChips = useMemo(() => {
    if (vendorMode) {
      return currentScenario?.chips || [];
    }
    // For buyer mode, generate chips from the currently selected/hovered structured suggestion
    if (currentStructuredSuggestions.length > 0 && selectedSuggestionIndex < currentStructuredSuggestions.length) {
      return generateChipsFromSuggestion(currentStructuredSuggestions[selectedSuggestionIndex]);
    }
    return [];
  }, [vendorMode, currentScenario, currentStructuredSuggestions, selectedSuggestionIndex]);

  // Get base chip styling based on type
  const getChipBaseStyle = (chipType: OfferChip['type']): string => {
    const styles: Record<OfferChip['type'], string> = {
      price: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700',
      terms: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      delivery: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700',
    };
    return styles[chipType];
  };

  // Get selected chip styling with scale + glow effect
  const getChipSelectedStyle = (chipType: OfferChip['type'], isSelected: boolean): string => {
    if (!isSelected) return '';

    const glowStyles: Record<OfferChip['type'], string> = {
      price: 'scale-105 shadow-[0_0_10px_rgba(34,197,94,0.5)] ring-2 ring-green-400 dark:ring-green-500',
      terms: 'scale-105 shadow-[0_0_10px_rgba(59,130,246,0.5)] ring-2 ring-blue-400 dark:ring-blue-500',
      delivery: 'scale-105 shadow-[0_0_10px_rgba(147,51,234,0.5)] ring-2 ring-purple-400 dark:ring-purple-500',
    };
    return glowStyles[chipType];
  };

  return (
    <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border px-4 py-4 pb-6 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      {/* Scenario Chips */}
      <div className="mb-3 space-y-2">
        {/* Scenario Selector - Only HARD, MEDIUM, SOFT (no WALK_AWAY) */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {vendorMode ? "Your Offers:" : "Quick Offers:"}
          </span>
          {scenarios.map((scenario) => (
            <button
              key={scenario.type}
              onClick={() => setSelectedScenario(scenario.type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                getScenarioColorClass(scenario.type, selectedScenario === scenario.type)
              }`}
              disabled={sending}
            >
              {scenario.label}
            </button>
          ))}
        </div>

        {/* Offer Details Chips (Price/Terms/Delivery) - INTERACTIVE: Click to filter */}
        {currentChips.length > 0 && !vendorMode && (
          <div className="flex flex-wrap gap-2 mb-2">
            {currentChips.map((chip, idx) => {
              const isSelected = selectedEmphases.has(chip.type as EmphasisType);
              return (
                <button
                  key={idx}
                  onClick={() => toggleEmphasis(chip.type as EmphasisType)}
                  className={`
                    px-2.5 py-1 text-xs font-medium rounded-full border cursor-pointer
                    transition-all duration-200 ease-out
                    ${getChipBaseStyle(chip.type)}
                    ${getChipSelectedStyle(chip.type, isSelected)}
                    hover:opacity-80
                  `}
                  title={isSelected ? `Click to remove ${chip.type} filter` : `Click to prioritize ${chip.type}`}
                >
                  {chip.label}: {chip.value}
                </button>
              );
            })}
            {selectedEmphases.size > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center ml-2">
                Filtering by: {Array.from(selectedEmphases).join(', ')}
              </span>
            )}
          </div>
        )}

        {/* Vendor mode - non-interactive chips */}
        {currentChips.length > 0 && vendorMode && (
          <div className="flex flex-wrap gap-2 mb-2">
            {currentChips.map((chip, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getChipBaseStyle(chip.type)}`}
              >
                {chip.label}: {chip.value}
              </span>
            ))}
          </div>
        )}

        {/* Quick Message Chips */}
        <div className="flex flex-wrap gap-2">
          {loadingSuggestions ? (
            // Skeleton loading with shimmer effect - flexible width cards
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded h-[32px] min-w-[200px] max-w-[400px]"
                >
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-full"></div>
                </div>
              ))}
            </>
          ) : (
            // Suggestion chips - truncated to 80 chars with ellipsis
            // Full message shown on hover via title attribute
            currentMessages.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => onSend(msg)}
                onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                disabled={sending || !canSend}
                className={`
                  px-3 py-1.5 text-xs border rounded transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  h-[32px] text-left overflow-hidden max-w-[500px]
                  ${selectedSuggestionIndex === idx
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 shadow-sm scale-[1.02]'
                    : 'bg-white dark:bg-dark-surface border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover hover:border-gray-400'
                  }
                `}
                title={msg}
              >
                <span className="block truncate">{msg.length > 80 ? msg.slice(0, 77) + '...' : msg}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Input Row */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            !canSend && dealStatus === "ESCALATED"
              ? "Deal is Escalated. Reset or Resume."
              : !canSend
              ? "Deal is closed"
              : vendorMode
              ? "Type your offer to the buyer..."
              : "Type your counter-offer..."
          }
          disabled={sending || !canSend}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed resize-none overflow-y-auto bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          rows={1}
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
        <button
          onClick={() => onSend(inputText)}
          disabled={sending || !inputText.trim() || !canSend}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
