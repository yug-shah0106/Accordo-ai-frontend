/**
 * OfferCard Component
 * Displays an offer with price, payment terms, and delivery
 */

import type { Offer } from '../../../types';

interface OfferCardProps {
  offer: Offer;
}

/**
 * Format delivery date and days into a human-readable string
 * Format: "Mar 15 (30 days)" or just "30 days" if no date
 */
function formatDelivery(
  deliveryDate: string | null | undefined,
  deliveryDays: number | null | undefined
): string {
  if (!deliveryDate && !deliveryDays) return '';

  let dateText = '';
  if (deliveryDate) {
    const date = new Date(deliveryDate);
    dateText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (deliveryDays && deliveryDays > 0) {
    if (dateText) {
      return `${dateText} (${deliveryDays} days)`;
    }
    return `${deliveryDays} days`;
  }

  return dateText;
}

export default function OfferCard({ offer }: OfferCardProps) {
  const hasPrice = offer.unit_price !== null && offer.unit_price !== undefined;
  const hasTerms = offer.payment_terms && offer.payment_terms.trim().length > 0;
  const deliveryText = formatDelivery(offer.delivery_date, offer.delivery_days);
  const hasDelivery = deliveryText.length > 0;

  if (!hasPrice && !hasTerms && !hasDelivery) return null;

  return (
    <div className="flex items-center gap-2 px-3 pt-1 pb-0.5 bg-gray-50 border border-gray-200 rounded text-sm">
      <span className="text-gray-500 font-medium">Proposed:</span>
      {hasPrice && (
        <span className="text-gray-900 font-semibold">${offer.unit_price}</span>
      )}
      {hasPrice && (hasTerms || hasDelivery) && <span className="text-gray-400">•</span>}
      {hasTerms && (
        <span className="text-gray-900 font-semibold">{offer.payment_terms}</span>
      )}
      {hasTerms && hasDelivery && <span className="text-gray-400">•</span>}
      {hasDelivery && (
        <span className="text-gray-900 font-semibold">{deliveryText}</span>
      )}
    </div>
  );
}
