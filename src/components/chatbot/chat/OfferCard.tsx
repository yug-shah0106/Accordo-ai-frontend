/**
 * OfferCard Component
 * Displays an offer with price and payment terms
 */

import type { Offer } from '../../../types';

interface OfferCardProps {
  offer: Offer;
}

export default function OfferCard({ offer }: OfferCardProps) {
  const hasPrice = offer.unit_price !== null && offer.unit_price !== undefined;
  const hasTerms = offer.payment_terms && offer.payment_terms.trim().length > 0;

  if (!hasPrice && !hasTerms) return null;

  return (
    <div className="flex items-center gap-2 px-3 pt-1 pb-0.5 bg-gray-50 border border-gray-200 rounded text-sm">
      <span className="text-gray-500 font-medium">Proposed:</span>
      {hasPrice && (
        <span className="text-gray-900 font-semibold">${offer.unit_price}</span>
      )}
      {hasPrice && hasTerms && <span className="text-gray-400">•</span>}
      {hasTerms && (
        <span className="text-gray-900 font-semibold">{offer.payment_terms}</span>
      )}
    </div>
  );
}
