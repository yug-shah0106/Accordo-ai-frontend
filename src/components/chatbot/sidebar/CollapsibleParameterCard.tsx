/**
 * CollapsibleParameterCard Component
 *
 * A collapsible card component that displays negotiation parameter information
 * with expand/collapse functionality. Shows parameter title, weight badge,
 * and current value summary when collapsed.
 */

import { useState, type ReactNode } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export interface ParameterCardConfig {
  id: string;
  title: string;
  icon: ReactNode;
  iconColor: string;
  bgGradient: string;
  borderColor?: string;
  weight: number; // 0-100
  currentValue?: string | number | null;
  isLive?: boolean;
}

interface CollapsibleParameterCardProps {
  config: ParameterCardConfig;
  children: ReactNode;
  defaultExpanded?: boolean;
}

/**
 * Format weight as a display string
 */
function formatWeight(weight: number): string {
  return `${(weight * 100).toFixed(0)}%`;
}

/**
 * Get weight badge color based on importance level
 */
function getWeightBadgeStyles(weight: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (weight >= 0.4) {
    return {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
    };
  } else if (weight >= 0.25) {
    return {
      bg: "bg-orange-100",
      text: "text-orange-700",
      border: "border-orange-200",
    };
  } else if (weight >= 0.15) {
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

export default function CollapsibleParameterCard({
  config,
  children,
  defaultExpanded = false,
}: CollapsibleParameterCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const weightStyles = getWeightBadgeStyles(config.weight);

  return (
    <div
      className={`${config.bgGradient} rounded-lg shadow-sm overflow-hidden ${
        config.borderColor ? `border ${config.borderColor}` : ""
      }`}
    >
      {/* Clickable Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={config.iconColor}>{config.icon}</span>
          <h3 className="text-sm font-bold text-gray-900 truncate">
            {config.title}
          </h3>
          {config.isLive && (
            <span className="text-xs text-indigo-600 animate-pulse flex-shrink-0">
              ● Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* Weight Badge */}
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${weightStyles.bg} ${weightStyles.text} border ${weightStyles.border}`}
            title={`Weight: ${formatWeight(config.weight)} importance`}
          >
            {formatWeight(config.weight)}
          </span>

          {/* Current Value Summary (when collapsed) */}
          {!isExpanded && config.currentValue !== undefined && config.currentValue !== null && (
            <span className="text-xs text-gray-600 font-medium max-w-[80px] truncate">
              {typeof config.currentValue === "number"
                ? `$${config.currentValue.toFixed(2)}`
                : config.currentValue}
            </span>
          )}

          {/* Expand/Collapse Icon */}
          {isExpanded ? (
            <FiChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? "max-h-[800px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}

/**
 * Weight Bar Component - Shows visual representation of parameter weight
 */
export function WeightBar({
  weight,
  color = "blue",
}: {
  weight: number;
  color?: "blue" | "purple" | "green" | "orange" | "red";
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-gradient-to-r from-blue-500 to-blue-600",
    purple: "bg-gradient-to-r from-purple-500 to-purple-600",
    green: "bg-gradient-to-r from-green-500 to-green-600",
    orange: "bg-gradient-to-r from-orange-500 to-orange-600",
    red: "bg-gradient-to-r from-red-500 to-red-600",
  };

  return (
    <div className="pt-3 border-t border-gray-200">
      <div className="flex justify-between text-xs mb-2">
        <span className="text-gray-700 font-medium">Weight (Importance)</span>
        <span className={`font-bold text-${color}-700`}>
          {(weight * 100).toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-500`}
          style={{ width: `${weight * 100}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Parameter Value Row - Shows a label/value pair with optional styling
 */
export function ParameterValueRow({
  label,
  value,
  originalValue,
  valueColor = "gray",
  highlight = false,
}: {
  label: string;
  value: string | number | null;
  originalValue?: string | number | null;
  valueColor?: "blue" | "green" | "orange" | "red" | "purple" | "gray";
  highlight?: boolean;
}) {
  const hasChanged = originalValue !== undefined && originalValue !== value;

  const colorClasses: Record<string, string> = {
    blue: "text-blue-700",
    green: "text-green-700",
    orange: "text-orange-700",
    red: "text-red-700",
    purple: "text-purple-700",
    gray: "text-gray-900",
  };

  return (
    <div
      className={highlight ? "ring-2 ring-purple-400 rounded-lg p-2 bg-white" : ""}
    >
      <div className="flex justify-between text-xs mb-1.5">
        <span className={`font-medium ${highlight ? "text-purple-900 font-bold" : "text-gray-700"}`}>
          {label}
        </span>
        <div className="flex flex-col items-end">
          <span className={`font-bold ${colorClasses[valueColor]}`}>
            {value ?? "N/A"}
          </span>
          {hasChanged && (
            <span className="text-xs text-gray-500 line-through">
              {originalValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
