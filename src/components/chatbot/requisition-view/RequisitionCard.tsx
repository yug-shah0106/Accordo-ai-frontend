import type { RequisitionWithDeals } from "../../../types/chatbot";
import { FiUsers, FiClock, FiTrendingUp, FiFolder } from "react-icons/fi";

interface RequisitionCardProps {
  requisition: RequisitionWithDeals;
  onClick: (requisitionId: number) => void;
}

/**
 * RequisitionCard Component
 * Displays a requisition card with aggregated deal statistics
 * Shows: RFQ number, title, vendor count, estimated value, project name, deadline, progress bar
 */
export default function RequisitionCard({ requisition, onClick }: RequisitionCardProps) {
  const {
    id,
    rfqNumber,
    title,
    projectName,
    estimatedValue,
    deadline,
    vendorCount,
    statusCounts,
    completionPercentage,
    lastActivityAt,
  } = requisition;

  const formatCurrency = (value: number | null): string => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
    return formatDate(dateString);
  };

  const getDeadlineStatus = (): { color: string; label: string } => {
    if (!deadline) return { color: "gray", label: "No deadline" };
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / 86400000);

    if (diffDays < 0) return { color: "red", label: "Overdue" };
    if (diffDays <= 3) return { color: "orange", label: `${diffDays}d left` };
    if (diffDays <= 7) return { color: "yellow", label: `${diffDays}d left` };
    return { color: "green", label: formatDate(deadline) };
  };

  const deadlineStatus = getDeadlineStatus();

  return (
    <div
      onClick={() => onClick(id)}
      className="bg-white dark:bg-dark-surface rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-dark-border overflow-hidden group"
    >
      {/* Progress Bar at Top */}
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full transition-all ${
            completionPercentage >= 100
              ? "bg-green-500"
              : completionPercentage >= 50
              ? "bg-blue-500"
              : "bg-yellow-500"
          }`}
          style={{ width: `${Math.min(completionPercentage, 100)}%` }}
        />
      </div>

      <div className="p-5">
        {/* RFQ Number & Project Name */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            {rfqNumber}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-text-secondary">
            <FiFolder className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{projectName}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
          {title}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center justify-between mb-4">
          {/* Estimated Value */}
          <div className="text-sm">
            <span className="text-gray-500 dark:text-dark-text-secondary">Value: </span>
            <span className="font-semibold text-gray-900 dark:text-dark-text">
              {formatCurrency(estimatedValue)}
            </span>
          </div>
          {/* Vendor Count */}
          <div className="flex items-center gap-1 text-sm">
            <FiUsers className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-dark-text">
              {vendorCount} {vendorCount === 1 ? "vendor" : "vendors"}
            </span>
          </div>
        </div>

        {/* Status Summary Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {statusCounts.negotiating > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {statusCounts.negotiating} Active
            </span>
          )}
          {statusCounts.accepted > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {statusCounts.accepted} Accepted
            </span>
          )}
          {statusCounts.walkedAway > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {statusCounts.walkedAway} Walked
            </span>
          )}
          {statusCounts.escalated > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              {statusCounts.escalated} Escalated
            </span>
          )}
          {vendorCount === 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400">
              No deals yet
            </span>
          )}
        </div>

        {/* Footer: Deadline & Last Activity */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-dark-border">
          {/* Deadline */}
          <div className="flex items-center gap-1.5">
            <FiClock
              className={`w-4 h-4 ${
                deadlineStatus.color === "red"
                  ? "text-red-500"
                  : deadlineStatus.color === "orange"
                  ? "text-orange-500"
                  : deadlineStatus.color === "yellow"
                  ? "text-yellow-500"
                  : deadlineStatus.color === "green"
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                deadlineStatus.color === "red"
                  ? "text-red-600 dark:text-red-400"
                  : deadlineStatus.color === "orange"
                  ? "text-orange-600 dark:text-orange-400"
                  : deadlineStatus.color === "yellow"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-gray-600 dark:text-dark-text-secondary"
              }`}
            >
              {deadlineStatus.label}
            </span>
          </div>

          {/* Last Activity */}
          <div className="flex items-center gap-1.5">
            <FiTrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
              {getTimeAgo(lastActivityAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
