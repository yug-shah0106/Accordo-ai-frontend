import React, { useEffect, useMemo } from "react";
import { AlertCircle, RotateCcw, Sparkles } from "lucide-react";
import type {
  DealWizardStepFour,
  DealWizardStepTwo,
  DealWizardStepThree,
  ParameterWeight,
  CustomParameter,
} from "../../../types/chatbot";
import DonutChart, { CHART_COLORS } from "./DonutChart";

interface StepFourProps {
  data: DealWizardStepFour;
  onChange: (data: DealWizardStepFour) => void;
  stepTwoData: DealWizardStepTwo;
  stepThreeData: DealWizardStepThree;
  errors?: Record<string, string>;
}

// Parameter definitions for display
const STEP2_PARAMETERS = [
  { id: "targetUnitPrice", name: "Target Unit Price", source: "step2" as const },
  { id: "maxAcceptablePrice", name: "Max Acceptable Price", source: "step2" as const },
  { id: "volumeDiscountExpectation", name: "Volume Discount", source: "step2" as const },
  { id: "paymentTermsRange", name: "Payment Terms Range", source: "step2" as const },
  { id: "advancePaymentLimit", name: "Advance Payment Limit", source: "step2" as const },
  { id: "deliveryDate", name: "Delivery Date", source: "step2" as const },
  { id: "partialDelivery", name: "Partial Delivery", source: "step2" as const },
];

const STEP3_PARAMETERS = [
  { id: "warrantyPeriod", name: "Warranty Period", source: "step3" as const },
  { id: "lateDeliveryPenalty", name: "Late Delivery Penalty", source: "step3" as const },
  { id: "qualityStandards", name: "Quality Standards", source: "step3" as const },
  { id: "maxRounds", name: "Max Negotiation Rounds", source: "step3" as const },
  { id: "walkawayThreshold", name: "Walkaway Threshold", source: "step3" as const },
];

// Default weights distribution (AI-suggested)
const getDefaultWeights = (): Record<string, number> => ({
  targetUnitPrice: 25,
  maxAcceptablePrice: 15,
  volumeDiscountExpectation: 5,
  paymentTermsRange: 15,
  advancePaymentLimit: 5,
  deliveryDate: 10,
  partialDelivery: 3,
  warrantyPeriod: 7,
  lateDeliveryPenalty: 5,
  qualityStandards: 5,
  maxRounds: 2,
  walkawayThreshold: 3,
});

/**
 * Weight Slider Component
 */
const WeightSlider: React.FC<{
  parameterId: string;
  parameterName: string;
  weight: number;
  color: string;
  onChange: (weight: number) => void;
}> = ({ parameterId: _parameterId, parameterName, weight, color, onChange }) => {
  const percentage = weight;

  return (
    <div className="flex items-center gap-4 py-3 px-4 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
      {/* Color indicator */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Parameter name */}
      <div className="w-40 flex-shrink-0">
        <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
          {parameterName}
        </span>
      </div>

      {/* Slider */}
      <div className="flex-1 relative">
        {/* Track background */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Filled track */}
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        {/* Slider input (transparent, overlaid) */}
        <input
          type="range"
          min={0}
          max={100}
          value={weight}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Thumb indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 rounded-full shadow-md pointer-events-none transition-all duration-150"
          style={{
            left: `calc(${percentage}% - 8px)`,
            borderColor: color,
          }}
        />
      </div>

      {/* Value display */}
      <div className="w-16 text-center">
        <span
          className="text-sm font-semibold px-2 py-1 rounded"
          style={{
            backgroundColor: `${color}20`,
            color: color,
          }}
        >
          {weight}%
        </span>
      </div>
    </div>
  );
};

/**
 * StepFour Component
 * Parameter Weights step of the deal creation wizard
 */
export default function StepFour({
  data,
  onChange,
  stepTwoData: _stepTwoData,
  stepThreeData,
  errors,
}: StepFourProps) {
  // Build list of all parameters based on Steps 2 & 3
  const allParameters = useMemo(() => {
    const params: Array<{ id: string; name: string; source: "step2" | "step3" | "custom" }> = [];

    // Add Step 2 parameters
    STEP2_PARAMETERS.forEach((p) => params.push(p));

    // Add Step 3 parameters
    STEP3_PARAMETERS.forEach((p) => params.push(p));

    // Add custom parameters from Step 3 (only those included in negotiation)
    stepThreeData.customParameters
      .filter((cp: CustomParameter) => cp.includeInNegotiation)
      .forEach((cp: CustomParameter) => {
        params.push({
          id: `custom_${cp.name.toLowerCase().replace(/\s+/g, "_")}`,
          name: cp.name,
          source: "custom",
        });
      });

    return params;
  }, [stepThreeData.customParameters]);

  // Initialize weights when entering step (if not already set)
  useEffect(() => {
    if (data.weights.length === 0) {
      initializeWeights();
    }
  }, [allParameters]);

  const initializeWeights = () => {
    const defaultWeights = getDefaultWeights();
    const customParamCount = allParameters.filter((p) => p.source === "custom").length;

    // Distribute weights
    const weights: ParameterWeight[] = allParameters.map((param, index) => {
      let defaultWeight = defaultWeights[param.id] || 0;

      // For custom parameters, distribute remaining weight equally
      if (param.source === "custom" && customParamCount > 0) {
        // Reserve 10% for custom parameters, distribute equally
        defaultWeight = Math.floor(10 / customParamCount);
      }

      return {
        parameterId: param.id,
        parameterName: param.name,
        weight: defaultWeight,
        source: param.source,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    // Calculate total
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

    onChange({
      weights,
      aiSuggested: true,
      totalWeight,
    });
  };

  /**
   * Auto-adjust weights to maintain 100% total
   * - Equal adjustment: All other non-zero parameters reduced by the same amount
   * - Skip zeros: Parameters at 0% stay at 0%
   * - No minimum: Parameters can go down to 0%
   * - Real-time: Adjust immediately on slider change
   */
  const handleWeightChange = (parameterId: string, newWeight: number) => {
    // Find the current weight of the parameter being changed
    const currentParam = data.weights.find((w) => w.parameterId === parameterId);
    if (!currentParam) return;

    const oldWeight = currentParam.weight;
    const weightDifference = newWeight - oldWeight;

    // If no change, do nothing
    if (weightDifference === 0) return;

    // Get all other parameters that can be adjusted (non-zero weights, excluding current)
    const adjustableParams = data.weights.filter(
      (w) => w.parameterId !== parameterId && w.weight > 0
    );

    // If there are no adjustable parameters, just update the current one
    if (adjustableParams.length === 0) {
      const updatedWeights = data.weights.map((w) =>
        w.parameterId === parameterId ? { ...w, weight: newWeight } : w
      );
      onChange({
        ...data,
        weights: updatedWeights,
        aiSuggested: false,
        totalWeight: 100,
      });
      return;
    }

    // Calculate how much each adjustable parameter needs to change (equal distribution)
    const adjustmentPerParam = weightDifference / adjustableParams.length;

    // Apply adjustments
    let updatedWeights = data.weights.map((w) => {
      if (w.parameterId === parameterId) {
        return { ...w, weight: newWeight };
      }
      if (w.weight === 0) {
        // Skip zero-weight parameters
        return w;
      }
      // Reduce by equal amount, but don't go below 0
      const adjustedWeight = Math.max(0, w.weight - adjustmentPerParam);
      return { ...w, weight: Math.round(adjustedWeight * 100) / 100 };
    });

    // Round all weights to integers for cleaner display
    updatedWeights = updatedWeights.map((w) => ({
      ...w,
      weight: Math.round(w.weight),
    }));

    // Calculate the new total (may not be exactly 100 due to rounding)
    let totalWeight = updatedWeights.reduce((sum, w) => sum + w.weight, 0);

    // Fix any rounding errors by adjusting the largest adjustable parameter
    if (totalWeight !== 100) {
      const diff = 100 - totalWeight;
      // Find the largest adjustable parameter (not the one we just changed)
      const sortedAdjustable = updatedWeights
        .filter((w) => w.parameterId !== parameterId && w.weight > 0)
        .sort((a, b) => b.weight - a.weight);

      if (sortedAdjustable.length > 0) {
        const targetId = sortedAdjustable[0].parameterId;
        updatedWeights = updatedWeights.map((w) =>
          w.parameterId === targetId
            ? { ...w, weight: Math.max(0, w.weight + diff) }
            : w
        );
      }
      totalWeight = 100;
    }

    onChange({
      ...data,
      weights: updatedWeights,
      aiSuggested: false,
      totalWeight,
    });
  };

  const handleResetToDefaults = () => {
    initializeWeights();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
            Parameter Weights
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
            Adjust the importance of each negotiation parameter. Other weights auto-adjust to maintain 100%.
          </p>
        </div>

        {/* AI Suggested Badge */}
        {data.aiSuggested && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Suggested</span>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Column */}
        <div className="lg:col-span-2 space-y-3">
          {data.weights.map((weight) => (
            <WeightSlider
              key={weight.parameterId}
              parameterId={weight.parameterId}
              parameterName={weight.parameterName}
              weight={weight.weight}
              color={weight.color || CHART_COLORS[0]}
              onChange={(newWeight) => handleWeightChange(weight.parameterId, newWeight)}
            />
          ))}
        </div>

        {/* Right Column: Donut Chart + Summary */}
        <div className="space-y-4">
          {/* Donut Chart */}
          <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 flex flex-col items-center">
            <DonutChart
              weights={data.weights}
              totalWeight={data.totalWeight}
              size={180}
            />

            {/* Status Summary */}
            <div className="mt-4 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-dark-text-secondary">Total:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {Math.round(data.totalWeight)}%
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-secondary text-center">
                Weights auto-balance to 100%
              </p>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetToDefaults}
              className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              How Weights Work
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              Higher weights indicate more important parameters. The AI uses these weights
              to calculate utility scores and make negotiation decisions. Parameters with
              0% weight are ignored during negotiation.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors?.stepFour && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{errors.stepFour}</p>
        </div>
      )}
    </div>
  );
}
