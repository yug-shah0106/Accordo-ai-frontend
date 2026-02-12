import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, User } from "lucide-react";

interface OnboardingReminderProps {
  className?: string;
}

const OnboardingReminder = ({ className = "" }: OnboardingReminderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if onboarding was skipped but not completed
    const onboardingComplete = localStorage.getItem("onboardingComplete");
    const onboardingSkipped = localStorage.getItem("onboardingSkipped");
    const reminderDismissed = sessionStorage.getItem("onboardingReminderDismissed");

    if (onboardingSkipped && !onboardingComplete && !reminderDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    // Only dismiss for this session
    sessionStorage.setItem("onboardingReminderDismissed", "true");
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div
      className={`bg-blue-50 border-b border-blue-200 px-4 py-3 ${className}`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-blue-800">
            <span className="font-medium">Complete your profile</span> to unlock
            all features.{" "}
            <Link
              to="/onboarding"
              className="font-semibold underline hover:text-blue-900"
            >
              Continue setup
            </Link>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingReminder;

// Hook to check if onboarding reminder should show badge
export const useOnboardingStatus = () => {
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    const onboardingComplete = localStorage.getItem("onboardingComplete");
    const onboardingSkipped = localStorage.getItem("onboardingSkipped");

    if (onboardingSkipped && !onboardingComplete) {
      setShowBadge(true);
    }
  }, []);

  return { showBadge };
};
