import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, RotateCcw, Sparkles, Lock, Unlock } from "lucide-react";
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
// UPDATED Feb 2026: Simplified to 5 core utility parameters
// paymentTerms replaces maxAcceptablePrice (avoids double-counting price dimension)
const STEP2_PARAMETERS = [
  { id: "targetUnitPrice", name: "Total Target Price", source: "step2" as const },
  { id: "paymentTerms", name: "Payment Terms", source: "step2" as const },
  { id: "deliveryDate", name: "Delivery Date", source: "step2" as const },
];

const STEP3_PARAMETERS = [
  { id: "warrantyPeriod", name: "Warranty Period", source: "step3" as const },
  { id: "qualityStandards", name: "Quality Standards", source: "step3" as const },
];

// Default weights distribution (AI-suggested)
// Updated Feb 2026: paymentTerms replaces maxAcceptablePrice
// Primary (85%): targetUnitPrice(40) + paymentTerms(25) + deliveryDate(20)
// Secondary (15%): warrantyPeriod(10) + qualityStandards(5)
const getDefaultWeights = (): Record<string, number> => ({
  targetUnitPrice: 40,
  paymentTerms: 25,
  deliveryDate: 20,
  warrantyPeriod: 10,
  qualityStandards: 5,
});

type StepSizeOption = 2 | 5 | 10 | 1;

const STEP_SIZE_OPTIONS: { value: StepSizeOption; label: string }[] = [
  { value: 2, label: "2%" },
  { value: 5, label: "5%" },
  { value: 10, label: "10%" },
  { value: 1, label: "Custom" },
];

const snapToStep = (value: number, step: number): number => {
  return Math.round(value / step) * step;
};

/**
 * Weight Slider Component
 */
const WeightSlider: React.FC<{
  parameterId: string;
  parameterName: string;
  weight: number;
  color: string;
  isLocked: boolean;
  stepSize: number;
  onChange: (weight: number) => void;
  onToggleLock: () => void;
}> = ({ parameterId: _parameterId, parameterName, weight, color, isLocked, stepSize, onChange, onToggleLock }) => {
  const percentage = weight;

  return (
    <div className={`flex items-center gap-4 py-3 px-4 bg-white dark:bg-dark-surface rounded-lg border transition-colors ${
      isLocked
        ? 'border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
        : 'border-gray-200 dark:border-dark-border hover:border-blue-300 dark:hover:border-blue-600'
    }`}>
      {/* Lock/Unlock button */}
      <button
        type="button"
        onClick={onToggleLock}
        className={`p-1 rounded transition-colors ${
          isLocked
            ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={isLocked ? 'Unlock (allow auto-adjustment)' : 'Lock (prevent auto-adjustment)'}
      >
        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
      </button>

      {/* Color indicator */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Parameter name */}
      <div className="w-40 flex-shrink-0">
        <span className={`text-sm font-medium ${isLocked ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-dark-text'}`}>
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
          step={stepSize}
          value={weight}
          onChange={(e) => onChange(snapToStep(parseInt(e.target.value), stepSize))}
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
          className={`text-sm font-semibold px-2 py-1 rounded ${isLocked ? 'ring-2 ring-blue-300 dark:ring-blue-600' : ''}`}
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
  // Track which parameters are locked (manually adjusted)
  const [lockedParams, setLockedParams] = useState<Set<string>>(new Set());
  // Step size for weight sliders (default 10%)
  const [stepSize, setStepSize] = useState<StepSizeOption>(10);

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

  // Get valid parameter IDs for filtering
  const validParamIds = useMemo(() => {
    return new Set(allParameters.map(p => p.id));
  }, [allParameters]);

  // Filter weights to only show valid parameters (removes deprecated ones)
  const filteredWeights = useMemo(() => {
    return data.weights.filter(w => validParamIds.has(w.parameterId));
  }, [data.weights, validParamIds]);

  // Initialize weights when entering step (if not already set or if parameters changed)
  useEffect(() => {
    // Re-initialize if:
    // 1. No weights exist
    // 2. Filtered weights count doesn't match expected parameters (old cached data)
    const expectedParamCount = allParameters.length;
    const validWeightsCount = filteredWeights.length;

    if (data.weights.length === 0 || validWeightsCount !== expectedParamCount) {
      initializeWeights();
    }
  }, [allParameters, filteredWeights.length]);

  const initializeWeights = (_step: StepSizeOption = stepSize) => {
    const defaultWeights = getDefaultWeights();
    const customParamCount = allParameters.filter((p) => p.source === "custom").length;

    // Do NOT snap defaults to stepSize — the preset values (40/25/20/10/5) are
    // exact and already sum to 100. Snapping them to the nearest 10% would
    // corrupt 25→30 and 5→0, requiring a messy correction loop that produces
    // wrong values (38/28/18/8/8). Snapping only applies when the user drags.
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

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);

    onChange({
      weights,
      aiSuggested: true,
      totalWeight,
    });
  };

  // Re-snap all weights when stepSize changes
  const reSnapWeights = (newStep: StepSizeOption) => {
    if (data.weights.length === 0) return;

    const snapped = data.weights.map((w) => ({
      ...w,
      weight: snapToStep(w.weight, newStep),
    }));

    // Fix total to 100%
    let totalWeight = snapped.reduce((sum, w) => sum + w.weight, 0);
    if (totalWeight !== 100) {
      const diff = 100 - totalWeight;
      const sorted = [...snapped]
        .filter((w) => !lockedParams.has(w.parameterId))
        .sort((a, b) => b.weight - a.weight);
      // Fall back to all params if all are locked
      const targets = sorted.length > 0 ? sorted : [...snapped].sort((a, b) => b.weight - a.weight);
      let remaining = diff;
      let idx = 0;
      while (remaining !== 0 && targets.length > 0) {
        const increment = remaining > 0 ? 1 : -1;
        const targetId = targets[idx % targets.length].parameterId;
        const w = snapped.find((w) => w.parameterId === targetId)!;
        w.weight = Math.max(0, w.weight + increment);
        remaining -= increment;
        idx++;
        if (idx > 200) break;
      }
      totalWeight = snapped.reduce((sum, w) => sum + w.weight, 0);
    }

    onChange({
      ...data,
      weights: snapped,
      aiSuggested: false,
      totalWeight,
    });
  };

  /**
   * Toggle lock state for a parameter
   */
  const toggleLock = (parameterId: string) => {
    setLockedParams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(parameterId)) {
        newSet.delete(parameterId);
      } else {
        newSet.add(parameterId);
      }
      return newSet;
    });
  };

  /**
   * Auto-adjust weights to maintain 100% total
   * - Only adjusts UNLOCKED parameters (locked ones stay fixed)
   * - The parameter being adjusted is automatically locked
   * - Equal adjustment among unlocked non-zero parameters
   * - Real-time: Adjust immediately on slider change
   */
  const handleWeightChange = (parameterId: string, newWeight: number) => {
    // Snap newWeight to step size
    newWeight = snapToStep(newWeight, stepSize);

    // Find the current weight of the parameter being changed
    const currentParam = data.weights.find((w) => w.parameterId === parameterId);
    if (!currentParam) return;

    const oldWeight = currentParam.weight;
    const weightDifference = newWeight - oldWeight;

    // If no change, do nothing
    if (weightDifference === 0) return;

    // Auto-lock the parameter being adjusted
    setLockedParams((prev) => {
      const newSet = new Set(prev);
      newSet.add(parameterId);
      return newSet;
    });

    // Get all other parameters that can be adjusted:
    // - Not the current parameter
    // - Not locked
    // - Has non-zero weight (or we're trying to increase total)
    const adjustableParams = data.weights.filter(
      (w) =>
        w.parameterId !== parameterId &&
        !lockedParams.has(w.parameterId) &&
        w.weight > 0
    );

    // If there are no adjustable parameters, just update the current one
    // (total won't be 100, but user needs to unlock something)
    if (adjustableParams.length === 0) {
      const updatedWeights = data.weights.map((w) =>
        w.parameterId === parameterId ? { ...w, weight: newWeight } : w
      );
      const totalWeight = updatedWeights.reduce((sum, w) => sum + w.weight, 0);
      onChange({
        ...data,
        weights: updatedWeights,
        aiSuggested: false,
        totalWeight,
      });
      return;
    }

    // Calculate total weight of adjustable parameters
    const totalAdjustableWeight = adjustableParams.reduce((sum, w) => sum + w.weight, 0);

    // Apply proportional adjustments to unlocked parameters
    let updatedWeights = data.weights.map((w) => {
      if (w.parameterId === parameterId) {
        return { ...w, weight: newWeight };
      }
      // Skip locked parameters
      if (lockedParams.has(w.parameterId)) {
        return w;
      }
      if (w.weight === 0) {
        // Skip zero-weight parameters
        return w;
      }
      // Proportionally adjust based on current weight
      const proportion = w.weight / totalAdjustableWeight;
      const adjustment = weightDifference * proportion;
      const adjustedWeight = Math.max(0, w.weight - adjustment);
      return { ...w, weight: adjustedWeight };
    });

    // Snap all unlocked weights to step size
    updatedWeights = updatedWeights.map((w) => {
      if (w.parameterId === parameterId || lockedParams.has(w.parameterId)) {
        return w;
      }
      return { ...w, weight: snapToStep(w.weight, stepSize) };
    });

    // Calculate the new total (may not be exactly 100 due to snapping)
    let totalWeight = updatedWeights.reduce((sum, w) => sum + w.weight, 0);

    // Fix any remainder by distributing across unlocked adjustable parameters
    if (totalWeight !== 100) {
      const diff = 100 - totalWeight;
      const sortedAdjustable = updatedWeights
        .filter(
          (w) =>
            w.parameterId !== parameterId &&
            !lockedParams.has(w.parameterId) &&
            w.weight > 0
        )
        .sort((a, b) => b.weight - a.weight);

      if (sortedAdjustable.length > 0) {
        // Distribute remainder 1% at a time across unlocked params
        let remaining = diff;
        let idx = 0;
        while (remaining !== 0 && sortedAdjustable.length > 0) {
          const increment = remaining > 0 ? 1 : -1;
          const targetId = sortedAdjustable[idx % sortedAdjustable.length].parameterId;
          updatedWeights = updatedWeights.map((w) =>
            w.parameterId === targetId
              ? { ...w, weight: Math.max(0, w.weight + increment) }
              : w
          );
          remaining -= increment;
          idx++;
          // Safety: prevent infinite loop
          if (idx > 200) break;
        }
        totalWeight = updatedWeights.reduce((sum, w) => sum + w.weight, 0);
      }
    }

    onChange({
      ...data,
      weights: updatedWeights,
      aiSuggested: false,
      totalWeight,
    });
  };

  const handleResetToDefaults = () => {
    // Clear all locks and reset step size when resetting
    setLockedParams(new Set());
    setStepSize(10);
    initializeWeights(10);
  };

  // Handle step size change: re-snap all weights
  const handleStepSizeChange = (newStep: StepSizeOption) => {
    setStepSize(newStep);
    reSnapWeights(newStep);
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

      {/* Step Size Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Step Size:</span>
        <div className="flex gap-2">
          {STEP_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleStepSizeChange(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                stepSize === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-700 dark:text-dark-text-secondary hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Sliders aligned with Donut Chart Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Sliders Column - centered vertically within card-like container */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 flex flex-col justify-center">
          <div className="space-y-3">
            {filteredWeights.map((weight) => (
              <WeightSlider
                key={weight.parameterId}
                parameterId={weight.parameterId}
                parameterName={weight.parameterName}
                weight={weight.weight}
                color={weight.color || CHART_COLORS[0]}
                isLocked={lockedParams.has(weight.parameterId)}
                stepSize={stepSize}
                onChange={(newWeight) => handleWeightChange(weight.parameterId, newWeight)}
                onToggleLock={() => toggleLock(weight.parameterId)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Donut Chart + Summary */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 flex flex-col items-center justify-center">
          <DonutChart
            weights={filteredWeights}
            totalWeight={filteredWeights.reduce((sum, w) => sum + w.weight, 0)}
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
      </div>

      {/* Info Card - Full width below both columns */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              How Weights Work
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              Higher weights indicate more important parameters. The AI uses these weights
              to calculate utility scores and make negotiation decisions. Parameters with
              0% weight are ignored during negotiation.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Lock Feature
            </h4>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              When you adjust a slider, it automatically locks (shown with a lock icon).
              Locked parameters won't change when you adjust other sliders. Click the
              lock icon to unlock a parameter and allow it to be auto-adjusted again.
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
