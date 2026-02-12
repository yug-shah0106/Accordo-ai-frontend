/**
 * WeightedUtilitySidebar Component
 *
 * Displays weighted utility visualization with four-zone thresholds:
 * - Accept Zone: ≥70% (green)
 * - Counter Zone: 50-70% (blue)
 * - Escalate Zone: 30-50% (orange)
 * - Walk Away Zone: <30% (red)
 *
 * Shows current utility score position and parameter-level breakdown.
 */

import { useState } from "react";
import { FiChevronDown, FiChevronUp, FiActivity, FiTarget, FiAlertTriangle, FiCheckCircle, FiXCircle, FiHelpCircle } from "react-icons/fi";

// Types matching backend WeightedUtilityResult
interface ParameterUtility {
  parameterId: string;
  parameterName: string;
  utility: number;        // 0-1
  weight: number;         // 0-100
  contribution: number;   // utility × (weight / 100)
  currentValue: number | string | boolean | null;
  targetValue: number | string | boolean | null;
  maxValue?: number | string | null;
  status: "excellent" | "good" | "warning" | "critical";
  color: string;
}

interface ThresholdConfig {
  accept: number;    // Default 0.70
  escalate: number;  // Default 0.50
  walkAway: number;  // Default 0.30
}

interface WeightedUtilityData {
  totalUtility: number;         // 0-1
  totalUtilityPercent: number;  // 0-100
  parameterUtilities: Record<string, ParameterUtility>;
  thresholds: ThresholdConfig;
  recommendation: "ACCEPT" | "COUNTER" | "ESCALATE" | "WALK_AWAY";
  recommendationReason: string;
}

interface WeightedUtilitySidebarProps {
  utilityData: WeightedUtilityData | null;
  loading?: boolean;
  isLive?: boolean;
  round?: number;
  onRefresh?: () => void;
}

// Zone colors
const ZONE_COLORS = {
  accept: { bg: "bg-green-500", text: "text-green-700", bgLight: "bg-green-50", border: "border-green-200" },
  counter: { bg: "bg-blue-500", text: "text-blue-700", bgLight: "bg-blue-50", border: "border-blue-200" },
  escalate: { bg: "bg-orange-500", text: "text-orange-700", bgLight: "bg-orange-50", border: "border-orange-200" },
  walkAway: { bg: "bg-red-500", text: "text-red-700", bgLight: "bg-red-50", border: "border-red-200" },
};

// Get zone from utility score
function getZone(utility: number, thresholds: ThresholdConfig): keyof typeof ZONE_COLORS {
  if (utility >= thresholds.accept) return "accept";
  if (utility >= thresholds.escalate) return "counter";
  if (utility >= thresholds.walkAway) return "escalate";
  return "walkAway";
}

// Get recommendation icon
function RecommendationIcon({ recommendation }: { recommendation: string }) {
  switch (recommendation) {
    case "ACCEPT":
      return <FiCheckCircle className="w-5 h-5 text-green-600" />;
    case "COUNTER":
      return <FiTarget className="w-5 h-5 text-blue-600" />;
    case "ESCALATE":
      return <FiAlertTriangle className="w-5 h-5 text-orange-600" />;
    case "WALK_AWAY":
      return <FiXCircle className="w-5 h-5 text-red-600" />;
    default:
      return <FiHelpCircle className="w-5 h-5 text-gray-600" />;
  }
}

// Format value for display
function formatValue(value: number | string | boolean | null): string {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (value >= 1) {
      return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${(value * 100).toFixed(0)}%`;
  }
  // Check for ISO date string format
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }
  return String(value);
}

export default function WeightedUtilitySidebar({
  utilityData,
  loading = false,
  isLive = false,
  round = 0,
  onRefresh,
}: WeightedUtilitySidebarProps) {
  const [showDetails, setShowDetails] = useState(true);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 shadow-sm">
        <div className="text-center text-gray-500 text-sm py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          Loading utility data...
        </div>
      </div>
    );
  }

  if (!utilityData) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiActivity className="w-5 h-5 text-slate-600" />
          Weighted Utility
        </h3>
        <div className="text-center text-gray-500 text-sm py-4">
          No utility data available yet. Start negotiating to see utility scores.
        </div>
      </div>
    );
  }

  const { totalUtility, totalUtilityPercent, parameterUtilities, thresholds, recommendation, recommendationReason } = utilityData;
  const currentZone = getZone(totalUtility, thresholds);
  const zoneColor = ZONE_COLORS[currentZone];
  const parameters = Object.values(parameterUtilities).sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-4">
      {/* Main Utility Score Card */}
      <div className={`${zoneColor.bgLight} ${zoneColor.border} border rounded-lg p-5 shadow-sm`}>
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiActivity className="w-5 h-5 text-slate-600" />
          Weighted Utility Score
          {isLive && round > 0 && (
            <span className="ml-auto text-xs text-blue-600 animate-pulse">● Live</span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="ml-auto text-gray-500 hover:text-gray-700"
              title="Refresh utility data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </h3>

        {/* Large Score Display */}
        <div className="text-center mb-4">
          <div className={`text-5xl font-bold ${zoneColor.text}`}>
            {totalUtilityPercent.toFixed(0)}%
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <RecommendationIcon recommendation={recommendation} />
            <span className={`text-sm font-semibold ${zoneColor.text}`}>
              {recommendation.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Four-Zone Visualization Bar */}
        <div className="relative mb-4">
          <div className="flex h-8 rounded-lg overflow-hidden">
            {/* Walk Away Zone (0-30%) */}
            <div
              className="bg-red-400 flex items-center justify-center"
              style={{ width: `${thresholds.walkAway * 100}%` }}
              title={`Walk Away: <${(thresholds.walkAway * 100).toFixed(0)}%`}
            >
              <span className="text-xs text-white font-medium hidden sm:block">Walk</span>
            </div>
            {/* Escalate Zone (30-50%) */}
            <div
              className="bg-orange-400 flex items-center justify-center"
              style={{ width: `${(thresholds.escalate - thresholds.walkAway) * 100}%` }}
              title={`Escalate: ${(thresholds.walkAway * 100).toFixed(0)}-${(thresholds.escalate * 100).toFixed(0)}%`}
            >
              <span className="text-xs text-white font-medium hidden sm:block">Escalate</span>
            </div>
            {/* Counter Zone (50-70%) */}
            <div
              className="bg-blue-400 flex items-center justify-center"
              style={{ width: `${(thresholds.accept - thresholds.escalate) * 100}%` }}
              title={`Counter: ${(thresholds.escalate * 100).toFixed(0)}-${(thresholds.accept * 100).toFixed(0)}%`}
            >
              <span className="text-xs text-white font-medium hidden sm:block">Counter</span>
            </div>
            {/* Accept Zone (70-100%) */}
            <div
              className="bg-green-400 flex items-center justify-center"
              style={{ width: `${(1 - thresholds.accept) * 100}%` }}
              title={`Accept: ≥${(thresholds.accept * 100).toFixed(0)}%`}
            >
              <span className="text-xs text-white font-medium hidden sm:block">Accept</span>
            </div>
          </div>

          {/* Current Score Indicator */}
          <div
            className="absolute top-0 h-full w-1 bg-gray-900 shadow-lg transition-all duration-700"
            style={{ left: `${Math.max(0, Math.min(100, totalUtilityPercent))}%` }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {totalUtilityPercent.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Zone Legend */}
        <div className="grid grid-cols-4 gap-1 text-xs">
          <div className="text-center">
            <div className="w-3 h-3 bg-red-400 rounded-full mx-auto mb-1"></div>
            <span className="text-gray-600">&lt;{(thresholds.walkAway * 100).toFixed(0)}%</span>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-orange-400 rounded-full mx-auto mb-1"></div>
            <span className="text-gray-600">{(thresholds.walkAway * 100).toFixed(0)}-{(thresholds.escalate * 100).toFixed(0)}%</span>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mx-auto mb-1"></div>
            <span className="text-gray-600">{(thresholds.escalate * 100).toFixed(0)}-{(thresholds.accept * 100).toFixed(0)}%</span>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-1"></div>
            <span className="text-gray-600">≥{(thresholds.accept * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Recommendation Reason */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">{recommendationReason}</p>
        </div>
      </div>

      {/* Parameter Breakdown (Collapsible) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
        >
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FiTarget className="w-5 h-5 text-blue-600" />
            Parameter Breakdown
            <span className="text-xs font-normal text-gray-500">({parameters.length} params)</span>
          </h3>
          {showDetails ? (
            <FiChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {showDetails && (
          <div className="px-5 pb-5 space-y-4">
            {parameters.map((param) => (
              <ParameterRow key={param.parameterId} param={param} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual parameter row component
function ParameterRow({ param }: { param: ParameterUtility }) {
  const statusColors: Record<string, { bg: string; text: string }> = {
    excellent: { bg: "bg-green-100", text: "text-green-800" },
    good: { bg: "bg-blue-100", text: "text-blue-800" },
    warning: { bg: "bg-yellow-100", text: "text-yellow-800" },
    critical: { bg: "bg-red-100", text: "text-red-800" },
  };

  const color = statusColors[param.status] || statusColors.warning;

  return (
    <div className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      {/* Header: Name, Weight, Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{param.parameterName}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
            {param.status}
          </span>
        </div>
        <span className="text-xs text-gray-500 font-medium">{param.weight}% weight</span>
      </div>

      {/* Utility Bar */}
      <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${param.utility * 100}%`,
            backgroundColor: param.color,
          }}
        />
      </div>

      {/* Values Row */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Current:</span>
          <span className="font-medium text-gray-900">{formatValue(param.currentValue)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Target:</span>
          <span className="font-medium text-gray-700">{formatValue(param.targetValue)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Contribution:</span>
          <span className="font-bold" style={{ color: param.color }}>
            {(param.contribution * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
