import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { VerticalStepProgress, Step } from '../shared';
import BasicAndCompanyInfo from './BasicAndCompanyInfo';
import LocationDetails from './LocationDetails';
import FinancialAndBanking from './FinancialAndBanking';
import ContactAndDocuments from './ContactAndDocuments';
import VendorReview from './VendorReview';
import { ArrowLeft, Save } from 'lucide-react';
import { useAutoSave } from '../../hooks/useAutoSave';
import toast from 'react-hot-toast';
import { authApi } from '../../api';

/**
 * Address data structure for vendor company
 */
export interface AddressData {
  label: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

/**
 * Complete vendor form data
 * This is used for both progressive save and form state
 */
export interface VendorFormData {
  // Step 1: Basic Information (Vendor user)
  name?: string;
  phone?: string;
  email?: string;

  // Step 1: Company Information
  companyName?: string;
  establishmentDate?: string;
  nature?: string;
  type?: string;
  numberOfEmployees?: string;
  annualTurnover?: string;
  industryType?: string;
  companyLogo?: File | string | null;

  // Step 2: Location Details
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // Step 2: Addresses array (for legacy support)
  addresses?: AddressData[];

  // Step 3: Financial & Banking
  typeOfCurrency?: string;
  bankName?: string;
  beneficiaryName?: string;
  accountNumber?: string;
  iBanNumber?: string;
  swiftCode?: string;
  bankAccountType?: string;
  ifscCode?: string;
  fullAddress?: string;

  // Step 3: Compliance Documents
  gstNumber?: string;
  panNumber?: string;
  msmeNumber?: string;
  ciNumber?: string;

  // Step 4: Point of Contact
  pocName?: string;
  pocDesignation?: string;
  pocEmail?: string;
  pocPhone?: string;
  pocWebsite?: string;

  // Step 4: Escalation Contact
  escalationName?: string;
  escalationDesignation?: string;
  escalationEmail?: string;
  escalationPhone?: string;

  // Legacy fields
  description?: string;
  website?: string;
  currency?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  routingNumber?: string;
  documents?: File[] | null;
}

interface VendorFormContainerProps {
  companyId?: string;
  projectId?: any;
  company?: any;
}

const VendorFormContainer: React.FC<VendorFormContainerProps> = ({
  companyId: propCompanyId,
  projectId = null,
  company: propCompany = null,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [company, setCompany] = useState<any>(propCompany);

  // Get companyId from URL params or props
  const companyId = id || propCompanyId || '';

  // Determine if we're in create mode based on the URL path
  // Edit mode: /vendor-management/edit-vendor/:id
  // Create mode: /vendor-management/add-vendor/:id or /vendor-management/create-vendor/
  const isEditMode = location.pathname.includes('/edit-vendor/');
  const isCreateMode = !isEditMode;

  // Get initial step from URL or default to 1
  const urlStep = searchParams.get('step');
  const initialStep = urlStep ? parseInt(urlStep, 10) : 1;

  const [currentStep, setCurrentStep] = useState<number>(
    initialStep >= 1 && initialStep <= 5 ? initialStep : 1
  );
  const [formData, setFormData] = useState<VendorFormData>({});
  const [_errors, _setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [isLoadingCompany, setIsLoadingCompany] = useState(isEditMode && !!companyId);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [pendingDraftData, setPendingDraftData] = useState<{ currentStep: number; formData: VendorFormData } | null>(null);

  // Auto-save hook - save form data every 30 seconds
  const autoSaveKey = `vendor-form-draft-${companyId || 'new'}`;
  const { lastSaved, isSaving, clearSaved, loadSaved } = useAutoSave({
    key: autoSaveKey,
    data: { currentStep, formData },
    interval: 30000, // 30 seconds
    enabled: currentStep < 5, // Don't auto-save on review step
  });

  // Fetch company data if editing existing vendor (when we have companyId)
  useEffect(() => {
    const fetchCompanyData = async () => {
      // Only fetch in edit mode or when we have a companyId from progressive save
      if (companyId && !propCompany) {
        // In edit mode, show loading state while fetching
        if (isEditMode) {
          setIsLoadingCompany(true);
        }
        try {
          const response = await authApi.get(`/company/get/${companyId}`);
          setCompany(response.data.data);
        } catch (error) {
          console.error('Error fetching company data:', error);
          toast.error('Failed to load vendor data');
        } finally {
          setIsLoadingCompany(false);
        }
      }
    };
    fetchCompanyData();
  }, [companyId, propCompany, isEditMode]);

  // Define steps for VerticalStepProgress
  const steps: Step[] = [
    { id: 1, title: 'Basic & Company Info', description: 'Contact and company details' },
    { id: 2, title: 'Location Details', description: 'Address and location' },
    { id: 3, title: 'Financial & Banking', description: 'Currency and banking info' },
    { id: 4, title: 'Contact & Documents', description: 'Point of contact and files' },
    { id: 5, title: 'Review & Submit', description: 'Review and confirm' },
  ];

  // Load draft on mount (only in create mode, not edit mode)
  useEffect(() => {
    // Skip draft loading in edit mode - we load from server instead
    if (isEditMode) {
      setDraftLoaded(true);
      return;
    }

    if (!draftLoaded && !company) {
      const saved = loadSaved();
      if (saved && saved.currentStep && saved.formData) {
        const savedTimestamp = localStorage.getItem(`${autoSaveKey}_timestamp`);
        const isRecent = !savedTimestamp || (new Date().getTime() - new Date(savedTimestamp).getTime() < 7 * 24 * 60 * 60 * 1000); // 7 days
        if (isRecent) {
          const hasMeaningfulData =
            saved.currentStep > 1 ||
            Object.values(saved.formData).some(v => {
              if (v == null || v === false) return false;
              if (typeof v === 'string') return v.trim() !== '';
              if (Array.isArray(v)) return v.length > 0;
              if (typeof v === 'number') return true;
              return true;
            });
          if (hasMeaningfulData) {
            setPendingDraftData({ currentStep: saved.currentStep, formData: saved.formData });
            setShowDraftDialog(true);
            setDraftLoaded(true);
            return;
          }
        }
      }
      // No meaningful draft — clear the stale empty draft and proceed
      clearSaved();
      setDraftLoaded(true);
    }
  }, [draftLoaded, company, loadSaved, isEditMode]);

  // Sync currentStep with URL when URL step parameter changes (e.g., after navigation)
  useEffect(() => {
    const urlStep = searchParams.get('step');
    const stepFromUrl = urlStep ? parseInt(urlStep, 10) : 1;
    if (stepFromUrl !== currentStep && stepFromUrl >= 1 && stepFromUrl <= 5) {
      setCurrentStep(stepFromUrl);
    }
  }, [searchParams]); // Only depend on searchParams, not currentStep to avoid loop

  // Update URL when step changes internally (via nextStep/prevStep)
  useEffect(() => {
    const urlStep = searchParams.get('step');
    const stepFromUrl = urlStep ? parseInt(urlStep, 10) : 1;
    // Only update URL if it doesn't match current step (avoid infinite loop)
    if (stepFromUrl !== currentStep) {
      setSearchParams({ step: currentStep.toString() });
    }
  }, [currentStep, setSearchParams]);

  // Callback for step components to update accumulated form data
  const updateFormData = useCallback((stepData: Partial<VendorFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  }, []);

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Allow navigation to any step up to current step (or any completed step)
    if (stepId <= currentStep || (companyId && stepId <= 5)) {
      setCurrentStep(stepId);
    }
  };

  /**
   * Handle Step 1 submission - Create vendor + company
   * POST /vendor-management/create-vendor?step=1
   */
  const handleStep1Submit = async (data: VendorFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Note: companyLogo is excluded from JSON payload - it would need multipart/form-data
      // For now, we skip file upload in step 1 and can handle it separately
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        establishmentDate: data.establishmentDate,
        nature: data.nature,
        type: data.type,
        numberOfEmployees: data.numberOfEmployees,
        annualTurnover: data.annualTurnover,
        industryType: data.industryType,
        // companyLogo excluded - File objects can't be sent as JSON
      };

      const response = await authApi.post('/vendor-management/create-vendor?step=1', payload);
      const { company: newCompany } = response.data.data;

      // Update form data
      updateFormData(data);

      // Navigate to the next step with companyId in URL
      toast.success('Vendor and company created (Step 1)');
      navigate(`/vendor-management/add-vendor/${newCompany.id}?step=2`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create vendor';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Step 2 submission - Update address
   * PUT /vendor-management/create-vendor/:companyId?step=2
   */
  const handleStep2Submit = async (data: VendorFormData): Promise<void> => {
    if (!companyId) {
      toast.error('Company ID not found. Please complete Step 1 first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
      };

      await authApi.put(`/vendor-management/create-vendor/${companyId}?step=2`, payload);

      // Update form data
      updateFormData(data);

      toast.success('Location details saved (Step 2)');
      nextStep();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save location';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Step 3 submission - Update financial/banking info
   * PUT /vendor-management/create-vendor/:companyId?step=3
   */
  const handleStep3Submit = async (data: VendorFormData): Promise<void> => {
    if (!companyId) {
      toast.error('Company ID not found. Please complete Step 1 first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        typeOfCurrency: data.typeOfCurrency,
        bankName: data.bankName,
        beneficiaryName: data.beneficiaryName,
        accountNumber: data.accountNumber,
        iBanNumber: data.iBanNumber,
        swiftCode: data.swiftCode,
        bankAccountType: data.bankAccountType,
        ifscCode: data.ifscCode,
        fullAddress: data.fullAddress,
        gstNumber: data.gstNumber,
        panNumber: data.panNumber,
        msmeNumber: data.msmeNumber,
        ciNumber: data.ciNumber,
      };

      await authApi.put(`/vendor-management/create-vendor/${companyId}?step=3`, payload);

      // Update form data
      updateFormData(data);

      toast.success('Financial info saved (Step 3)');
      nextStep();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save financial info';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Step 4 submission - Update contact info
   * PUT /vendor-management/create-vendor/:companyId?step=4
   */
  const handleStep4Submit = async (data: VendorFormData): Promise<void> => {
    if (!companyId) {
      toast.error('Company ID not found. Please complete Step 1 first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        pocName: data.pocName,
        pocDesignation: data.pocDesignation,
        pocEmail: data.pocEmail,
        pocPhone: data.pocPhone,
        pocWebsite: data.pocWebsite,
        escalationName: data.escalationName,
        escalationDesignation: data.escalationDesignation,
        escalationEmail: data.escalationEmail,
        escalationPhone: data.escalationPhone,
      };

      await authApi.put(`/vendor-management/create-vendor/${companyId}?step=4`, payload);

      // Update form data
      updateFormData(data);

      toast.success('Contact info saved (Step 4)');
      nextStep();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save contact info';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const restoreDraft = () => {
    if (pendingDraftData) {
      setCurrentStep(pendingDraftData.currentStep);
      setFormData(pendingDraftData.formData);
      toast.success('Draft restored');
    }
    setShowDraftDialog(false);
    setPendingDraftData(null);
  };

  const discardDraft = () => {
    clearSaved();
    setShowDraftDialog(false);
    setPendingDraftData(null);
  };

  /**
   * Handle final submission (Step 5 review complete)
   */
  const handleFinalSubmit = async () => {
    clearSaved();
    toast.success('Vendor created successfully!');
    navigate('/vendor-management');
  };

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

  // Render current step component
  const renderStep = () => {
    const commonProps = {
      currentStep,
      nextStep,
      prevStep,
      projectId,
      companyId,
      company,
      isCreateMode,
      formData,
      updateFormData,
    };

    // In edit mode, don't pass onStepSubmit - let components use their own edit mode API calls
    // In create mode, use the progressive save handlers
    switch (currentStep) {
      case 1:
        return (
          <BasicAndCompanyInfo
            {...commonProps}
            onStepSubmit={isCreateMode ? handleStep1Submit : undefined}
            isSubmitting={isSubmitting}
          />
        );
      case 2:
        return (
          <LocationDetails
            {...commonProps}
            onStepSubmit={isCreateMode ? handleStep2Submit : undefined}
            isSubmitting={isSubmitting}
          />
        );
      case 3:
        return (
          <FinancialAndBanking
            {...commonProps}
            onStepSubmit={isCreateMode ? handleStep3Submit : undefined}
            isSubmitting={isSubmitting}
          />
        );
      case 4:
        return (
          <ContactAndDocuments
            {...commonProps}
            onStepSubmit={isCreateMode ? handleStep4Submit : undefined}
            isSubmitting={isSubmitting}
          />
        );
      case 5:
        return (
          <VendorReview
            {...commonProps}
            onSubmit={isCreateMode ? handleFinalSubmit : undefined}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return (
          <BasicAndCompanyInfo
            {...commonProps}
            onStepSubmit={isCreateMode ? handleStep1Submit : undefined}
            isSubmitting={isSubmitting}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {showDraftDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Restore Draft?</h3>
            <p className="text-gray-600 mb-4">
              You have an unsaved vendor draft from a previous session. Would you like to restore it?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-all"
                onClick={discardDraft}
              >
                Start Fresh
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all"
                onClick={restoreDraft}
              >
                Restore Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { clearSaved(); navigate('/vendor-management'); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to vendor management"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isCreateMode ? 'Add New Vendor' : 'Edit Vendor'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isCreateMode
                  ? 'Create vendor and company profile - data is saved at each step'
                  : 'Edit vendor and company details'
                }
              </p>
            </div>
          </div>
          {/* Auto-save indicator */}
          <div className="flex items-center gap-3">
            {currentStep < 5 && (
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
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Step Component */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {isLoadingCompany ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading vendor details...</span>
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

export default VendorFormContainer;
