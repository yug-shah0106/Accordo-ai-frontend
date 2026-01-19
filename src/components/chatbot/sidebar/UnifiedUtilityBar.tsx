/**
 * UnifiedUtilityBar Component
 *
 * A unified linear gradient bar that combines Decision Threshold zones
 * with Weighted Utility indicator. Replaces the semi-circle gauge with
 * a clean horizontal bar showing current utility position.
 *
 * Features:
 * - Red to green gradient showing threshold zones
 * - Solid colored dot indicator at current utility position
 * - Zone labels with full names and percentage ranges
 * - Hover tooltip showing exact percentage
 * - Smooth animation when utility changes
 * - Terminal state handling with outcome badge
 * - Recommendation text display
 *
 * Created: January 2026
 */

import { useState, useMemo } from "react";
import { FiCheckCircle, FiXCircle, FiAlertTriangle } from "react-icons/fi";

/** Recommendation action types */
export type RecommendationAction = "ACCEPT" | "COUNTER" | "ESCALATE" | "WALK_AWAY";

/** Deal status types */
export type DealStatus = "NEGOTIATING" | "ACCEPTED" | "WALKED_AWAY" | "ESCALATED";

/** Props for the UnifiedUtilityBar component */
export interface UnifiedUtilityBarProps {
  /** Current utility percentage (0-100) */
  percentage: number;

  /** AI recommendation based on current utility */
  recommendation: RecommendationAction;

  /** Threshold values for decision zones (0-1 scale) */
  thresholds?: {
    accept: number;
    escalate: number;
    walkAway: number;
  };

  /** Current deal status for terminal state handling */
  dealStatus?: DealStatus;

  /** Optional: reason for current recommendation */
  recommendationReason?: string;

  /** Optional: className for custom styling */
  className?: string;
}

/**
 * Get the color class for the dot indicator based on percentage
 */
const getDotColor = (percentage: number): string => {
  if (percentage < 30) return "bg-red-500";
  if (percentage < 50) return "bg-orange-500";
  if (percentage < 70) return "bg-blue-500";
  return "bg-green-500";
};

/**
 * Get the recommendation display config
 */
const getRecommendationConfig = (recommendation: RecommendationAction) => {
  switch (recommendation) {
    case "ACCEPT":
      return {
        label: "Accept",
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      };
    case "COUNTER":
      return {
        label: "Counter",
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      };
    case "ESCALATE":
      return {
        label: "Escalate",
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      };
    case "WALK_AWAY":
      return {
        label: "Walk Away",
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-900/20",
      };
    default:
      return {
        label: "Evaluating",
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
      };
  }
};

/**
 * Outcome Badge Component for terminal states
 */
const OutcomeBadge = ({ status }: { status: DealStatus }) => {
  const config = {
    ACCEPTED: {
      icon: FiCheckCircle,
      text: "Deal Accepted",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-700 dark:text-green-300",
      iconColor: "text-green-600 dark:text-green-400",
    },
    WALKED_AWAY: {
      icon: FiXCircle,
      text: "Walked Away",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-700 dark:text-red-300",
      iconColor: "text-red-600 dark:text-red-400",
    },
    ESCALATED: {
      icon: FiAlertTriangle,
      text: "Escalated",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-700 dark:text-orange-300",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    NEGOTIATING: null,
  };

  const statusConfig = config[status];
  if (!statusConfig) return null;

  const Icon = statusConfig.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bgColor} mt-4`}
    >
      <Icon className={`w-4 h-4 ${statusConfig.iconColor}`} />
      <span className={`text-sm font-semibold ${statusConfig.textColor}`}>
        {statusConfig.text}
      </span>
    </div>
  );
};

/**
 * UnifiedUtilityBar Component
 *
 * Displays a linear gradient bar showing threshold zones with a dot indicator
 * showing the current utility position.
 */
export default function UnifiedUtilityBar({
  percentage,
  recommendation,
  thresholds = { accept: 0.7, escalate: 0.5, walkAway: 0.3 },
  dealStatus = "NEGOTIATING",
  recommendationReason,
  className = "",
}: UnifiedUtilityBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Clamp percentage between 0 and 100
  const clampedPercentage = useMemo(() => {
    return Math.max(0, Math.min(100, percentage));
  }, [percentage]);

  // Get dot color based on current zone
  const dotColorClass = useMemo(() => {
    return getDotColor(clampedPercentage);
  }, [clampedPercentage]);

  // Get recommendation config
  const recommendationConfig = useMemo(() => {
    return getRecommendationConfig(recommendation);
  }, [recommendation]);

  // Check if deal is in terminal state
  const isTerminalState = dealStatus !== "NEGOTIATING";

  // Convert thresholds to percentages for labels
  const walkAwayPercent = Math.round(thresholds.walkAway * 100);
  const escalatePercent = Math.round(thresholds.escalate * 100);
  const acceptPercent = Math.round(thresholds.accept * 100);

  return (
    <div className={`unified-utility-bar ${className}`}>
      {/* Section Header */}
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Negotiation Progress
      </h3>

      {/* Gradient Bar Container */}
      <div className="relative">
        {/* Gradient Bar */}
        <div
          className={`relative h-3.5 rounded-full overflow-hidden ${
            isTerminalState ? "opacity-70" : ""
          }`}
          style={{
            background: `linear-gradient(
              to right,
              #EF4444 0%,
              #EF4444 25%,
              #F97316 30%,
              #F97316 45%,
              #3B82F6 50%,
              #3B82F6 65%,
              #22C55E 70%,
              #22C55E 100%
            )`,
          }}
        >
          {/* Dot Indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${clampedPercentage}%`,
              transform: `translateX(-50%) translateY(-50%)`,
              transition: "left 0.3s ease-out",
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Dot */}
            <div
              className={`w-3 h-3 rounded-full ${dotColorClass} border-2 border-white dark:border-gray-800 shadow-md cursor-pointer`}
            />

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-900 text-white px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shadow-lg z-20">
                {clampedPercentage.toFixed(0)}%
                {/* Tooltip arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-900" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone Labels */}
        <div className="flex justify-between mt-3 text-xs">
          <div className="text-center flex-1">
            <span className="text-red-600 dark:text-red-400 font-medium">Walk Away</span>
            <br />
            <span className="text-gray-500 dark:text-gray-400">(&lt;{walkAwayPercent}%)</span>
          </div>
          <div className="text-center flex-1">
            <span className="text-orange-600 dark:text-orange-400 font-medium">Escalate</span>
            <br />
            <span className="text-gray-500 dark:text-gray-400">
              ({walkAwayPercent}-{escalatePercent}%)
            </span>
          </div>
          <div className="text-center flex-1">
            <span className="text-blue-600 dark:text-blue-400 font-medium">Counter</span>
            <br />
            <span className="text-gray-500 dark:text-gray-400">
              ({escalatePercent}-{acceptPercent}%)
            </span>
          </div>
          <div className="text-center flex-1">
            <span className="text-green-600 dark:text-green-400 font-medium">Accept</span>
            <br />
            <span className="text-gray-500 dark:text-gray-400">
              (&ge;{acceptPercent}%)
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation Text */}
      {!isTerminalState && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Recommendation:</span>
          <span
            className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${recommendationConfig.bgColor} ${recommendationConfig.color}`}
          >
            {recommendationConfig.label}
          </span>
        </div>
      )}

      {/* Recommendation Reason (if provided) */}
      {!isTerminalState && recommendationReason && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
          {recommendationReason}
        </p>
      )}

      {/* Outcome Badge for terminal states */}
      {isTerminalState && <OutcomeBadge status={dealStatus} />}
    </div>
  );
}

/**
 * Compact version of UnifiedUtilityBar for smaller spaces
 */
export function CompactUnifiedUtilityBar({
  percentage,
  recommendation,
  dealStatus = "NEGOTIATING",
}: Pick<UnifiedUtilityBarProps, "percentage" | "recommendation" | "dealStatus">) {
  const [showTooltip, setShowTooltip] = useState(false);

  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const dotColorClass = getDotColor(clampedPercentage);
  const isTerminalState = dealStatus !== "NEGOTIATING";

  return (
    <div className="compact-utility-bar">
      {/* Compact Gradient Bar */}
      <div
        className={`relative h-2 rounded-full overflow-hidden ${
          isTerminalState ? "opacity-70" : ""
        }`}
        style={{
          background: `linear-gradient(to right, #EF4444 0%, #F97316 30%, #3B82F6 50%, #22C55E 70%, #22C55E 100%)`,
        }}
      >
        {/* Dot Indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: `${clampedPercentage}%`,
            transform: `translateX(-50%) translateY(-50%)`,
            transition: "left 0.3s ease-out",
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div
            className={`w-2.5 h-2.5 rounded-full ${dotColorClass} border border-white dark:border-gray-800`}
          />

          {showTooltip && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap z-20">
              {clampedPercentage.toFixed(0)}%
            </div>
          )}
        </div>
      </div>

      {/* Compact Labels */}
      <div className="flex justify-between mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
        <span>Walk Away</span>
        <span>Escalate</span>
        <span>Counter</span>
        <span>Accept</span>
      </div>
    </div>
  );
}
