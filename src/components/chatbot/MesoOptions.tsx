/**
 * MesoOptions Component
 *
 * Displays Multiple Equivalent Simultaneous Offers (MESO) for vendor selection.
 * Each option has similar utility but emphasizes different parameters.
 */

import React from 'react';
import type { MesoOption, MesoResult } from '../../types/chatbot';

interface MesoOptionsProps {
  /** MESO result with options */
  mesoResult: MesoResult;
  /** Callback when vendor selects an option */
  onSelect: (option: MesoOption) => void;
  /** Callback when vendor clicks "Others" button */
  onOthersClick?: () => void;
  /** Whether selection is disabled */
  disabled?: boolean;
  /** Currently selected option ID (if any) */
  selectedId?: string;
}

const emphasisIcons: Record<string, string> = {
  price: '$',
  payment: '💳',
  delivery: '🚚',
  warranty: '🛡️',
  balanced: '⚖️',
};

const emphasisColors: Record<string, { bg: string; border: string; text: string }> = {
  price: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  payment: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  delivery: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  warranty: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  balanced: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
};

const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatPaymentTerms = (days: number | null | undefined): string => {
  if (days == null) return 'N/A';
  return `Net ${days}`;
};

const MesoOptionCard: React.FC<{
  option: MesoOption;
  onSelect: () => void;
  disabled?: boolean;
  isSelected?: boolean;
}> = ({ option, onSelect, disabled, isSelected }) => {
  // Handle emphasis as either string or array (backend sends array)
  const emphasisValue = Array.isArray(option.emphasis)
    ? option.emphasis[0] || 'balanced'
    : option.emphasis || 'balanced';
  // Map backend values to frontend keys (payment_terms -> payment)
  const emphasisKey = emphasisValue === 'payment_terms' ? 'payment' : emphasisValue;
  const colors = emphasisColors[emphasisKey] || emphasisColors.balanced;
  const icon = emphasisIcons[emphasisKey] || '📋';

  return (
    <div
      className={`
        relative rounded-lg border-2 p-4 transition-all cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : colors.border}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:scale-[1.02]'}
        ${colors.bg}
      `}
      onClick={() => !disabled && onSelect()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h4 className={`font-semibold ${colors.text}`}>{option.label}</h4>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">{option.description}</p>

      {/* Offer Details */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Price:</span>
          <span className="font-medium">{formatPrice(option.offer.total_price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Payment:</span>
          <span className="font-medium">{formatPaymentTerms(option.offer.payment_terms_days)}</span>
        </div>
        {option.offer.delivery_days != null && (
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery:</span>
            <span className="font-medium">{option.offer.delivery_days} days</span>
          </div>
        )}
        {option.offer.warranty_months != null && (
          <div className="flex justify-between">
            <span className="text-gray-500">Warranty:</span>
            <span className="font-medium">{option.offer.warranty_months} months</span>
          </div>
        )}
      </div>


      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export const MesoOptions: React.FC<MesoOptionsProps> = ({
  mesoResult,
  onSelect,
  onOthersClick,
  disabled,
  selectedId,
}) => {
  if (!mesoResult.success) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        <div className="font-medium">Unable to generate equivalent offers</div>
        <div className="text-sm mt-1">{mesoResult.reason || 'Please continue with standard negotiation.'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Choose Your Preferred Option</h3>
          <p className="text-sm text-gray-500">
            All options have equivalent value - select based on your priorities
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mesoResult.options.map((option) => (
          <MesoOptionCard
            key={option.id}
            option={option}
            onSelect={() => onSelect(option)}
            disabled={disabled}
            isSelected={selectedId === option.id}
          />
        ))}
      </div>

      {/* Others Button - Only show when showOthers is true (not final MESO) */}
      {mesoResult.showOthers !== false && onOthersClick && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onOthersClick}
            disabled={disabled}
            className={`
              px-6 py-3 border-2 border-dashed rounded-lg transition-all
              ${disabled
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
              }
            `}
          >
            <span className="text-gray-600 font-medium">Others</span>
            <span className="text-gray-400 text-sm block mt-1">
              Enter your own price &amp; terms
            </span>
          </button>
        </div>
      )}

      {/* Final MESO indicator */}
      {mesoResult.isFinal && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
          <span className="text-amber-700 text-sm font-medium">
            Final Offer - Please select one of the options above
          </span>
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-400 text-center mt-3">
        Your selection helps us understand your priorities for future negotiations
      </div>
    </div>
  );
};

export default MesoOptions;
