import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: number;
  title: string;
  description?: string;
}

export interface VerticalStepProgressProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  allowNavigation?: boolean;
}

const VerticalStepProgress: React.FC<VerticalStepProgressProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
}) => {
  const handleStepClick = (stepId: number) => {
    // Only allow clicking on completed steps or current step when navigation is allowed
    if (allowNavigation && stepId <= currentStep && onStepClick) {
      onStepClick(stepId);
    }
  };

  const getStepStatus = (stepId: number): 'completed' | 'current' | 'future' => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'future';
  };

  const getStepButtonClasses = (status: 'completed' | 'current' | 'future') => {
    const baseClasses = 'w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all duration-200';

    if (status === 'completed') {
      return `${baseClasses} bg-blue-600 text-white ${allowNavigation ? 'cursor-pointer hover:bg-blue-700' : ''}`;
    }
    if (status === 'current') {
      return `${baseClasses} bg-blue-600 text-white ring-4 ring-blue-100`;
    }
    // future
    return `${baseClasses} bg-gray-200 text-gray-500 cursor-not-allowed`;
  };

  const getTitleClasses = (status: 'completed' | 'current' | 'future') => {
    const baseClasses = 'text-sm font-medium';

    if (status === 'current') {
      return `${baseClasses} text-blue-600`;
    }
    if (status === 'completed') {
      return `${baseClasses} text-gray-700`;
    }
    return `${baseClasses} text-gray-400`;
  };

  const getDescriptionClasses = (status: 'completed' | 'current' | 'future') => {
    const baseClasses = 'text-xs mt-0.5';

    if (status === 'current') {
      return `${baseClasses} text-blue-500`;
    }
    if (status === 'completed') {
      return `${baseClasses} text-gray-600`;
    }
    return `${baseClasses} text-gray-400`;
  };

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const isCompleted = status === 'completed';
        const isFuture = status === 'future';
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex">
            {/* Step indicator column */}
            <div className="flex flex-col items-center">
              {/* Step circle */}
              <button
                type="button"
                onClick={() => handleStepClick(step.id)}
                disabled={isFuture}
                className={getStepButtonClasses(status)}
                aria-label={`Step ${step.id}: ${step.title}`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" data-lucide="check" />
                ) : (
                  <span>{step.id}</span>
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={`
                    w-0.5 h-12 my-1 transition-all duration-300
                    ${isCompleted || status === 'current' ? 'bg-blue-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>

            {/* Step content column */}
            <div className="ml-4 pb-8">
              <p className={getTitleClasses(status)}>{step.title}</p>
              {step.description && (
                <p className={getDescriptionClasses(status)}>{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VerticalStepProgress;
