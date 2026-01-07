/**
 * Explainability Drawer
 *
 * Modal/drawer that shows decision breakdown for conversation mode.
 * Displays vendor offer, utility scores, decision reasoning, and counter-offer.
 */

import { useState, useEffect } from 'react';
import { FiX, FiDollarSign, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import chatbotService from '../../../services/chatbot.service';
import type { Explainability } from '../../../types';

interface ExplainDrawerProps {
  dealId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExplainDrawer({ dealId, isOpen, onClose }: ExplainDrawerProps) {
  const [explainability, setExplainability] = useState<Explainability | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && dealId) {
      loadExplainability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dealId]);

  const loadExplainability = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await chatbotService.getConversationExplainability(dealId);
      setExplainability(res.data?.explainability || null);
    } catch (err) {
      // Error loading explainability - component will show empty state
      setExplainability(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white dark:bg-dark-surface shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 pt-4 pb-0 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
            Decision Breakdown
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center pt-12 pb-0">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : explainability ? (
            <>
              {/* Vendor Offer */}
              {explainability.vendorOffer && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg pt-4 px-4 pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <FiDollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                      Vendor Offer
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unit Price</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-dark-text">
                        ${explainability.vendorOffer.unit_price ?? 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Terms</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-dark-text">
                        {explainability.vendorOffer.payment_terms ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Utility Breakdown */}
              {explainability.utilities && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg pt-4 px-4 pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text">
                      Utility Score Analysis
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Price Utility */}
                    {explainability.utilities.priceUtility !== null && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Price Utility
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                            {explainability.utilities.priceUtility?.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.max(0, (explainability.utilities.priceUtility ?? 0) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Terms Utility */}
                    {explainability.utilities.termsUtility !== null && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Terms Utility
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-dark-text">
                            {explainability.utilities.termsUtility?.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.max(0, (explainability.utilities.termsUtility ?? 0) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Total Utility */}
                    {explainability.utilities.total !== null && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-900 dark:text-dark-text">
                            Total Utility
                          </span>
                          <span className="text-lg font-bold text-gray-900 dark:text-dark-text">
                            {explainability.utilities.total?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Decision */}
              {explainability.decision && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg pt-4 px-4 pb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <FiCheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-dark-text">Decision</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Action</p>
                      <p
                        className={`text-sm font-semibold ${
                          explainability.decision.action === 'ACCEPT'
                            ? 'text-green-600 dark:text-green-400'
                            : explainability.decision.action === 'COUNTER'
                            ? 'text-blue-600 dark:text-blue-400'
                            : explainability.decision.action === 'WALK_AWAY'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {explainability.decision.action}
                      </p>
                    </div>

                    {explainability.decision.reasons && explainability.decision.reasons.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Reasoning</p>
                        <ul className="space-y-1">
                          {explainability.decision.reasons.map((reason, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                            >
                              <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {explainability.decision.counterOffer && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Counter Offer</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">
                              ${explainability.decision.counterOffer.unit_price ?? 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Terms</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">
                              {explainability.decision.counterOffer.payment_terms ?? 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center pt-12 pb-0 text-gray-500 dark:text-gray-400">
              No explainability data available
            </div>
          )}
        </div>
      </div>
    </>
  );
}
