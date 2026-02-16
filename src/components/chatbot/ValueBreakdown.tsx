/**
 * ValueBreakdown Component
 *
 * Displays $/value trade-off calculations for negotiation parameters.
 * Shows the dollar impact of offer changes to help with decision making.
 */

import React from 'react';
import type { OfferValueBreakdown, ValueImpact, TradeoffAnalysis } from '../../types/chatbot';

interface ValueBreakdownProps {
  /** Value breakdown data */
  breakdown: OfferValueBreakdown;
  /** Optional trade-off analysis */
  tradeoffs?: TradeoffAnalysis[];
  /** Whether to show compact view */
  compact?: boolean;
}

const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absValue)}`;
};

const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

const parameterLabels: Record<string, string> = {
  targetUnitPrice: 'Price',
  maxAcceptablePrice: 'Max Price',
  paymentTermsRange: 'Payment Terms',
  volumeDiscountExpectation: 'Volume Discount',
  deliveryDate: 'Delivery',
  warrantyPeriod: 'Warranty',
  advancePaymentLimit: 'Advance Payment',
  lateDeliveryPenalty: 'Late Penalty',
  qualityStandards: 'Quality Standards',
};

const ValueImpactRow: React.FC<{
  parameter: string;
  impact: ValueImpact;
  compact?: boolean;
}> = ({ parameter, impact, compact }) => {
  const label = parameterLabels[parameter] || parameter;
  const isPositive = impact.isFavorable;

  return (
    <div
      className={`
        flex items-center justify-between py-2
        ${compact ? 'text-sm' : ''}
        ${!compact ? 'border-b border-gray-100 last:border-0' : ''}
      `}
    >
      <div className="flex-1">
        <div className="font-medium text-gray-700">{label}</div>
        {!compact && (
          <div className="text-xs text-gray-500 mt-0.5">{impact.narrative}</div>
        )}
      </div>
      <div className="text-right ml-4">
        <div
          className={`
            font-semibold
            ${isPositive ? 'text-green-600' : 'text-red-600'}
          `}
        >
          {formatCurrency(impact.dollarImpact)}
        </div>
        {!compact && (
          <div className="text-xs text-gray-400">{formatPercent(impact.percentChange)}</div>
        )}
      </div>
    </div>
  );
};

const TradeoffCard: React.FC<{ tradeoff: TradeoffAnalysis }> = ({ tradeoff }) => {
  return (
    <div
      className={`
        p-3 rounded-lg border
        ${tradeoff.isFavorable ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{tradeoff.isFavorable ? '✅' : '⚠️'}</span>
        <span className="font-medium text-gray-700">Trade-off Analysis</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
        <div>
          <span className="text-gray-500">{tradeoff.param1.name}:</span>{' '}
          <span className="font-medium">{tradeoff.param1.change}</span>
          <span className={tradeoff.param1.dollarImpact >= 0 ? 'text-green-600' : 'text-red-600'}>
            {' '}({formatCurrency(tradeoff.param1.dollarImpact)})
          </span>
        </div>
        <div>
          <span className="text-gray-500">{tradeoff.param2.name}:</span>{' '}
          <span className="font-medium">{tradeoff.param2.change}</span>
          <span className={tradeoff.param2.dollarImpact >= 0 ? 'text-green-600' : 'text-red-600'}>
            {' '}({formatCurrency(tradeoff.param2.dollarImpact)})
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-600 font-medium">{tradeoff.netResult}</div>
    </div>
  );
};

export const ValueBreakdown: React.FC<ValueBreakdownProps> = ({
  breakdown,
  tradeoffs,
  compact = false,
}) => {
  const sortedImpacts = Object.entries(breakdown.parameterImpacts)
    .filter(([_, impact]) => Math.abs(impact.dollarImpact) > 0)
    .sort((a, b) => Math.abs(b[1].dollarImpact) - Math.abs(a[1].dollarImpact));

  const hasPositiveImpacts = sortedImpacts.some(([_, i]) => i.isFavorable);
  const hasNegativeImpacts = sortedImpacts.some(([_, i]) => !i.isFavorable);

  return (
    <div className="space-y-4">
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Value Analysis</h3>
          <div
            className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${breakdown.totalDollarImpact >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            `}
          >
            Net: {formatCurrency(breakdown.totalDollarImpact)}
          </div>
        </div>
      )}

      {/* Impact List */}
      <div
        className={`
          ${!compact ? 'bg-white rounded-lg border border-gray-200 p-4' : ''}
        `}
      >
        {sortedImpacts.length > 0 ? (
          sortedImpacts.map(([param, impact]) => (
            <ValueImpactRow
              key={param}
              parameter={param}
              impact={impact}
              compact={compact}
            />
          ))
        ) : (
          <div className="text-gray-500 text-sm text-center py-2">
            No significant value changes
          </div>
        )}

        {/* Total row */}
        {!compact && sortedImpacts.length > 0 && (
          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
            <span className="font-semibold text-gray-700">Total Impact</span>
            <span
              className={`
                font-bold text-lg
                ${breakdown.totalDollarImpact >= 0 ? 'text-green-600' : 'text-red-600'}
              `}
            >
              {formatCurrency(breakdown.totalDollarImpact)}
            </span>
          </div>
        )}
      </div>

      {/* Key Trade-offs */}
      {!compact && breakdown.keyTradeoffs.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <h4 className="font-medium text-blue-700 mb-2">Key Trade-offs</h4>
          <ul className="space-y-1 text-sm text-blue-600">
            {breakdown.keyTradeoffs.map((tradeoff, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span>{tradeoff}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Trade-off Analysis Cards */}
      {tradeoffs && tradeoffs.length > 0 && (
        <div className="space-y-2">
          {tradeoffs.map((tradeoff, idx) => (
            <TradeoffCard key={idx} tradeoff={tradeoff} />
          ))}
        </div>
      )}

      {/* Recommendations */}
      {!compact && breakdown.recommendations.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {breakdown.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-500">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legend */}
      {!compact && (hasPositiveImpacts || hasNegativeImpacts) && (
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          {hasPositiveImpacts && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Favorable (buyer savings)</span>
            </div>
          )}
          {hasNegativeImpacts && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Unfavorable (buyer cost)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValueBreakdown;
