/**
 * Sidebar Components - Barrel Export
 *
 * Components for the NegotiationRoom sidebar redesign.
 */

// Collapsible Parameter Card (self-managed state)
export {
  default as CollapsibleParameterCard,
  WeightBar,
  ParameterValueRow,
  type ParameterCardConfig,
} from "./CollapsibleParameterCard";

// Collapsible Section (accordion-style with external control)
export {
  default as CollapsibleSection,
  ParameterRow,
  SectionDivider,
  type CollapsibleSectionProps,
  type ParameterUtilityInfo,
} from "./CollapsibleSection";

// Weighted Utility Bar
export {
  default as WeightedUtilityBar,
  CompactUtilityBar,
  type WeightedUtilityBarProps,
  type RecommendationAction,
} from "./WeightedUtilityBar";

// Decision Threshold Zones
export {
  default as DecisionThresholdZones,
  CompactThresholdZones,
  type DecisionThresholds,
  type DecisionThresholdZonesProps,
} from "./DecisionThresholdZones";

// Unified Utility Bar (replaces WeightedUtilityBar + DecisionThresholdZones)
export {
  default as UnifiedUtilityBar,
  CompactUnifiedUtilityBar,
  type UnifiedUtilityBarProps,
  type RecommendationAction as UnifiedRecommendationAction,
  type DealStatus as UnifiedDealStatus,
} from "./UnifiedUtilityBar";

// Parameter Weights Chart
export {
  default as ParameterWeightsChart,
  CompactWeightsChart,
  PARAMETER_COLORS,
  getParameterColor,
} from "./ParameterWeightsChart";

// Convergence Chart (Adaptive Negotiation Engine)
export {
  default as ConvergenceChart,
} from "./ConvergenceChart";

// Parameter Formatter Utilities
export {
  formatParameterValue,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDays,
  formatBoolean,
  formatNumber,
  getParameterDisplayName,
  formatParameterIdAsLabel,
  inferParameterType,
  smartFormat,
  getUtilityStatusColor,
  formatUtilityChange,
  type ParameterType,
  type FormatOptions,
} from "./parameterFormatter";
