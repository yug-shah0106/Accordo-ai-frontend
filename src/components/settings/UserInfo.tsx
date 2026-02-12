import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { authApi } from "../../api";
import { VerticalStepProgress, Step } from "../shared";
import UpdateProfile from "../settingForm/UpdateProfile";
import CompanyProfile from "../settingForm/CompanyProfile";
import ChangePassword from "../settingForm/ChangePassword";
import { useAutoSave } from "../../hooks/useAutoSave";
import toast from "react-hot-toast";

// Form data interface for auto-save
interface SettingsFormData {
  // Profile data
  profileData?: {
    name?: string;
    phone?: string;
    email?: string;
    profilePic?: string | null;
  };
  // Company data (subset that we track)
  companyData?: {
    companyName?: string;
    establishmentDate?: string;
    nature?: string;
    type?: string;
    numberOfEmployees?: string;
    annualTurnover?: string;
    industryType?: string;
  };
}

const UserInfo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const [company, setCompany] = useState<any>(null);
  const [userId, setUserId] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<SettingsFormData>({});
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [stepKey, setStepKey] = useState(0); // Used to force remount of step components

  const companyId = localStorage.getItem("%companyId%");

  // Auto-save hook - save form data every 30 seconds
  const autoSaveKey = `settings-form-draft-${userId || 'new'}`;
  const { lastSaved, isSaving, clearSaved, loadSaved } = useAutoSave({
    key: autoSaveKey,
    data: { currentStep, formData, timestamp: new Date().toISOString() },
    interval: 30000, // 30 seconds
    enabled: currentStep < 3 && !!userId, // Don't auto-save on change password step
  });

  // Callback to update form data from child components
  const updateFormData = useCallback((stepData: Partial<SettingsFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  }, []);

  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000); // seconds

    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `Saved ${Math.floor(diff / 3600)} hr ago`;
    return `Saved ${lastSaved.toLocaleDateString()}`;
  };

  // Define steps for VerticalStepProgress
  const steps: Step[] = [
    { id: 1, title: "Update Profile", description: "Personal information and photo" },
    { id: 2, title: "Update Entity", description: "Company and business details" },
    { id: 3, title: "Change Password", description: "Security and authentication" },
  ];

  useEffect(() => {
    setCurrentStep(state?.currentStep || 1);
  }, [state]);

  // Load draft on mount (only if user data is loaded)
  useEffect(() => {
    if (!draftLoaded && userId) {
      const saved = loadSaved();
      if (saved && saved.currentStep && saved.formData) {
        const isRecent = new Date().getTime() - new Date(saved.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
        if (isRecent && Object.keys(saved.formData).length > 0) {
          toast.success('Draft loaded from previous session', {
            duration: 3000,
            icon: '📄',
          });
          setCurrentStep(saved.currentStep);
          setFormData(saved.formData);
        }
      }
      setDraftLoaded(true);
    }
  }, [draftLoaded, userId, loadSaved]);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setStepKey(prev => prev + 1); // Force remount to fetch fresh data
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setStepKey(prev => prev + 1); // Force remount to fetch fresh data
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId !== currentStep) {
      setCurrentStep(stepId);
      setStepKey(prev => prev + 1); // Force remount to fetch fresh data
    }
  };

  const fetchCompanyData = async (companyId: string) => {
    try {
      const {
        data: { data },
      } = await authApi.get(`/company/get/${companyId}`);
      setCompany(data);
    } catch (error: any) {
      console.error(error.message || "Something went wrong");
    }
  };

  const fetchUserData = async () => {
    try {
      const {
        data: { data },
      } = await authApi.get(`/user/profile`);
      setUserId(data.id);
    } catch (error: any) {
      console.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchUserData();
      if (id) {
        await fetchCompanyData(id);
      }
    };
    loadData();
  }, [id]);

  // Render current step component
  const renderStep = () => {
    const commonProps = {
      currentStep,
      nextStep,
      prevStep,
      companyId,
      company,
      userId,
      formData,
      updateFormData,
      clearSaved,
    };

    switch (currentStep) {
      case 1:
        return <UpdateProfile key={`step-1-${stepKey}`} {...commonProps} />;
      case 2:
        return <CompanyProfile key={`step-2-${stepKey}`} {...commonProps} />;
      case 3:
        return <ChangePassword key={`step-3-${stepKey}`} {...commonProps} onSuccess={clearSaved} />;
      default:
        return <UpdateProfile key={`step-default-${stepKey}`} {...commonProps} />;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your profile, company details, and security settings
              </p>
            </div>
          </div>
          {/* Auto-save indicator */}
          <div className="flex items-center gap-3">
            {currentStep < 3 && (
              <div className="flex items-center gap-2">
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-blue-600 font-medium">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Save className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">{getLastSavedText()}</span>
                  </>
                ) : null}
              </div>
            )}
            <div className="text-xs text-gray-500 font-medium">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with Step Progress */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto p-6">
          <VerticalStepProgress
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Step Component */}
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

export default UserInfo;
