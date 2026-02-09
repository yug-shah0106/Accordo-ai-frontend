/**
 * WeightedUtilityBar Component
 *
 * Enhanced utility display with:
 * - Circular progress indicator with animated fill
 * - Sparkline trend visualization
 * - Breakdown by parameter categories
 * - Color-coded based on utility score zones
 */

import { FiActivity, FiTrendingUp, FiTrendingDown, FiZap } from "react-icons/fi";

export type RecommendationAction =
  | "ACCEPT"
  | "COUNTER"
  | "ESCALATE"
  | "WALK_AWAY"
  | "ASK_CLARIFY";

export interface UtilityBreakdown {
  price?: number;
  payment?: number;
  delivery?: number;
  contract?: number;
  custom?: number;
}

export interface WeightedUtilityBarProps {
  percentage: number; // 0-100
  recommendation: RecommendationAction;
  isLive?: boolean;
  previousPercentage?: number; // For showing trend
  historyData?: number[]; // Array of past utility values for sparkline
  breakdown?: UtilityBreakdown; // Per-category utility breakdown
}

/**
 * Get color classes based on utility percentage
 */
function getUtilityColors(percentage: number): {
  gradient: string;
  text: string;
  bg: string;
  stroke: string;
  fill: string;
} {
  if (percentage >= 70) {
    return {
      gradient: "from-green-400 to-green-600",
      text: "text-green-700",
      bg: "bg-green-50",
      stroke: "#22C55E",
      fill: "#86EFAC",
    };
  } else if (percentage >= 50) {
    return {
      gradient: "from-blue-400 to-blue-600",
      text: "text-blue-700",
      bg: "bg-blue-50",
      stroke: "#3B82F6",
      fill: "#93C5FD",
    };
  } else if (percentage >= 30) {
    return {
      gradient: "from-orange-400 to-orange-600",
      text: "text-orange-700",
      bg: "bg-orange-50",
      stroke: "#F97316",
      fill: "#FDBA74",
    };
  } else {
    return {
      gradient: "from-red-400 to-red-600",
      text: "text-red-700",
      bg: "bg-red-50",
      stroke: "#EF4444",
      fill: "#FCA5A5",
    };
  }
}

/**
 * Get recommendation badge styling
 */
function getRecommendationStyles(recommendation: RecommendationAction): {
  bg: string;
  text: string;
  border: string;
  label: string;
  icon: string;
} {
  switch (recommendation) {
    case "ACCEPT":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
        label: "Accept",
        icon: "✓",
      };
    case "COUNTER":
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-300",
        label: "Counter",
        icon: "↔",
      };
    case "ESCALATE":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-300",
        label: "Escalate",
        icon: "↑",
      };
    case "WALK_AWAY":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
        label: "Walk Away",
        icon: "✕",
      };
    case "ASK_CLARIFY":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-300",
        label: "Clarify",
        icon: "?",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-300",
        label: recommendation,
        icon: "•",
      };
  }
}

/**
 * Mini Sparkline component for trend visualization
 */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;

  const width = 60;
  const height = 20;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((value - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Current value dot */}
      {data.length > 0 && (
        <circle
          cx={width - padding}
          cy={height - padding - ((data[data.length - 1] - min) / range) * (height - 2 * padding)}
          r="2"
          fill={color}
        />
      )}
    </svg>
  );
}

export default function WeightedUtilityBar({
  percentage,
  recommendation,
  isLive = false,
  previousPercentage,
  historyData,
  breakdown,
}: WeightedUtilityBarProps) {
  const colors = getUtilityColors(percentage);
  const recStyles = getRecommendationStyles(recommendation);

  // Calculate trend
  const hasTrend = previousPercentage !== undefined;
  const trendUp = hasTrend && percentage > previousPercentage;
  const trendDiff = hasTrend ? Math.abs(percentage - previousPercentage) : 0;

  // Check if breakdown has any data
  const hasBreakdown = breakdown && Object.values(breakdown).some(v => v !== undefined && v > 0);

  return (
    <div className={`${colors.bg} dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiActivity className={`w-4 h-4 ${colors.text}`} />
          <span className="text-sm font-semibold text-gray-800 dark:text-dark-text">
            Weighted Utility
          </span>
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
              <FiZap className="w-3 h-3 animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Trend indicator with sparkline */}
        <div className="flex items-center gap-2">
          {historyData && historyData.length >= 2 && (
            <Sparkline data={historyData} color={colors.stroke} />
          )}
          {hasTrend && trendDiff > 0 && (
            <div
              className={`flex items-center gap-0.5 text-xs font-medium ${
                trendUp ? "text-green-600" : "text-red-600"
              }`}
            >
              {trendUp ? (
                <FiTrendingUp className="w-3 h-3" />
              ) : (
                <FiTrendingDown className="w-3 h-3" />
              )}
              <span>
                {trendUp ? "+" : "-"}
                {trendDiff.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Display: Circular Progress + Percentage */}
      <div className="flex items-center gap-4 mb-3">
        {/* Circular Progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke={colors.stroke}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 35}
              strokeDashoffset={2 * Math.PI * 35 - (percentage / 100) * 2 * Math.PI * 35}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Center percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${colors.text}`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
          {/* Live pulse effect */}
          {isLive && (
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: colors.stroke }} />
          )}
        </div>

        {/* Breakdown bars (if available) */}
        {hasBreakdown ? (
          <div className="flex-1 space-y-1.5">
            {breakdown?.price !== undefined && breakdown.price > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-12 truncate">Price</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${breakdown.price}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 w-8 text-right">{breakdown.price.toFixed(0)}%</span>
              </div>
            )}
            {breakdown?.payment !== undefined && breakdown.payment > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-12 truncate">Payment</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${breakdown.payment}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 w-8 text-right">{breakdown.payment.toFixed(0)}%</span>
              </div>
            )}
            {breakdown?.delivery !== undefined && breakdown.delivery > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-12 truncate">Delivery</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${breakdown.delivery}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 w-8 text-right">{breakdown.delivery.toFixed(0)}%</span>
              </div>
            )}
            {breakdown?.contract !== undefined && breakdown.contract > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-12 truncate">Contract</span>
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${breakdown.contract}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 w-8 text-right">{breakdown.contract.toFixed(0)}%</span>
              </div>
            )}
          </div>
        ) : (
          /* Simple progress bar if no breakdown */
          <div className="flex-1">
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-700 ease-out relative`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              >
                {isLive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                )}
              </div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>

      {/* Recommendation Badge */}
      <div className="flex items-center justify-center">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${recStyles.bg} ${recStyles.text} border ${recStyles.border} shadow-sm`}
        >
          <span>{recStyles.icon}</span>
          {recStyles.label}
        </span>
      </div>
    </div>
  );
}

/**
 * Compact version for smaller spaces
 */
export function CompactUtilityBar({
  percentage,
  recommendation,
}: {
  percentage: number;
  recommendation: RecommendationAction;
}) {
  const colors = getUtilityColors(percentage);
  const recStyles = getRecommendationStyles(recommendation);

  return (
    <div className="flex items-center gap-3">
      {/* Mini progress bar */}
      <div className="flex-1">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`bg-gradient-to-r ${colors.gradient} h-full rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Percentage */}
      <span className={`text-sm font-bold ${colors.text}`}>
        {percentage.toFixed(0)}%
      </span>

      {/* Badge */}
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${recStyles.bg} ${recStyles.text}`}
      >
        {recStyles.label}
      </span>
    </div>
  );
}
