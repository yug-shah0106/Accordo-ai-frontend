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
  /** Whether these are final offers (75%+ utility trigger) */
  isFinal?: boolean;
  /** Stall detection prompt to show above options */
  stallPrompt?: string;
}

// Offer numbers for icon display
const offerIcons: Record<string, string> = {
  'Offer 1': '1️⃣',
  'Offer 2': '2️⃣',
  'Offer 3': '3️⃣',
  // Legacy support
  'Best Price': '$',
  'Best Terms': '💳',
  'Balanced': '⚖️',
};

// Emphasis-based icons (for details display)
const emphasisIcons: Record<string, string> = {
  price: '$',
  payment: '💳',
  payment_terms: '💳',
  delivery: '🚚',
  balanced: '⚖️',
};

// Color schemes for offers (neutral blue theme for numbered offers)
const offerColors: Record<string, { bg: string; border: string; text: string }> = {
  'Offer 1': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  'Offer 2': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  'Offer 3': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
  // Legacy support
  'Best Price': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  'Best Terms': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  'Balanced': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
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
  isFinal?: boolean;
}> = ({ option, onSelect, disabled, isSelected, isFinal }) => {
  // Use offer label for colors (Offer 1, Offer 2, Offer 3)
  const colors = offerColors[option.label] || offerColors['Offer 1'];
  const icon = offerIcons[option.label] || '📋';

  // Handle emphasis for showing what the offer prioritizes
  const emphasisValue = Array.isArray(option.emphasis)
    ? option.emphasis[0] || 'balanced'
    : option.emphasis || 'balanced';
  const emphasisKey = emphasisValue === 'payment_terms' ? 'payment' : emphasisValue;
  const emphasisIcon = emphasisIcons[emphasisKey] || '';

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
          {emphasisIcon && <span className="text-sm opacity-70">{emphasisIcon}</span>}
        </div>
        {isFinal && (
          <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
            Final
          </span>
        )}
      </div>

      {/* Description - only show if not empty */}
      {option.description && (
        <p className="text-sm text-gray-600 mb-3">{option.description}</p>
      )}

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
        {/* Warranty hidden per client requirement */}
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
  isFinal = false,
  stallPrompt,
}) => {
  // Use isFinal from mesoResult if not passed as prop
  const showAsFinal = isFinal || mesoResult.isFinal;
  // Use stallPrompt from mesoResult if not passed as prop
  const displayStallPrompt = stallPrompt || mesoResult.stallPrompt;

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
      {/* Stall Detection Prompt */}
      {displayStallPrompt && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-xl">⚠️</span>
            <div>
              <p className="text-amber-800 font-medium">Checking your position</p>
              <p className="text-amber-700 text-sm mt-1">{displayStallPrompt}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {showAsFinal ? 'Final Offers - Select to Conclude' : 'Choose Your Preferred Option'}
          </h3>
          <p className="text-sm text-gray-500">
            {showAsFinal
              ? 'These are our final offers. Select one to conclude the negotiation.'
              : 'All options have equivalent value - select based on your priorities'}
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
            isFinal={showAsFinal}
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
