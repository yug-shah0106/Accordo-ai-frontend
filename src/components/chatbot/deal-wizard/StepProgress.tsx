import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  allowNavigation?: boolean;
}

/**
 * StepProgress - Visual progress indicator for multi-step wizard
 * Shows step circles with connecting lines, completed states, and labels
 */
const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = true,
}) => {
  const handleStepClick = (stepId: number) => {
    if (allowNavigation && onStepClick && stepId < currentStep) {
      onStepClick(stepId);
    }
  };

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = allowNavigation && step.id < currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full
                    transition-all duration-200 font-medium text-sm
                    ${isCompleted
                      ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700'
                      : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                    }
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </button>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p className={`
                    text-sm font-medium
                    ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                  `}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-400 mt-0.5 max-w-[100px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 mt-[-24px]">
                  <div className={`
                    h-1 rounded-full transition-all duration-300
                    ${step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
