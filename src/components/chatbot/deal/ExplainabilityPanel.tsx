import { useState } from 'react';
import type { Explainability } from '../../../types';

/**
 * ExplainabilityPanel Component
 *
 * Displays detailed breakdown of AI decision-making process including:
 * - Utility calculations (price vs terms)
 * - Decision reasoning
 * - Counter-offer justification
 * - Configuration snapshot for transparency
 */

interface ExplainabilityPanelProps {
  explainability: Explainability | null;
}

export default function ExplainabilityPanel({ explainability }: ExplainabilityPanelProps) {
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  if (!explainability) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg pt-6 px-6 pb-0 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600">No explainability data available</p>
        <p className="text-xs text-gray-500 mt-1">
          Process a vendor message to see decision reasoning
        </p>
      </div>
    );
  }

  const { vendorOffer, utilities, decision, configSnapshot } = explainability;

  // Helper to get utility color based on value
  const getUtilityColor = (utility: number | null) => {
    if (utility === null) return 'bg-gray-400';
    if (utility < 0.3) return 'bg-red-500';
    if (utility < 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Helper to format percentage
  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(0)}%`;
  };

  // Helper to get decision badge color
  const getDecisionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'ACCEPT':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'COUNTER':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'WALK_AWAY':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'ESCALATE':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-6 pt-4 pb-0">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          Decision Explainability
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          Transparent breakdown of AI decision-making process
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Decision Summary */}
        <div className="bg-gray-50 rounded-lg pt-4 px-4 pb-0">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Decision
          </h4>
          <div className="flex items-center gap-3 mb-3">
            <span
              className={`inline-flex items-center px-3 pt-1 pb-0 rounded-full text-sm font-semibold border ${getDecisionColor(
                decision.action
              )}`}
            >
              {decision.action.replace(/_/g, ' ')}
            </span>
            {utilities.total !== null && (
              <span className="text-sm text-gray-600">
                Total Utility: <strong>{formatPercent(utilities.total)}</strong>
              </span>
            )}
          </div>
          {decision.reasons && decision.reasons.length > 0 && (
            <div className="space-y-1">
              {decision.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Utility Breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Utility Breakdown
          </h4>

          {/* Price Utility */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Price Utility{' '}
                {configSnapshot.weights && (
                  <span className="text-xs text-gray-500">
                    (Weight: {(configSnapshot.weights.price * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatPercent(utilities.priceUtility)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 transition-all duration-500 ${getUtilityColor(
                  utilities.priceUtility
                )}`}
                style={{
                  width: `${utilities.priceUtility !== null ? utilities.priceUtility * 100 : 0}%`,
                }}
              />
            </div>
            {utilities.weightedPrice !== null && (
              <div className="text-xs text-gray-500 mt-1">
                Weighted contribution: {formatPercent(utilities.weightedPrice)}
              </div>
            )}
          </div>

          {/* Terms Utility */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Terms Utility{' '}
                {configSnapshot.weights && (
                  <span className="text-xs text-gray-500">
                    (Weight: {(configSnapshot.weights.terms * 100).toFixed(0)}%)
                  </span>
                )}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {formatPercent(utilities.termsUtility)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 transition-all duration-500 ${getUtilityColor(
                  utilities.termsUtility
                )}`}
                style={{
                  width: `${utilities.termsUtility !== null ? utilities.termsUtility * 100 : 0}%`,
                }}
              />
            </div>
            {utilities.weightedTerms !== null && (
              <div className="text-xs text-gray-500 mt-1">
                Weighted contribution: {formatPercent(utilities.weightedTerms)}
              </div>
            )}
          </div>

          {/* Total Utility */}
          <div className="bg-purple-50 rounded-lg pt-3 px-3 pb-0 border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-900">Total Utility</span>
              <span className="text-lg font-bold text-purple-900">
                {formatPercent(utilities.total)}
              </span>
            </div>
            {configSnapshot.thresholds && (
              <div className="mt-2 text-xs text-purple-700 space-y-1">
                <div className="flex justify-between">
                  <span>Accept Threshold:</span>
                  <span className="font-semibold">
                    {formatPercent(configSnapshot.thresholds.accept)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Walk Away Threshold:</span>
                  <span className="font-semibold">
                    {formatPercent(configSnapshot.thresholds.walkaway)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Offer */}
        <div className="bg-gray-50 rounded-lg pt-4 px-4 pb-0">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Vendor Offer</h4>
          <div className="grid grid-cols-2 gap-3">
            {(vendorOffer.total_price ?? vendorOffer.unit_price) !== null && (
              <div>
                <span className="text-xs text-gray-600">Total Price</span>
                <div className="text-lg font-bold text-gray-900">${vendorOffer.total_price ?? vendorOffer.unit_price}</div>
              </div>
            )}
            {vendorOffer.payment_terms && (
              <div>
                <span className="text-xs text-gray-600">Payment Terms</span>
                <div className="text-lg font-bold text-gray-900">{vendorOffer.payment_terms}</div>
              </div>
            )}
          </div>
        </div>

        {/* Counter Offer (if applicable) */}
        {decision.counterOffer && (
          <div className="bg-blue-50 rounded-lg pt-4 px-4 pb-0 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Counter Offer</h4>
            <div className="grid grid-cols-2 gap-3">
              {(decision.counterOffer.total_price ?? decision.counterOffer.unit_price) !== null && (
                <div>
                  <span className="text-xs text-blue-700">Total Price</span>
                  <div className="text-lg font-bold text-blue-900">
                    ${decision.counterOffer.total_price ?? decision.counterOffer.unit_price}
                  </div>
                </div>
              )}
              {decision.counterOffer.payment_terms && (
                <div>
                  <span className="text-xs text-blue-700">Payment Terms</span>
                  <div className="text-lg font-bold text-blue-900">
                    {decision.counterOffer.payment_terms}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Config Snapshot (Collapsible) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsConfigExpanded(!isConfigExpanded)}
            className="w-full flex items-center justify-between px-4 pt-3 pb-0 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              Configuration Snapshot
            </h4>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isConfigExpanded ? 'rotate-180' : ''
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isConfigExpanded && (
            <div className="px-4 pt-3 pb-0 bg-white border-t border-gray-200">
              <pre className="text-xs text-gray-700 overflow-x-auto bg-gray-50 pt-3 px-3 pb-0 rounded">
                {JSON.stringify(configSnapshot, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
