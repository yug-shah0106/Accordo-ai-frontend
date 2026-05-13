import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Save } from "lucide-react";
import { authApi } from "../../api";
import { VerticalStepProgress, Step } from "../../components/shared";
import OnboardingProfile from "./OnboardingProfile";
import OnboardingCompany from "./OnboardingCompany";
import { useAutoSave } from "../../hooks/useAutoSave";
import toast from "react-hot-toast";

// Form data interface for auto-save
interface OnboardingFormData {
  profileData?: {
    name?: string;
    phone?: string;
    email?: string;
    profilePic?: string | null;
  };
  companyData?: {
    companyName?: string;
    establishmentDate?: string;
    nature?: string;
    type?: string;
    numberOfEmployees?: string;
    annualTurnover?: string;
    industryType?: string;
    customIndustryType?: string;
    typeOfCurrency?: string;
  };
}

interface OnboardingState {
  name?: string;
  email?: string;
}

const OnboardingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const onboardingState = location.state as OnboardingState | null;

  const [userId, setUserId] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<OnboardingFormData>({});
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [stepKey, setStepKey] = useState(0);

  // Pre-filled data from registration
  const prefilledName = onboardingState?.name || "";
  const prefilledEmail = onboardingState?.email || "";

  // Auto-save hook
  const autoSaveKey = `onboarding-form-draft-${userId || "new"}`;
  const { lastSaved, isSaving, clearSaved, loadSaved } = useAutoSave({
    key: autoSaveKey,
    data: { currentStep, formData, timestamp: new Date().toISOString() },
    interval: 30000, // 30 seconds
    enabled: !!userId,
  });

  // Callback to update form data from child components
  const updateFormData = useCallback((stepData: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  }, []);

  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return "";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return "Saved just now";
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `Saved ${Math.floor(diff / 3600)} hr ago`;
    return `Saved ${lastSaved.toLocaleDateString()}`;
  };

  // Define steps
  const steps: Step[] = [
    { id: 1, title: "Your Profile", description: "Personal information" },
    { id: 2, title: "Company Details", description: "Business information" },
  ];

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authApi.get("/user/profile");
        const userData = response.data.data;
        setUserId(userData.id);
        setCompanyId(userData.companyId?.toString() || localStorage.getItem("%companyId%"));
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        // If not authenticated, redirect to auth page
        if (error.response?.status === 401) {
          navigate("/auth");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Load draft on mount
  useEffect(() => {
    if (!draftLoaded && userId) {
      const saved = loadSaved();
      if (saved && saved.currentStep && saved.formData) {
        const isRecent =
          new Date().getTime() - new Date(saved.timestamp).getTime() <
          7 * 24 * 60 * 60 * 1000; // 7 days
        if (isRecent && Object.keys(saved.formData).length > 0) {
          toast.success("Draft loaded from previous session", {
            duration: 3000,
            icon: "📄",
          });
          setCurrentStep(saved.currentStep);
          setFormData(saved.formData);
        }
      }
      setDraftLoaded(true);
    }
  }, [draftLoaded, userId, loadSaved]);

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
      setStepKey((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setStepKey((prev) => prev + 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId !== currentStep) {
      setCurrentStep(stepId);
      setStepKey((prev) => prev + 1);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem("onboardingComplete", "true");
    clearSaved();
    toast.success("Welcome to Accordo! Your profile is set up.");
    navigate("/dashboard");
  };

  const handleSkip = () => {
    // Mark onboarding as skipped (not complete)
    localStorage.setItem("onboardingSkipped", "true");
    toast("You can complete your profile later in Settings", {
      icon: "ℹ️",
      duration: 4000,
    });
    navigate("/dashboard");
  };

  // Render current step component
  const renderStep = () => {
    const commonProps = {
      currentStep,
      nextStep,
      prevStep,
      companyId,
      userId,
      formData,
      updateFormData,
      clearSaved,
      onComplete: handleComplete,
      onSkip: handleSkip,
      prefilledName,
      prefilledEmail,
    };

    switch (currentStep) {
      case 1:
        return <OnboardingProfile key={`step-1-${stepKey}`} {...commonProps} />;
      case 2:
        return <OnboardingCompany key={`step-2-${stepKey}`} {...commonProps} />;
      default:
        return <OnboardingProfile key={`step-default-${stepKey}`} {...commonProps} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Complete Your Profile
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Help us set up your account for the best experience
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Auto-save indicator */}
            <div className="flex items-center gap-2">
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-blue-600 font-medium">
                    Saving...
                  </span>
                </>
              ) : lastSaved ? (
                <>
                  <Save className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    {getLastSavedText()}
                  </span>
                </>
              ) : null}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Step {currentStep} of {steps.length}
            </div>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Complete Later
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with Step Progress */}
        <div className="w-72 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto p-6">
          <VerticalStepProgress
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />

          {/* Skip button in sidebar */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSkip}
              className="w-full py-2 px-4 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              I'll do this later
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="bg-white rounded-lg shadow-sm">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading...</span>
                </div>
              ) : (
                renderStep()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
