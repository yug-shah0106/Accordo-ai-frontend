import type { VendorDealSummary, DealStatus } from "../../../types/chatbot";
import { FiMessageCircle, FiCheckCircle, FiXCircle, FiAlertTriangle, FiTrendingUp, FiFileText, FiArchive, FiRotateCcw } from "react-icons/fi";

interface VendorDealCardProps {
  deal: VendorDealSummary;
  currency?: string;
  onClick: (dealId: string, status: DealStatus, vendorId: number) => void;
  onViewSummary?: (dealId: string, vendorId: number) => void;
  onArchive?: (e: React.MouseEvent, deal: VendorDealSummary) => void;
  showArchiveButton?: boolean;
  onUnarchive?: (e: React.MouseEvent, deal: VendorDealSummary) => void;
  showUnarchiveButton?: boolean;
}

/**
 * VendorDealCard Component
 * Displays a vendor deal card for the requisition deals page
 * Shows: Vendor name, company, status, latest offer, utility score, last activity
 */
export default function VendorDealCard({ deal, currency, onClick, onViewSummary, onArchive, showArchiveButton = false, onUnarchive, showUnarchiveButton = false }: VendorDealCardProps) {
  const {
    dealId,
    vendorId,
    vendorName,
    vendorEmail,
    companyName,
    status,
    currentRound,
    maxRounds,
    latestOffer,
    utilityScore,
    lastActivityAt,
    completedAt,
  } = deal;

  const formatCurrency = (value: number | null): string => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getTimeAgo = (dateString: string | null): string => {
    if (!dateString) return "No activity";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusConfig = (status: DealStatus) => {
    switch (status) {
      case "NEGOTIATING":
        return {
          color: "blue",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          textColor: "text-blue-700 dark:text-blue-300",
          borderColor: "border-blue-500",
          icon: FiMessageCircle,
          label: "Negotiating",
        };
      case "ACCEPTED":
        return {
          color: "green",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          textColor: "text-green-700 dark:text-green-300",
          borderColor: "border-green-500",
          icon: FiCheckCircle,
          label: "Accepted",
        };
      case "WALKED_AWAY":
        return {
          color: "red",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          textColor: "text-red-700 dark:text-red-300",
          borderColor: "border-red-500",
          icon: FiXCircle,
          label: "Walked Away",
        };
      case "ESCALATED":
        return {
          color: "orange",
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
          textColor: "text-orange-700 dark:text-orange-300",
          borderColor: "border-orange-500",
          icon: FiAlertTriangle,
          label: "Escalated",
        };
      default:
        return {
          color: "gray",
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          textColor: "text-gray-700 dark:text-gray-300",
          borderColor: "border-gray-500",
          icon: FiMessageCircle,
          label: status,
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const getUtilityScoreColor = (score: number | null): string => {
    if (score === null) return "text-gray-400";
    if (score >= 0.8) return "text-green-600 dark:text-green-400";
    if (score >= 0.6) return "text-blue-600 dark:text-blue-400";
    if (score >= 0.4) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div
      onClick={() => onClick(dealId, status, vendorId)}
      className="bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-dark-border overflow-hidden group"
    >
      {/* Status Bar at Top */}
      <div className={`h-2 ${
        status === "NEGOTIATING"
          ? "bg-blue-500"
          : status === "ACCEPTED"
          ? "bg-green-500"
          : status === "WALKED_AWAY"
          ? "bg-red-500"
          : status === "ESCALATED"
          ? "bg-orange-500"
          : "bg-gray-400"
      }`} />

      <div className="p-5">
        {/* Vendor Name & Status Badge */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text truncate group-hover:text-blue-600 transition-colors">
              {vendorName}
            </h3>
            {companyName && (
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary truncate">
                {companyName}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} ml-3 flex-shrink-0`}>
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </span>
        </div>

        {/* Vendor Email */}
        <p className="text-xs text-gray-400 dark:text-dark-text-secondary mb-4 truncate">
          {vendorEmail}
        </p>

        {/* Latest Offer */}
        {latestOffer && (latestOffer.unitPrice !== null || latestOffer.paymentTerms) && (
          <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-1">Latest Offer</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                {formatCurrency(latestOffer.unitPrice)}
              </span>
              {latestOffer.paymentTerms && (
                <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  {latestOffer.paymentTerms}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Utility Score & Round Progress */}
        <div className="flex items-center justify-between mb-4">
          {/* Utility Score */}
          <div className="flex items-center gap-2">
            <FiTrendingUp className={`w-4 h-4 ${getUtilityScoreColor(utilityScore)}`} />
            <span className={`text-sm font-medium ${getUtilityScoreColor(utilityScore)}`}>
              {utilityScore !== null ? `${Math.round(utilityScore * 100)}%` : "No score"}
            </span>
            <span className="text-xs text-gray-400">utility</span>
          </div>

          {/* Round Progress */}
          <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
            Round {currentRound}/{maxRounds}
          </div>
        </div>

        {/* Footer: Last Activity & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-border">
          <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
            {status === "NEGOTIATING" ? "Active" : completedAt ? "Completed" : "Last update"}: {getTimeAgo(lastActivityAt || completedAt)}
          </span>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Archive Button - only visible on hover when showArchiveButton is true */}
            {showArchiveButton && onArchive && (
              <button
                onClick={(e) => onArchive(e, deal)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-800"
              >
                <FiArchive className="w-3.5 h-3.5" />
                Archive
              </button>
            )}

            {/* Unarchive Button - only visible on hover when showUnarchiveButton is true (archived view) */}
            {showUnarchiveButton && onUnarchive && (
              <button
                onClick={(e) => onUnarchive(e, deal)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:border-green-200 dark:hover:border-green-800"
              >
                <FiRotateCcw className="w-3.5 h-3.5" />
                Unarchive
              </button>
            )}

            {/* View Summary Button */}
            {onViewSummary && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewSummary(dealId, vendorId);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <FiFileText className="w-3.5 h-3.5" />
                View Summary
              </button>
            )}

            {/* Fallback hover hint when no summary handler */}
            {!onViewSummary && !showArchiveButton && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View Chat &rarr;
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
