import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import chatbotService from '../../services/chatbot.service';
import {
  StepProgress,
  StepOne,
  StepTwo,
  StepThree,
  StepFour,
  ReviewStep,
} from '../chatbot/deal-wizard';
import type {
  DealWizardFormData,
  DealWizardStepOne,
  DealWizardStepTwo,
  DealWizardStepThree,
  DealWizardStepFour,
  RequisitionSummary,
  VendorSummary,
  DeliveryAddress,
  QualityCertification,
  SmartDefaults,
} from '../../types';
import { DEFAULT_WIZARD_FORM_DATA } from '../../types';

interface Requisition {
  id: string;
  subject?: string;
  category?: string;
  deliveryDate?: string;
  maxDeliveryDate?: string;
  maximumDeliveryDate?: string;
  negotiationClosureDate?: string;
  typeOfCurrency?: string;
  rfqId?: string;
  projectId?: string;
  totalPrice?: string;
  paymentTerms?: string;
  netPaymentDay?: string;
  prePaymentPercentage?: string;
  postPaymentPercentage?: string;
  discountTerms?: string;
  productData?: any[];
  RequisitionProduct?: any[];
  RequisitionAttachment?: any[];
  Contract?: any[];
  status?: string;
}

interface DealWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: DealWizardFormData) => void;
  requisitionId: number;
  requisition: Requisition | null;
  selectedVendorIds: string[];
}

const WIZARD_STEPS = [
  { id: 1, title: 'Basic Info', description: 'RFQ & Vendor' },
  { id: 2, title: 'Commercial', description: 'Price & Terms' },
  { id: 3, title: 'Contract', description: 'SLA & Control' },
  { id: 4, title: 'Weights', description: 'Priorities' },
  { id: 5, title: 'Review', description: 'Confirm' },
];

const DealWizardModal: React.FC<DealWizardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  requisitionId,
  requisition,
  selectedVendorIds,
}) => {
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState<DealWizardFormData>(DEFAULT_WIZARD_FORM_DATA);

  // Data sources
  const [requisitions, setRequisitions] = useState<RequisitionSummary[]>([]);
  const [vendors, setVendors] = useState<VendorSummary[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [certifications, setCertifications] = useState<QualityCertification[]>([]);
  const [smartDefaults, setSmartDefaults] = useState<SmartDefaults | null>(null);
  const [selectedVendorNames, setSelectedVendorNames] = useState<string[]>([]);

  // Loading states
  const [loadingRequisitions, setLoadingRequisitions] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingCertifications, setLoadingCertifications] = useState(true);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Track whether the modal was already open on the previous render so we only
  // reset + reload data when the modal transitions from closed → open.
  // This prevents tab switches or parent re-renders from resetting the wizard mid-flow.
  const wasOpenRef = useRef(false);

  // Load data when modal opens, then pre-populate form
  useEffect(() => {
    // Only reset/load when modal transitions from closed → open
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) {
      // Modal was already open — a parent re-render or tab switch caused this effect
      // to fire again. Do NOT reset the wizard state.
      return;
    }
    wasOpenRef.current = true;

    // Reset state on open
    setWizardStep(1);
    setFormData(DEFAULT_WIZARD_FORM_DATA);
    setErrors({});
    setValidationErrors({});
    setLoadingRequisitions(true);
    setLoadingVendors(true);
    setLoadingAddresses(true);
    setLoadingCertifications(true);

    const loadData = async () => {
      // Load all data first, then set state together to avoid
      // intermediate renders where loading is false but formData isn't populated yet

      // Load requisitions
      let loadedRequisitions: RequisitionSummary[] = [];
      try {
        const rfqRes = await chatbotService.getRequisitionsForNegotiation();
        loadedRequisitions = rfqRes.data || [];
      } catch {
        // ignore
      }

      // Load vendors for this requisition
      let loadedVendors: VendorSummary[] = [];
      try {
        const vendorRes = await chatbotService.getRequisitionVendors(requisitionId);
        loadedVendors = vendorRes.data || [];
      } catch {
        // ignore
      }

      // Load addresses
      let loadedAddresses: DeliveryAddress[] = [];
      try {
        const addrRes = await chatbotService.getDeliveryAddresses();
        loadedAddresses = addrRes.data || [];
      } catch {
        // ignore
      }

      // Load certifications
      let loadedCertifications: QualityCertification[] = [];
      try {
        const certRes = await chatbotService.getQualityCertifications();
        loadedCertifications = certRes.data || [];
      } catch {
        // ignore
      }

      // Resolve all selected vendors from the loaded vendors
      // selectedVendorIds may contain numbers at runtime despite string[] type,
      // so coerce both sides to string for safe comparison
      const resolvedNames: string[] = [];
      let firstMatchedVendorId: number | null = null;

      if (loadedVendors.length > 0 && selectedVendorIds.length > 0) {
        for (const selectedId of selectedVendorIds) {
          const sid = String(selectedId);
          const matched = loadedVendors.find(
            v => String(v.id) === sid || String(v.vendorId) === sid
          );
          if (matched) {
            resolvedNames.push(
              matched.companyName
                ? `${matched.name} (${matched.companyName})`
                : matched.name
            );
            if (firstMatchedVendorId === null) {
              firstMatchedVendorId = matched.id;
            }
          }
        }
      }

      // Set all data + formData + clear loading flags together
      setRequisitions(loadedRequisitions);
      setVendors(loadedVendors);
      setAddresses(loadedAddresses);
      setCertifications(loadedCertifications);
      setSelectedVendorNames(resolvedNames);

      setFormData(prev => ({
        ...prev,
        stepOne: {
          ...prev.stepOne,
          requisitionId,
          vendorId: firstMatchedVendorId,
          title: requisition?.subject || prev.stepOne.title,
          mode: 'INSIGHTS',
          priority: 'MEDIUM',
          vendorLocked: true,
        },
      }));

      setLoadingRequisitions(false);
      setLoadingVendors(false);
      setLoadingAddresses(false);
      setLoadingCertifications(false);
    };

    loadData();
  }, [isOpen, requisitionId, requisition, selectedVendorIds]);

  // Load smart defaults when vendor is set
  useEffect(() => {
    if (!isOpen || !formData.stepOne.requisitionId || !formData.stepOne.vendorId) return;

    const loadSmartDefaults = async () => {
      try {
        const res = await chatbotService.getSmartDefaults(
          formData.stepOne.requisitionId!,
          formData.stepOne.vendorId!,
        );
        setSmartDefaults(res.data);

        if (res.data) {
          setFormData(prev => {
            const isEmpty = (val: unknown): boolean => val === null || val === undefined || val === 0 || val === '';

            return {
              ...prev,
              stepTwo: {
                ...prev.stepTwo,
                priceQuantity: {
                  ...prev.stepTwo.priceQuantity,
                  targetUnitPrice: isEmpty(prev.stepTwo.priceQuantity.targetUnitPrice)
                    ? (res.data!.priceQuantity.totalTargetPrice ?? res.data!.priceQuantity.targetUnitPrice)
                    : prev.stepTwo.priceQuantity.targetUnitPrice,
                  maxAcceptablePrice: isEmpty(prev.stepTwo.priceQuantity.maxAcceptablePrice)
                    ? (res.data!.priceQuantity.totalMaxPrice ?? res.data!.priceQuantity.maxAcceptablePrice)
                    : prev.stepTwo.priceQuantity.maxAcceptablePrice,
                  minOrderQuantity: isEmpty(prev.stepTwo.priceQuantity.minOrderQuantity)
                    ? res.data!.priceQuantity.totalQuantity
                    : prev.stepTwo.priceQuantity.minOrderQuantity,
                },
                paymentTerms: {
                  ...prev.stepTwo.paymentTerms,
                  minDays: prev.stepTwo.paymentTerms.minDays ?? res.data!.paymentTerms.minDays,
                  maxDays: prev.stepTwo.paymentTerms.maxDays ?? res.data!.paymentTerms.maxDays,
                },
                delivery: {
                  ...prev.stepTwo.delivery,
                  preferredDate: isEmpty(prev.stepTwo.delivery.preferredDate)
                    ? (res.data!.delivery.deliveryDate || null)
                    : prev.stepTwo.delivery.preferredDate,
                  requiredDate: isEmpty(prev.stepTwo.delivery.requiredDate)
                    ? (res.data!.delivery.maxDeliveryDate || null)
                    : prev.stepTwo.delivery.requiredDate,
                },
              },
              stepThree: {
                ...prev.stepThree,
                negotiationControl: {
                  ...prev.stepThree.negotiationControl,
                  deadline: isEmpty(prev.stepThree.negotiationControl.deadline)
                    ? (res.data!.delivery.negotiationClosureDate ?? null)
                    : prev.stepThree.negotiationControl.deadline,
                },
              },
              stepFour: prev.stepFour,
            };
          });
        }
      } catch {
        // Smart defaults are optional
      }
    };

    loadSmartDefaults();
  }, [isOpen, formData.stepOne.requisitionId, formData.stepOne.vendorId]);

  // Auto-populate delivery address
  useEffect(() => {
    if (addresses.length > 0 && !formData.stepTwo.delivery.locationId) {
      const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
      if (defaultAddr) {
        setFormData(prev => ({
          ...prev,
          stepTwo: {
            ...prev.stepTwo,
            delivery: {
              ...prev.stepTwo.delivery,
              locationId: defaultAddr.id,
              locationAddress: defaultAddr.address,
            },
          },
        }));
      }
    }
  }, [addresses, formData.stepTwo.delivery.locationId]);

  // Step change handlers
  const handleStepOneChange = (data: DealWizardStepOne) => {
    setFormData(prev => ({ ...prev, stepOne: data }));
    setErrors({});
  };

  const handleStepTwoChange = (data: DealWizardStepTwo) => {
    setFormData(prev => ({ ...prev, stepTwo: data }));
    setErrors({});
  };

  const handleStepThreeChange = (data: DealWizardStepThree) => {
    setFormData(prev => ({ ...prev, stepThree: data }));
    setErrors({});
  };

  const handleStepFourChange = (data: DealWizardStepFour) => {
    setFormData(prev => ({ ...prev, stepFour: data }));
    setErrors({});
  };

  // Validation (same as NewDealPage)
  const validateStepOne = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.stepOne.requisitionId) newErrors.requisitionId = 'Please select an RFQ';
    // Skip vendorId validation when multiple vendors are selected (batch mode)
    if (!formData.stepOne.vendorId && selectedVendorNames.length === 0) {
      newErrors.vendorId = 'Please select a vendor';
    }
    if (!formData.stepOne.title.trim()) newErrors.title = 'Deal title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepTwo = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { priceQuantity, paymentTerms, delivery } = formData.stepTwo;

    if (!priceQuantity.targetUnitPrice || priceQuantity.targetUnitPrice <= 0) {
      newErrors.targetUnitPrice = 'Target unit price is required';
    }
    if (!priceQuantity.maxAcceptablePrice || priceQuantity.maxAcceptablePrice <= 0) {
      newErrors.maxAcceptablePrice = 'Maximum acceptable price is required';
    }
    if (priceQuantity.targetUnitPrice && priceQuantity.maxAcceptablePrice && priceQuantity.maxAcceptablePrice < priceQuantity.targetUnitPrice) {
      newErrors.maxAcceptablePrice = 'Maximum price must be greater than or equal to target price';
    }
    if (!priceQuantity.minOrderQuantity || priceQuantity.minOrderQuantity <= 0) {
      newErrors.minOrderQuantity = 'Minimum order quantity is required';
    }
    if (!paymentTerms.minDays || paymentTerms.minDays <= 0) {
      newErrors.minPaymentDays = 'Minimum payment days is required';
    }
    if (!paymentTerms.maxDays || paymentTerms.maxDays <= 0) {
      newErrors.maxPaymentDays = 'Maximum payment days is required';
    }
    if (paymentTerms.minDays && paymentTerms.maxDays && paymentTerms.maxDays < paymentTerms.minDays) {
      newErrors.maxPaymentDays = 'Maximum days must be greater than minimum days';
    }
    if (!delivery.requiredDate) {
      newErrors.requiredDate = 'Required delivery date is required';
    }
    if (!delivery.locationId && !delivery.locationAddress) {
      newErrors.locationId = 'Delivery location is required';
    }
    if (delivery.partialDelivery.allowed && !delivery.partialDelivery.minValue) {
      newErrors.partialDeliveryValue = 'Partial delivery minimum value is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepThree = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { contractSla } = formData.stepThree;

    if (!contractSla.warrantyPeriod) {
      newErrors.warrantyPeriod = 'Warranty period is required';
    } else if (contractSla.warrantyPeriod === 'CUSTOM' && (contractSla.customWarrantyMonths === null || contractSla.customWarrantyMonths === undefined)) {
      newErrors.warrantyPeriod = 'Please enter a custom warranty period';
    }
    if (contractSla.lateDeliveryPenaltyPerDay === null || contractSla.lateDeliveryPenaltyPerDay === undefined) {
      newErrors.lateDeliveryPenaltyPerDay = 'Late delivery penalty is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepFour = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (Math.abs(formData.stepFour.totalWeight - 100) > 0.01) {
      newErrors.stepFour = `Parameter weights must sum to 100%. Current total: ${Math.round(formData.stepFour.totalWeight)}%`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = (): boolean => {
    const allErrors: Record<string, string[]> = {};
    if (!formData.stepOne.requisitionId) allErrors.step1_requisitionId = ['Please select an RFQ'];
    if (!formData.stepOne.vendorId && selectedVendorNames.length === 0) allErrors.step1_vendorId = ['Please select a vendor'];
    if (!formData.stepOne.title.trim()) allErrors.step1_title = ['Deal title is required'];
    if (!formData.stepTwo.priceQuantity.targetUnitPrice) allErrors.step2_targetPrice = ['Target unit price is required'];
    if (!formData.stepTwo.priceQuantity.maxAcceptablePrice) allErrors.step2_maxPrice = ['Maximum acceptable price is required'];
    if (!formData.stepTwo.delivery.requiredDate) allErrors.step2_deliveryDate = ['Required delivery date is required'];
    if (!formData.stepThree.contractSla.warrantyPeriod) allErrors.step3_warranty = ['Warranty period is required'];
    setValidationErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    let isValid = true;
    switch (wizardStep) {
      case 1: isValid = validateStepOne(); break;
      case 2: isValid = validateStepTwo(); break;
      case 3: isValid = validateStepThree(); break;
      case 4: isValid = validateStepFour(); break;
    }
    if (isValid) {
      setWizardStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setErrors({});
    setWizardStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < wizardStep) {
      setErrors({});
      setWizardStep(stepId);
    }
  };

  const handleEditStep = (step: number) => {
    setWizardStep(step);
  };

  const handleRequisitionChange = useCallback(async (rfqId: number | null) => {
    if (!rfqId) return;
    try {
      const res = await chatbotService.getRequisitionVendors(rfqId);
      setVendors(res.data || []);
    } catch {
      setVendors([]);
    }
  }, []);

  const handleAddNewAddress = () => {
    toast('Address management coming soon', { icon: 'ℹ️' });
  };

  const handleCreateDeals = () => {
    if (!validateAll()) {
      toast.error('Please fix validation errors before creating deals');
      return;
    }
    onSubmit(formData);
  };

  // Render step content
  const renderStepContent = () => {
    switch (wizardStep) {
      case 1:
        return (
          <StepOne
            data={formData.stepOne}
            onChange={handleStepOneChange}
            requisitions={requisitions}
            vendors={vendors}
            loadingRequisitions={loadingRequisitions}
            loadingVendors={loadingVendors}
            onRequisitionChange={handleRequisitionChange}
            errors={errors}
            lockedFields={true}
            selectedVendorNames={selectedVendorNames}
          />
        );
      case 2:
        return (
          <StepTwo
            data={formData.stepTwo}
            onChange={handleStepTwoChange}
            addresses={addresses}
            loadingAddresses={loadingAddresses}
            smartDefaults={smartDefaults}
            errors={errors}
            onAddNewAddress={handleAddNewAddress}
            vendorId={formData.stepOne.vendorId}
          />
        );
      case 3:
        return (
          <StepThree
            data={formData.stepThree}
            onChange={handleStepThreeChange}
            certifications={certifications}
            loadingCertifications={loadingCertifications}
            errors={errors}
          />
        );
      case 4:
        return (
          <StepFour
            data={formData.stepFour}
            onChange={handleStepFourChange}
            stepTwoData={formData.stepTwo}
            stepThreeData={formData.stepThree}
            errors={errors}
          />
        );
      case 5:
        return (
          <ReviewStep
            data={formData}
            requisitions={requisitions}
            vendors={vendors}
            addresses={addresses}
            onEditStep={handleEditStep}
            validationErrors={validationErrors}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Configure Deal Parameters</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedVendorIds.length} vendor{selectedVendorIds.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress */}
        <div className="px-6 border-b border-gray-100 flex-shrink-0">
          <StepProgress
            steps={WIZARD_STEPS}
            currentStep={wizardStep}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {(loadingRequisitions || loadingVendors) ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-500">Loading data...</span>
            </div>
          ) : (
            renderStepContent()
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            {wizardStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            {wizardStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreateDeals}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Deals
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealWizardModal;
