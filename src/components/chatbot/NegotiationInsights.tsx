/**
 * NegotiationInsights Component
 * Shows utility breakdown for current negotiation state
 */

interface NegotiationInsightsProps {
  utilities: {
    priceUtility: number | null;
    termsUtility: number | null;
    total: number | null;
  };
}

export default function NegotiationInsights({ utilities }: NegotiationInsightsProps) {
  const { priceUtility, termsUtility, total } = utilities;

  const formatUtility = (value: number | null): string => {
    if (value === null || value === undefined) return '—';
    return `${(value * 100).toFixed(1)}%`;
  };

  const getUtilityColor = (value: number | null): string => {
    if (value === null || value === undefined) return 'text-gray-500';
    if (value >= 0.7) return 'text-green-600';
    if (value >= 0.45) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilityBgColor = (value: number | null): string => {
    if (value === null || value === undefined) return 'bg-gray-100';
    if (value >= 0.7) return 'bg-green-100';
    if (value >= 0.45) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Negotiation Insights</h3>

      <div className="space-y-4">
        {/* Price Utility */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Price Utility</span>
              <span className={`text-sm font-semibold ${getUtilityColor(priceUtility)}`}>
                {formatUtility(priceUtility)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  priceUtility !== null ? getUtilityBgColor(priceUtility).replace('100', '500') : 'bg-gray-400'
                }`}
                style={{ width: `${priceUtility !== null ? Math.min(100, priceUtility * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Terms Utility */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Terms Utility</span>
              <span className={`text-sm font-semibold ${getUtilityColor(termsUtility)}`}>
                {formatUtility(termsUtility)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  termsUtility !== null ? getUtilityBgColor(termsUtility).replace('100', '500') : 'bg-gray-400'
                }`}
                style={{ width: `${termsUtility !== null ? Math.min(100, termsUtility * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Utility */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-semibold text-gray-900">Total Utility</span>
            <span className={`text-base font-bold ${getUtilityColor(total)}`}>
              {formatUtility(total)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                total !== null ? getUtilityBgColor(total).replace('100', '600') : 'bg-gray-400'
              }`}
              style={{ width: `${total !== null ? Math.min(100, total * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Utility Breakdown Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <span className="font-semibold">Formula:</span> (Price × 60%) + (Terms × 40%)
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Accept threshold: 70% | Walk-away threshold: 45%
          </p>
        </div>
      </div>
    </div>
  );
}
