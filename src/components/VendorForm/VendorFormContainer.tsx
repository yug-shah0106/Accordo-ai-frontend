import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { VerticalStepProgress, Step } from '../shared';
import VendorBasicInformation from './VendorBasicInformation';
import VendorGeneralInformation from './VendorGeneralInformation';
import VendorCurrencyDetails from './VendorCurrencyDetails';
import VendorContactDetails from './VendorContactDetails';
import VendorBankDetails from './VendorBankDetails';
import VendorDocumentUpload from './VendorDocumentUpload';
import VendorReview from './VendorReview';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export interface VendorFormData {
  // Basic Information
  name?: string;
  phone?: string;
  email?: string;

  // General Information
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;

  // Currency Details
  currency?: string;

  // Contact Details
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;

  // Bank Details
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;

  // Documents
  documents?: File[] | null;
}

interface VendorFormContainerProps {
  companyId?: string;
  projectId?: any;
  company?: any;
}

const VendorFormContainer: React.FC<VendorFormContainerProps> = ({
  companyId = '',
  projectId = null,
  company = null,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial step from URL or default to 1
  const urlStep = searchParams.get('step');
  const initialStep = urlStep ? parseInt(urlStep, 10) : 1;

  const [currentStep, setCurrentStep] = useState<number>(
    initialStep >= 1 && initialStep <= 7 ? initialStep : 1
  );
  const [formData, setFormData] = useState<VendorFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define steps for VerticalStepProgress
  const steps: Step[] = [
    { id: 1, title: 'Basic Information', description: 'Name, email, phone' },
    { id: 2, title: 'General Information', description: 'Address and details' },
    { id: 3, title: 'Currency Details', description: 'Preferred currency' },
    { id: 4, title: 'Contact Details', description: 'Contact person info' },
    { id: 5, title: 'Bank Details', description: 'Banking information' },
    { id: 6, title: 'Document Upload', description: 'Upload documents' },
    { id: 7, title: 'Review', description: 'Review and submit' },
  ];

  // Update URL when step changes
  useEffect(() => {
    setSearchParams({ step: currentStep.toString() });
  }, [currentStep, setSearchParams]);

  // Update form data
  const updateForm = (data: Partial<VendorFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Allow navigation to any step up to current step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      // Final submission logic would go here
      // For now, just navigate to vendor management
      navigate('/vendor-management');
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit form' });
    } finally {
      setIsSubmitting(false);
    }
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
    };

    switch (currentStep) {
      case 1:
        return <VendorBasicInformation {...commonProps} />;
      case 2:
        return <VendorGeneralInformation {...commonProps} />;
      case 3:
        return <VendorCurrencyDetails {...commonProps} />;
      case 4:
        return <VendorContactDetails {...commonProps} />;
      case 5:
        return <VendorBankDetails {...commonProps} />;
      case 6:
        return <VendorDocumentUpload {...commonProps} />;
      case 7:
        return <VendorReview {...commonProps} />;
      default:
        return <VendorBasicInformation {...commonProps} />;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/vendor-management')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Back to vendor management"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Add New Vendor
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Step {currentStep} of {steps.length}
              </p>
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
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Step Component */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorFormContainer;
