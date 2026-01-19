import { useState, useEffect } from "react";
import { FiX, FiMessageSquare, FiDownload, FiShoppingCart, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import chatbotService from "../../../services/chatbot.service";
import type { DealSummaryResponse } from "../../../types/chatbot";
import type { DealContext } from "../../../types/chatbot";
import toast from "react-hot-toast";
import ExportPDFModal from "./ExportPDFModal";

interface DealSummaryModalProps {
  dealId: string;
  rfqId: number;
  vendorId: number;
  isOpen: boolean;
  onClose: () => void;
  onViewChat: (dealId: string) => void;
}

/**
 * DealSummaryModal Component
 * Displays comprehensive deal summary for completed deals
 * Shows: Deal info, final offer, metrics, timeline, action buttons
 */
export default function DealSummaryModal({ dealId, rfqId, vendorId, isOpen, onClose, onViewChat }: DealSummaryModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DealSummaryResponse | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (isOpen && dealId && rfqId && vendorId) {
      fetchSummary();
    }
  }, [isOpen, dealId, rfqId, vendorId]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await chatbotService.getDealSummary({
        rfqId,
        vendorId,
        dealId,
      });
      setSummary(response.data);
    } catch (err: any) {
      console.error("Failed to fetch deal summary:", err);
      setError(err.response?.data?.message || "Failed to load deal summary");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null): string => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExportPDF = () => {
    setShowExportModal(true);
  };

  // Build deal context for the export modal
  const dealContext: DealContext = {
    rfqId,
    vendorId,
    dealId,
  };

  const handleCreatePO = () => {
    toast.error("Create PO coming soon!", { icon: "🛒" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
                Deal Summary
              </h2>
              {summary && (
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  {summary.deal.title}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-2">
                  <FiXCircle className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 dark:text-dark-text-secondary">{error}</p>
                <button
                  onClick={fetchSummary}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : summary ? (
              <div className="space-y-6">
                {/* Status & Vendor Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                        summary.deal.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : summary.deal.status === "WALKED_AWAY"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                      }`}>
                        {summary.deal.status === "ACCEPTED" && <FiCheckCircle className="w-4 h-4" />}
                        {summary.deal.status === "WALKED_AWAY" && <FiXCircle className="w-4 h-4" />}
                        {summary.deal.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">{summary.deal.mode}</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">
                      {summary.deal.vendorName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                      {summary.deal.companyName || summary.deal.vendorEmail}
                    </p>
                  </div>
                </div>

                {/* Final Offer Card */}
                <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide mb-4">
                    Final Offer
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Unit Price</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                        {formatCurrency(summary.finalOffer.unitPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">
                        {formatCurrency(summary.finalOffer.totalValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Payment Terms</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-dark-text">
                        {summary.finalOffer.paymentTerms || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Delivery Date</p>
                      <p className="text-lg font-medium text-gray-900 dark:text-dark-text">
                        {summary.finalOffer.deliveryDate
                          ? new Date(summary.finalOffer.deliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "N/A"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <FiTrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {summary.metrics.utilityScore !== null
                        ? `${Math.round(summary.metrics.utilityScore * 100)}%`
                        : "N/A"
                      }
                    </p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Utility Score</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <FiMessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {summary.metrics.totalRounds}/{summary.metrics.maxRounds}
                    </p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Rounds Used</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                    <FiClock className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {summary.metrics.durationDays !== null
                        ? `${summary.metrics.durationDays}d`
                        : "N/A"
                      }
                    </p>
                    <p className="text-xs text-gray-600/70 dark:text-gray-400/70">Duration</p>
                  </div>
                </div>

                {/* Timeline */}
                {summary.timeline.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-dark-text-secondary uppercase tracking-wide mb-3">
                      Negotiation Timeline
                    </h4>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                      {summary.timeline.map((item, index) => (
                        <div key={index} className="border border-gray-200 dark:border-dark-border rounded-lg p-4 bg-gray-50/50 dark:bg-dark-bg/50">
                          {/* Round Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {item.round}
                              </span>
                              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Round {item.round}</span>
                            </div>
                            {item.action && (
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                item.action === "ACCEPT"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : item.action === "COUNTER"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  : item.action === "WALK_AWAY"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                              }`}>
                                {item.action.replace("_", " ")}
                              </span>
                            )}
                          </div>

                          {/* Vendor Message */}
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide mb-1">
                              Vendor
                            </p>
                            <div className="bg-white dark:bg-dark-surface rounded-lg p-3 border border-gray-200 dark:border-dark-border">
                              <p className="text-sm text-gray-700 dark:text-dark-text whitespace-pre-wrap">
                                {item.vendorOffer}
                              </p>
                            </div>
                          </div>

                          {/* Accordo Response */}
                          {item.accordoResponse && (
                            <div>
                              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                                Accordo
                              </p>
                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-gray-700 dark:text-dark-text whitespace-pre-wrap">
                                  {item.accordoResponse}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-gray-500 dark:text-dark-text-secondary flex justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
                  <span>Started: {formatDate(summary.metrics.startedAt)}</span>
                  <span>Completed: {formatDate(summary.metrics.completedAt)}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer Actions */}
          {!loading && !error && summary && (
            <div className="sticky bottom-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => onViewChat(dealId)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-dark-text bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FiMessageSquare className="w-4 h-4" />
                View Full Chat
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-dark-text bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  Export PDF
                </button>
                {summary.deal.status === "ACCEPTED" && (
                  <button
                    onClick={handleCreatePO}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiShoppingCart className="w-4 h-4" />
                    Create PO
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export PDF Modal */}
      {summary && (
        <ExportPDFModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          context={dealContext}
          vendorName={summary.deal.vendorName}
          dealTitle={summary.deal.title}
        />
      )}
    </div>
  );
}
