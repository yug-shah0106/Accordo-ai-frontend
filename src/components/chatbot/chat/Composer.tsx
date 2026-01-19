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
 */

import { useState, useRef, useEffect, useMemo } from "react";
import type { DealStatus, DealContext, WizardConfig } from '../../../types';
import { chatbotService } from '../../../services/chatbot.service';
import {
  generateScenarioMessages,
  getScenarioColorClass,
  generateVendorFallbackScenarios,
  convertVendorScenariosToConfig,
  type ScenarioType,
  type ScenarioConfig,
  type VendorScenario,
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
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [pmLastOffer, setPmLastOffer] = useState<{
    price: number;
    paymentTerms: string;
    deliveryDate: string;
  } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate scenarios from wizard config (frontend generation)
  // Used for buyer/PM perspective when NOT in vendor mode
  const generatedScenarios = useMemo(() => {
    if (vendorMode) {
      // In vendor mode, use vendor fallback scenarios
      return generateVendorFallbackScenarios(pmLastOffer);
    }
    return generateScenarioMessages(wizardConfig, currentRound);
  }, [wizardConfig, currentRound, vendorMode, pmLastOffer]);

  // Initialize scenarios with frontend-generated values
  useEffect(() => {
    setScenarios(generatedScenarios);
  }, [generatedScenarios]);

  // Fetch scenarios from backend (different endpoints for vendor vs buyer mode)
  useEffect(() => {
    if (!context) return;

    const fetchScenarios = async () => {
      setLoadingSuggestions(true);

      try {
        if (vendorMode) {
          // Vendor mode: Fetch from /vendor-scenarios endpoint
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
        } else {
          // Buyer/PM mode: Fetch from /suggestions endpoint (original behavior)
          const response = await chatbotService.getSuggestedCounters(context);
          const backendSuggestions = response.data;

          // Merge backend suggestions with frontend-generated ones
          if (backendSuggestions) {
            setScenarios(prev => prev.map(scenario => {
              const backendMessages = backendSuggestions[scenario.type];
              if (backendMessages && backendMessages.length > 0) {
                return { ...scenario, messages: backendMessages };
              }
              return scenario;
            }));
          }
        }
      } catch (error) {
        // Silently fall back to frontend-generated scenarios
        console.warn('[Composer] Backend scenarios unavailable, using frontend-generated:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchScenarios();
  }, [context, currentRound, vendorMode]);

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

  // Get current scenario's messages
  const currentScenario = scenarios.find(s => s.type === selectedScenario);
  const currentMessages = currentScenario?.messages || [];

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

        {/* Quick Message Chips */}
        <div className="flex flex-wrap gap-2">
          {loadingSuggestions ? (
            // Skeleton loading with shimmer effect
            <>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                  style={{ width: `${80 + i * 20}px`, height: '28px' }}
                >
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
              ))}
            </>
          ) : (
            // Actual suggestion chips
            currentMessages.map((msg, idx) => (
              <button
                key={idx}
                onClick={() => onSend(msg)}
                disabled={sending || !canSend}
                className="px-3 py-1.5 text-xs bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 max-w-[250px] truncate"
                title={msg}
              >
                {msg.substring(0, 40)}
                {msg.length > 40 ? "..." : ""}
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
