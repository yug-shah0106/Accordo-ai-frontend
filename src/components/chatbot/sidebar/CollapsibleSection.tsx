/**
 * CollapsibleSection Component
 *
 * An accordion-style collapsible section with external state control.
 * Used for displaying parameter groups in the negotiation dashboard sidebar.
 * Supports accordion behavior (one section open at a time) via isOpen/onToggle props.
 */

import type { ReactNode } from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";

export interface CollapsibleSectionProps {
  title: string;
  icon: ReactNode;
  weight: number; // 0-100 (percentage)
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  gradientColors: string; // Tailwind gradient classes e.g., "from-blue-50 to-indigo-50"
  borderColor?: string;
  isLive?: boolean;
}

/**
 * Get weight badge styling based on importance level
 */
function getWeightBadgeStyles(weight: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (weight >= 40) {
    return {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
    };
  } else if (weight >= 25) {
    return {
      bg: "bg-orange-100",
      text: "text-orange-700",
      border: "border-orange-200",
    };
  } else if (weight >= 15) {
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
    };
  } else {
    return {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
    };
  }
}

export default function CollapsibleSection({
  title,
  icon,
  weight,
  isOpen,
  onToggle,
  children,
  gradientColors,
  borderColor = "border-gray-200",
  isLive = false,
}: CollapsibleSectionProps) {
  const weightStyles = getWeightBadgeStyles(weight);

  return (
    <div
      className={`bg-gradient-to-br ${gradientColors} rounded-lg shadow-sm overflow-hidden border ${borderColor} transition-shadow duration-200 ${
        isOpen ? "shadow-md" : "hover:shadow-md"
      }`}
    >
      {/* Clickable Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/40 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Expand/Collapse Icon */}
          {isOpen ? (
            <FiChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          ) : (
            <FiChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )}

          {/* Section Icon */}
          <span className="text-gray-600 flex-shrink-0">{icon}</span>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {title}
          </h3>

          {/* Live Indicator */}
          {isLive && (
            <span className="text-xs text-indigo-600 animate-pulse flex-shrink-0 ml-1">
              Live
            </span>
          )}
        </div>

        {/* Weight Badge */}
        {weight > 0 && (
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${weightStyles.bg} ${weightStyles.text} border ${weightStyles.border} flex-shrink-0 ml-2`}
            title={`Weight: ${weight}% importance`}
          >
            {weight}%
          </span>
        )}
      </button>

      {/* Expandable Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pb-4 pt-1 border-t border-gray-200/50">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Utility status type for parameter display
 */
export interface ParameterUtilityInfo {
  utility: number; // 0-1 scale
  contribution: number; // weighted contribution to total
  status: "excellent" | "good" | "warning" | "critical";
  currentValue?: number | string | boolean | null;
}

/**
 * ParameterRow Component - Shows a label/value pair for wizard parameters
 * Enhanced with optional utility score display and range visualization
 */
export function ParameterRow({
  label,
  value,
  type = "text",
  highlight = false,
  utilityInfo,
  rangeMin,
  rangeMax,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  type?: "currency" | "percentage" | "date" | "days" | "text" | "boolean" | "list" | "number";
  highlight?: boolean;
  utilityInfo?: ParameterUtilityInfo;
  rangeMin?: number;
  rangeMax?: number;
}) {
  if (value === null || value === undefined || value === "" || value === 0) {
    return null; // Hide zero/empty values per requirements
  }

  const formatValue = (): string => {
    if (value === null || value === undefined) return "N/A";

    switch (type) {
      case "currency":
        return typeof value === "number"
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            }).format(value)
          : String(value);
      case "percentage":
        return typeof value === "number" ? `${value}%` : String(value);
      case "date":
        if (typeof value === "string") {
          const date = new Date(value);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }
        return String(value);
      case "days":
        return typeof value === "number" ? `${value} days` : String(value);
      case "boolean":
        return value ? "Yes" : "No";
      case "number":
        return typeof value === "number"
          ? new Intl.NumberFormat("en-US").format(value)
          : String(value);
      case "list":
        return Array.isArray(value) ? value.join(", ") : String(value);
      default:
        return String(value);
    }
  };

  // Get utility badge color
  const getUtilityColor = (status: string): { bg: string; text: string; border: string } => {
    switch (status) {
      case "excellent":
        return { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" };
      case "good":
        return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" };
      case "warning":
        return { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" };
      case "critical":
        return { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
    }
  };

  const hasRange = rangeMin !== undefined && rangeMax !== undefined && rangeMin !== rangeMax;
  const hasUtility = utilityInfo && utilityInfo.utility !== undefined;

  return (
    <div className={`py-1.5 ${highlight ? "bg-purple-50 -mx-2 px-2 rounded" : ""}`}>
      {/* Main row: label and value */}
      <div className="flex justify-between items-center">
        <span
          className={`text-xs ${
            highlight ? "text-purple-700 font-medium" : "text-gray-600"
          }`}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          {/* Utility badge (if available) */}
          {hasUtility && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                getUtilityColor(utilityInfo.status).bg
              } ${getUtilityColor(utilityInfo.status).text} border ${
                getUtilityColor(utilityInfo.status).border
              }`}
              title={`Utility: ${Math.round(utilityInfo.utility * 100)}%, Contribution: ${(utilityInfo.contribution * 100).toFixed(1)}%`}
            >
              {Math.round(utilityInfo.utility * 100)}%
            </span>
          )}
          <span
            className={`text-xs font-medium ${
              highlight ? "text-purple-900" : "text-gray-900"
            }`}
          >
            {formatValue()}
          </span>
        </div>
      </div>

      {/* Range bar (if applicable) */}
      {hasRange && typeof value === "number" && (
        <div className="mt-1">
          <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
            {/* Range indicator */}
            <div
              className="absolute h-full bg-gradient-to-r from-blue-300 to-blue-500 rounded-full"
              style={{
                left: `${((rangeMin - rangeMin) / (rangeMax - rangeMin)) * 100}%`,
                width: `${((rangeMax - rangeMin) / (rangeMax - rangeMin)) * 100}%`,
              }}
            />
            {/* Current value indicator */}
            <div
              className="absolute w-2 h-2 bg-blue-600 rounded-full -top-0.5 shadow-sm border border-white"
              style={{
                left: `${Math.min(100, Math.max(0, ((value - rangeMin) / (rangeMax - rangeMin)) * 100))}%`,
                transform: "translateX(-50%)",
              }}
            />
          </div>
          <div className="flex justify-between mt-0.5 text-[9px] text-gray-500">
            <span>
              {type === "currency"
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(rangeMin)
                : rangeMin}
            </span>
            <span>
              {type === "currency"
                ? new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(rangeMax)
                : rangeMax}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SectionDivider Component - Subtle divider between parameter groups
 */
export function SectionDivider() {
  return <div className="border-t border-gray-200/60 my-2" />;
}
