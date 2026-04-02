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

/** Shape of data stored in localStorage for vendor draft */
interface VendorDraftData {
  currentStep: number;
  formData: VendorFormData;
  companyId?: string;
  vendorId?: string;
}

interface VendorFormContainerProps {
  companyId?: string;
  projectId?: any;
  company?: any;
}

const DRAFT_STORAGE_KEY = 'vendor-form-draft';

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

  // Determine if we're in edit mode based on the URL path
  const isEditMode = location.pathname.includes('/edit-vendor/');
  const isCreateMode = !isEditMode;

  // In create mode, companyId is managed via state (set after Step 1 API call)
  // In edit mode, companyId comes from URL params or props
  const [createdCompanyId, setCreatedCompanyId] = useState<string>('');
  const [createdVendorId, setCreatedVendorId] = useState<string>('');
  const companyId = isEditMode ? (id || propCompanyId || '') : createdCompanyId;

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
  const [isLoadingCompany, setIsLoadingCompany] = useState(isEditMode && !!(id || propCompanyId));
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [pendingDraftData, setPendingDraftData] = useState<VendorDraftData | null>(null);
  const [isDeletingDraft, setIsDeletingDraft] = useState(false);

  // Track whether auto-save should be active (only after draft decision is made)
  const autoSaveReady = draftLoaded && !showDraftDialog;

  // Auto-save hook — uses a single stable key; stores companyId inside the draft data
  const autoSaveKey = DRAFT_STORAGE_KEY;
  const { lastSaved, isSaving, clearSaved, loadSaved } = useAutoSave({
    key: autoSaveKey,
    data: { currentStep, formData, companyId: createdCompanyId, vendorId: createdVendorId } as VendorDraftData,
    interval: 30000,
    enabled: isCreateMode && currentStep < 5 && autoSaveReady,
  });

  // Fetch company data if editing existing vendor (when we have companyId)
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (companyId && !propCompany) {
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
    if (isEditMode) {
      setDraftLoaded(true);
      return;
    }

    if (!draftLoaded) {
      const saved = loadSaved() as VendorDraftData | null;
      if (saved && saved.companyId && saved.currentStep && saved.formData) {
        // Draft exists with a companyId — the user previously completed Step 1 and quit
        const savedTimestamp = localStorage.getItem(`${autoSaveKey}_timestamp`);
        const isRecent = !savedTimestamp || (new Date().getTime() - new Date(savedTimestamp).getTime() < 7 * 24 * 60 * 60 * 1000);
        if (isRecent) {
          setPendingDraftData(saved);
          setShowDraftDialog(true);
          setDraftLoaded(true);
          return;
        }
      }
      // No valid draft — clear any stale data and proceed fresh
      clearSaved();
      setDraftLoaded(true);
    }
  }, [draftLoaded, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL search params when step changes (silent, no navigation)
  useEffect(() => {
    const urlStep = searchParams.get('step');
    const stepFromUrl = urlStep ? parseInt(urlStep, 10) : 1;
    if (stepFromUrl !== currentStep) {
      setSearchParams({ step: currentStep.toString() }, { replace: true });
    }
  }, [currentStep, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (stepId <= currentStep || (companyId && stepId <= 5)) {
      setCurrentStep(stepId);
    }
  };

  /**
   * Handle Step 1 submission - Create vendor + company
   * POST /vendor-management/create-vendor?step=1
   * No navigation — stays on the same component, advances step via state
   */
  const handleStep1Submit = async (data: VendorFormData): Promise<void> => {
    setIsSubmitting(true);
    try {
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
      };

      const response = await authApi.post('/vendor-management/create-vendor?step=1', payload);
      const { company: newCompany, vendor: newVendor } = response.data.data;

      // Store the created IDs in state (no navigation)
      setCreatedCompanyId(newCompany.id.toString());
      if (newVendor?.id) {
        setCreatedVendorId(newVendor.id.toString());
      }

      // Update form data
      updateFormData(data);

      toast.success('Vendor and company created (Step 1)');
      nextStep();
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

  /**
   * Restore draft — reload the saved companyId, step, and form data,
   * then fetch the company from the backend to hydrate the form
   */
  const restoreDraft = async () => {
    if (pendingDraftData) {
      setCreatedCompanyId(pendingDraftData.companyId || '');
      setCreatedVendorId(pendingDraftData.vendorId || '');
      setCurrentStep(pendingDraftData.currentStep);
      setFormData(pendingDraftData.formData);

      // Fetch company data from backend so step components have full context
      if (pendingDraftData.companyId) {
        try {
          const response = await authApi.get(`/company/get/${pendingDraftData.companyId}`);
          setCompany(response.data.data);
        } catch {
          // Company may have been deleted — proceed with local data only
        }
      }

      toast.success('Draft restored');
    }
    setShowDraftDialog(false);
    setPendingDraftData(null);
  };

  /**
   * Discard draft — clear localStorage AND delete the incomplete vendor/company
   * from the backend so we don't leave orphaned records
   */
  const discardDraft = async () => {
    const draftCompanyId = pendingDraftData?.companyId;
    const draftVendorId = pendingDraftData?.vendorId;

    // Clear UI state immediately
    clearSaved();
    setShowDraftDialog(false);
    setPendingDraftData(null);

    // Delete the incomplete records from the backend (best-effort)
    if (draftCompanyId || draftVendorId) {
      setIsDeletingDraft(true);
      try {
        const deletePromises: Promise<any>[] = [];
        if (draftVendorId) {
          deletePromises.push(
            authApi.delete(`/vendor-management/delete/${draftVendorId}`).catch(() => {})
          );
        }
        if (draftCompanyId) {
          deletePromises.push(
            authApi.delete(`/company/delete/${draftCompanyId}`).catch(() => {})
          );
        }
        await Promise.all(deletePromises);
      } catch {
        // Silently ignore — orphaned records are not critical
      } finally {
        setIsDeletingDraft(false);
      }
    }
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
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

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
          <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">Restore Draft?</h3>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
              You have an unsaved vendor draft from a previous session. Would you like to restore it?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-all"
                onClick={discardDraft}
                disabled={isDeletingDraft}
              >
                {isDeletingDraft ? 'Cleaning up...' : 'Start Fresh'}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-all"
                onClick={restoreDraft}
                disabled={isDeletingDraft}
              >
                Restore Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { clearSaved(); navigate('/vendor-management'); }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Back to vendor management"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-dark-text-secondary" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
                {isCreateMode ? 'Add New Vendor' : 'Edit Vendor'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
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
            <div className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with Step Progress */}
        <div className="w-80 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex-shrink-0 overflow-y-auto p-6">
          <VerticalStepProgress
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-dark-bg">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Step Component */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6 mb-6">
              {isLoadingCompany ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600 dark:text-dark-text-secondary">Loading vendor details...</span>
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
