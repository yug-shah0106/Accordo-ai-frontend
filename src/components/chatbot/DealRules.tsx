/**
 * DealRules Component
 * Show configuration rules for the deal
 */

import { useState } from 'react';
import { NegotiationConfig } from '../../types';

interface DealRulesProps {
  config: NegotiationConfig;
}

export default function DealRules({ config }: DealRulesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { parameters, accept_threshold, walkaway_threshold, max_rounds } = config;

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between pt-6 px-6 pb-0 hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">Deal Rules</h3>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-0 space-y-6">
          {/* Price Parameters */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Price Parameters</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Anchor</span>
                <span className="text-sm font-medium text-gray-900">
                  ${parameters.unit_price.anchor}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Target</span>
                <span className="text-sm font-medium text-gray-900">
                  ${parameters.unit_price.target}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max Acceptable</span>
                <span className="text-sm font-medium text-red-600">
                  ${parameters.unit_price.max_acceptable}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Concession Step</span>
                <span className="text-sm font-medium text-gray-900">
                  ${parameters.unit_price.concession_step}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Terms</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Options</span>
                <div className="flex gap-2">
                  {parameters.payment_terms.options.map((option) => (
                    <span
                      key={option}
                      className="inline-flex items-center px-2 pt-1 pb-0 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {option}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {Object.entries(parameters.payment_terms.utility).map(([term, utility]) => (
                  <div key={term} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{term}</span>
                    <span className="text-xs font-medium text-gray-700">
                      {(utility * 100).toFixed(0)}% utility
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thresholds */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Decision Thresholds</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Accept Threshold</span>
                <span className="text-sm font-medium text-green-600">
                  {(accept_threshold * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Walk-away Threshold</span>
                <span className="text-sm font-medium text-red-600">
                  {(walkaway_threshold * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Max Rounds</span>
                <span className="text-sm font-medium text-gray-900">{max_rounds}</span>
              </div>
            </div>
          </div>

          {/* Weights */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Weights</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price</span>
                <span className="text-sm font-medium text-gray-900">
                  {(parameters.unit_price.weight * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Terms</span>
                <span className="text-sm font-medium text-gray-900">
                  {(parameters.payment_terms.weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
