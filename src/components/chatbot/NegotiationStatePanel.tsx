/**
 * NegotiationStatePanel Component
 * Display negotiation state and conversation phase
 */

import { ConversationState } from '../../types';

interface NegotiationStatePanelProps {
  state: ConversationState;
}

export default function NegotiationStatePanel({ state }: NegotiationStatePanelProps) {
  const getPhaseColor = () => {
    switch (state.phase) {
      case 'WAITING_FOR_OFFER':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'NEGOTIATING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'TERMINAL':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPhaseDescription = () => {
    switch (state.phase) {
      case 'WAITING_FOR_OFFER':
        return 'Awaiting initial offer from vendor';
      case 'NEGOTIATING':
        return 'Active negotiation in progress';
      case 'TERMINAL':
        return 'Negotiation has concluded';
      default:
        return 'Unknown phase';
    }
  };

  return (
    <div className="rounded-lg border bg-white pt-6 px-6 pb-0 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Negotiation State</h3>

      {/* Phase Badge */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-4 pt-2 pb-0 rounded-full font-medium border text-sm mb-2 ${getPhaseColor()}`}>
          {state.phase.replace(/_/g, ' ')}
        </div>
        <p className="text-sm text-gray-600">{getPhaseDescription()}</p>
      </div>

      {/* State Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pt-2 pb-0 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Turn Count</span>
          <span className="text-sm font-semibold text-gray-900">{state.turnCount}</span>
        </div>

        <div className="flex items-center justify-between pt-2 pb-0 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Refusal Count</span>
          <span className="text-sm font-semibold text-gray-900">{state.refusalCount}</span>
        </div>

        <div className="flex items-center justify-between pt-2 pb-0 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Greeting Sent</span>
          <span className={`text-sm font-semibold ${state.greetingSent ? 'text-green-600' : 'text-gray-500'}`}>
            {state.greetingSent ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Last Vendor Offer */}
      {state.lastVendorOffer && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Last Vendor Offer</h4>
          <div className="bg-gray-50 rounded-lg pt-4 px-4 pb-0 space-y-2">
            {state.lastVendorOffer.unit_price !== null && state.lastVendorOffer.unit_price !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="text-sm font-medium text-gray-900">
                  ${state.lastVendorOffer.unit_price}
                </span>
              </div>
            )}
            {state.lastVendorOffer.payment_terms && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Terms:</span>
                <span className="text-sm font-medium text-gray-900">
                  {state.lastVendorOffer.payment_terms}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Counter Offer */}
      {state.pendingCounter && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Pending Counter</h4>
          <div className="bg-blue-50 rounded-lg pt-4 px-4 pb-0 space-y-2">
            {state.pendingCounter.unit_price !== null && state.pendingCounter.unit_price !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Price:</span>
                <span className="text-sm font-medium text-blue-900">
                  ${state.pendingCounter.unit_price}
                </span>
              </div>
            )}
            {state.pendingCounter.payment_terms && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Terms:</span>
                <span className="text-sm font-medium text-blue-900">
                  {state.pendingCounter.payment_terms}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
