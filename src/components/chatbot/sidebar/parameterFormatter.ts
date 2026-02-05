/**
 * Parameter Formatter Utility
 *
 * Provides formatting functions for negotiation parameter values
 * with support for currencies, dates, percentages, and custom formats.
 */

export type ParameterType =
  | "currency"
  | "percentage"
  | "date"
  | "days"
  | "boolean"
  | "text"
  | "number";

/**
 * Format a value based on its parameter type
 */
export function formatParameterValue(
  value: number | string | boolean | null | undefined,
  type: ParameterType,
  options: FormatOptions = {}
): string {
  if (value === null || value === undefined) {
    return options.nullPlaceholder ?? "N/A";
  }

  switch (type) {
    case "currency":
      return formatCurrency(value as number, options);
    case "percentage":
      return formatPercentage(value as number, options);
    case "date":
      return formatDate(value as string, options);
    case "days":
      return formatDays(value as number, options);
    case "boolean":
      return formatBoolean(value as boolean, options);
    case "number":
      return formatNumber(value as number, options);
    case "text":
    default:
      return String(value);
  }
}

export interface FormatOptions {
  locale?: string;
  currency?: string;
  decimals?: number;
  compact?: boolean;
  nullPlaceholder?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  options: FormatOptions = {}
): string {
  const { locale = "en-US", currency = "USD", decimals = 2, compact = false } = options;

  if (compact && value >= 1000) {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return formatter.format(value);
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(value);
}

/**
 * Format a number as percentage (0-1 scale to 0-100%)
 */
export function formatPercentage(
  value: number,
  options: FormatOptions = {}
): string {
  const { decimals = 0, prefix = "", suffix = "%" } = options;

  // Handle both 0-1 and 0-100 scales
  const displayValue = value <= 1 ? value * 100 : value;

  return `${prefix}${displayValue.toFixed(decimals)}${suffix}`;
}

/**
 * Format a date string
 */
export function formatDate(
  value: string | Date,
  options: FormatOptions = {}
): string {
  const { locale = "en-US" } = options;

  try {
    const date = typeof value === "string" ? new Date(value) : value;

    if (isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(value);
  }
}

/**
 * Format days with appropriate suffix
 */
export function formatDays(
  value: number,
  options: FormatOptions = {}
): string {
  const { suffix = " days" } = options;
  return `${value}${value === 1 ? " day" : suffix}`;
}

/**
 * Format boolean as Yes/No
 */
export function formatBoolean(
  value: boolean,
  _options: FormatOptions = {}
): string {
  return value ? "Yes" : "No";
}

/**
 * Format a number with locale-aware formatting
 */
export function formatNumber(
  value: number,
  options: FormatOptions = {}
): string {
  const { locale = "en-US", decimals = 2 } = options;

  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(value);
}

/**
 * Get the display name for a parameter ID
 * UPDATED Feb 2026: Changed unit_price to total_price
 */
export function getParameterDisplayName(parameterId: string): string {
  const displayNames: Record<string, string> = {
    total_price: "Total Price",
    unit_price: "Total Price",  // Legacy support - map to Total Price
    target_price: "Target Price",
    max_acceptable_price: "Max Acceptable Price",
    anchor_price: "Anchor Price",
    payment_terms: "Payment Terms",
    delivery_date: "Delivery Date",
    warranty_period: "Warranty Period",
    late_delivery_penalty: "Late Delivery Penalty",
    quality_standards: "Quality Standards",
    sla_uptime: "SLA Uptime",
    concession_step: "Concession Step",
    max_rounds: "Max Rounds",
    accept_threshold: "Accept Threshold",
    walkaway_threshold: "Walk Away Threshold",
    escalation_threshold: "Escalation Threshold",
  };

  return displayNames[parameterId] || formatParameterIdAsLabel(parameterId);
}

/**
 * Convert a parameter ID to a human-readable label
 */
export function formatParameterIdAsLabel(parameterId: string): string {
  return parameterId
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Infer the parameter type from the parameter ID
 */
export function inferParameterType(parameterId: string): ParameterType {
  const lowerCaseId = parameterId.toLowerCase();

  if (
    lowerCaseId.includes("price") ||
    lowerCaseId.includes("cost") ||
    lowerCaseId.includes("amount")
  ) {
    return "currency";
  }

  if (
    lowerCaseId.includes("rate") ||
    lowerCaseId.includes("percentage") ||
    lowerCaseId.includes("threshold") ||
    lowerCaseId.includes("utility") ||
    lowerCaseId.includes("weight")
  ) {
    return "percentage";
  }

  if (
    lowerCaseId.includes("date") ||
    lowerCaseId.includes("deadline") ||
    lowerCaseId.includes("start") ||
    lowerCaseId.includes("end")
  ) {
    return "date";
  }

  if (
    lowerCaseId.includes("days") ||
    lowerCaseId.includes("period") ||
    lowerCaseId.includes("terms") ||
    lowerCaseId.includes("duration")
  ) {
    return "days";
  }

  if (
    lowerCaseId.includes("allowed") ||
    lowerCaseId.includes("enabled") ||
    lowerCaseId.includes("required")
  ) {
    return "boolean";
  }

  if (lowerCaseId.includes("round") || lowerCaseId.includes("count")) {
    return "number";
  }

  return "text";
}

/**
 * Smart format - automatically infers the type and formats accordingly
 */
export function smartFormat(
  value: number | string | boolean | null | undefined,
  parameterId: string,
  options: FormatOptions = {}
): string {
  const type = inferParameterType(parameterId);
  return formatParameterValue(value, type, options);
}

/**
 * Get status color based on utility value
 */
export function getUtilityStatusColor(utility: number): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  if (utility >= 0.8) {
    return {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
      label: "Excellent",
    };
  } else if (utility >= 0.6) {
    return {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      label: "Good",
    };
  } else if (utility >= 0.4) {
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
      label: "Fair",
    };
  } else {
    return {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
      label: "Poor",
    };
  }
}

/**
 * Format utility change with arrow indicator
 */
export function formatUtilityChange(
  current: number,
  previous: number
): { text: string; className: string } {
  const diff = current - previous;
  const percentChange = (diff * 100).toFixed(1);

  if (diff > 0) {
    return {
      text: `+${percentChange}%`,
      className: "text-green-600",
    };
  } else if (diff < 0) {
    return {
      text: `${percentChange}%`,
      className: "text-red-600",
    };
  } else {
    return {
      text: "0%",
      className: "text-gray-500",
    };
  }
}
