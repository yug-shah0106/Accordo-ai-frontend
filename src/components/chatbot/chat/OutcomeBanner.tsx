import type { DealStatus, Offer } from '../../../types';

/**
 * OutcomeBanner Component
 *
 * Displays a prominent banner when a negotiation reaches a terminal state
 * (ACCEPTED, WALKED_AWAY, or ESCALATED). Shows final offer details and
 * utility score with color-coded messaging.
 */

interface OutcomeBannerProps {
  status: DealStatus;
  finalOffer?: Offer | null;
  finalUtility?: number | null;
  totalRounds: number;
}

export default function OutcomeBanner({
  status,
  finalOffer,
  finalUtility,
  totalRounds,
}: OutcomeBannerProps) {
  // Only show banner for terminal states
  if (status === 'NEGOTIATING') {
    return null;
  }

  // Get status-specific styling and content
  const getStatusConfig = () => {
    switch (status) {
      case 'ACCEPTED':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-900',
          iconColor: 'text-green-600',
          icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          title: 'Deal Accepted',
          message: 'The vendor offer has been accepted. Negotiation completed successfully!',
        };
      case 'WALKED_AWAY':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
          title: 'Walked Away',
          message: 'The utility score was too low. Accordo decided to walk away from this deal.',
        };
      case 'ESCALATED':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-900',
          iconColor: 'text-orange-600',
          icon: (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          title: 'Escalated',
          message: 'Maximum negotiation rounds reached. This deal requires human intervention.',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  // Format utility score as percentage
  const utilityPercent =
    finalUtility !== null && finalUtility !== undefined
      ? (finalUtility * 100).toFixed(0)
      : null;

  // Get utility color based on score
  const getUtilityColor = (utility: number) => {
    if (utility < 0.3) return 'text-red-600';
    if (utility < 0.7) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div
      className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-lg pt-6 px-6 pb-0 shadow-md mb-4`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Title */}
          <h3 className={`text-xl font-bold ${config.textColor} mb-2`}>
            {config.title}
          </h3>

          {/* Message */}
          <p className={`text-sm ${config.textColor} mb-4`}>
            {config.message}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Final Offer */}
            {finalOffer && (finalOffer.unit_price !== null || finalOffer.payment_terms) && (
              <div className="bg-white bg-opacity-60 rounded-lg pt-3 px-3 pb-0">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">Final Offer</h4>
                <div className="space-y-1">
                  {finalOffer.unit_price !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Price:</span>
                      <span className={`text-sm font-bold ${config.textColor}`}>
                        ${finalOffer.unit_price}
                      </span>
                    </div>
                  )}
                  {finalOffer.payment_terms && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Terms:</span>
                      <span className={`text-sm font-bold ${config.textColor}`}>
                        {finalOffer.payment_terms}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Utility Score */}
            {utilityPercent !== null && (
              <div className="bg-white bg-opacity-60 rounded-lg pt-3 px-3 pb-0">
                <h4 className="text-xs font-semibold text-gray-600 mb-2">Final Utility</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          finalUtility && finalUtility >= 0.7
                            ? 'bg-green-600'
                            : finalUtility && finalUtility >= 0.3
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${utilityPercent}%` }}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-lg font-bold ${
                      finalUtility ? getUtilityColor(finalUtility) : 'text-gray-600'
                    }`}
                  >
                    {utilityPercent}%
                  </span>
                </div>
              </div>
            )}

            {/* Rounds Completed */}
            <div className="bg-white bg-opacity-60 rounded-lg pt-3 px-3 pb-0">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Rounds Completed</h4>
              <div className="flex items-center gap-2">
                <svg
                  className={`w-5 h-5 ${config.iconColor}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className={`text-lg font-bold ${config.textColor}`}>
                  {totalRounds}
                </span>
              </div>
            </div>
          </div>

          {/* Additional context for ESCALATED status */}
          {status === 'ESCALATED' && (
            <div className="mt-4 bg-white bg-opacity-60 rounded-lg pt-3 px-3 pb-0">
              <p className="text-xs text-gray-700">
                <strong>Next Steps:</strong> A human negotiator should review this deal and decide
                whether to continue negotiations, modify parameters, or close the deal.
              </p>
            </div>
          )}

          {/* Additional context for WALKED_AWAY status */}
          {status === 'WALKED_AWAY' && (
            <div className="mt-4 bg-white bg-opacity-60 rounded-lg pt-3 px-3 pb-0">
              <p className="text-xs text-gray-700">
                <strong>Recommendation:</strong> The vendor's offer did not meet minimum requirements.
                Consider exploring alternative vendors or adjusting negotiation parameters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
