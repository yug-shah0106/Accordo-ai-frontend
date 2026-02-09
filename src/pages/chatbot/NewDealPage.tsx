console.log('[NewDealPage] === MODULE LOADING START ===');

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
console.log('[NewDealPage] React hooks imported');

import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
console.log('[NewDealPage] React Router imported');

import { ArrowLeft, Loader2, Save, AlertCircle, CheckCircle, Mail, X, RefreshCw } from 'lucide-react';
console.log('[NewDealPage] Lucide icons imported');

import toast from 'react-hot-toast';
console.log('[NewDealPage] react-hot-toast imported');

import chatbotService from '../../services/chatbot.service';
console.log('[NewDealPage] chatbotService imported');

import {
  StepProgress,
  StepOne,
  StepTwo,
  StepThree,
  StepFour,
  ReviewStep,
  CHART_COLORS,
} from '../../components/chatbot/deal-wizard';
console.log('[NewDealPage] Wizard components imported');

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
  ParameterWeight,
} from '../../types';
console.log('[NewDealPage] Types imported');

import { DEFAULT_WIZARD_FORM_DATA } from '../../types';
console.log('[NewDealPage] DEFAULT_WIZARD_FORM_DATA imported:', !!DEFAULT_WIZARD_FORM_DATA);

console.log('[NewDealPage] === ALL IMPORTS SUCCESSFUL ===');

const WIZARD_STEPS = [
  { id: 1, title: 'Basic Info', description: 'RFQ & Vendor' },
  { id: 2, title: 'Commercial', description: 'Price & Terms' },
  { id: 3, title: 'Contract', description: 'SLA & Control' },
  { id: 4, title: 'Weights', description: 'Priorities' },
  { id: 5, title: 'Review', description: 'Confirm' },
];

const DRAFT_KEY_PREFIX = 'accordo_deal_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

// Generate dynamic draft key based on RFQ+Vendor combination
const getDraftKey = (rfqId: number | null, vendorId: number | null): string => {
  if (rfqId && vendorId) {
    return `${DRAFT_KEY_PREFIX}_rfq_${rfqId}_vendor_${vendorId}`;
  }
  // Fallback to a session-based temp key for when no RFQ/vendor selected yet
  return `${DRAFT_KEY_PREFIX}_temp`;
};

// Parameter definitions for Step 4 (must match StepFour.tsx)
const STEP2_PARAMETERS = [
  { id: 'targetUnitPrice', name: 'Target Unit Price', source: 'step2' as const, category: 'price' },
  { id: 'maxAcceptablePrice', name: 'Max Acceptable Price', source: 'step2' as const, category: 'price' },
  { id: 'volumeDiscountExpectation', name: 'Volume Discount', source: 'step2' as const, category: 'price' },
  { id: 'paymentTermsRange', name: 'Payment Terms Range', source: 'step2' as const, category: 'payment' },
  { id: 'advancePaymentLimit', name: 'Advance Payment Limit', source: 'step2' as const, category: 'payment' },
  { id: 'deliveryDate', name: 'Delivery Date', source: 'step2' as const, category: 'delivery' },
  { id: 'partialDelivery', name: 'Partial Delivery', source: 'step2' as const, category: 'delivery' },
];

const STEP3_PARAMETERS = [
  { id: 'warrantyPeriod', name: 'Warranty Period', source: 'step3' as const, category: 'contract' },
  { id: 'lateDeliveryPenalty', name: 'Late Delivery Penalty', source: 'step3' as const, category: 'contract' },
  { id: 'qualityStandards', name: 'Quality Standards', source: 'step3' as const, category: 'contract' },
  { id: 'maxRounds', name: 'Max Negotiation Rounds', source: 'step3' as const, category: 'control' },
  { id: 'walkawayThreshold', name: 'Walkaway Threshold', source: 'step3' as const, category: 'control' },
];

/**
 * Build Step 4 weights from requisition priorities
 * Maps pricePriority, deliveryPriority, paymentTermsPriority to individual parameter weights
 */
const buildWeightsFromPriorities = (
  pricePriority: number | null,
  deliveryPriority: number | null,
  paymentTermsPriority: number | null
): ParameterWeight[] => {
  const allParameters = [...STEP2_PARAMETERS, ...STEP3_PARAMETERS];

  // If no priorities provided, return empty (will use default initialization)
  if (pricePriority === null && deliveryPriority === null && paymentTermsPriority === null) {
    return [];
  }

  // Normalize priorities to ensure they sum to 100
  const rawPriceWeight = pricePriority || 40;
  const rawDeliveryWeight = deliveryPriority || 30;
  const rawPaymentWeight = paymentTermsPriority || 30;
  const total = rawPriceWeight + rawDeliveryWeight + rawPaymentWeight;

  const priceWeight = Math.round((rawPriceWeight / total) * 100);
  const deliveryWeight = Math.round((rawDeliveryWeight / total) * 100);
  const paymentWeight = 100 - priceWeight - deliveryWeight; // Ensure exactly 100

  // Count parameters in each category
  const priceParams = allParameters.filter(p => p.category === 'price');
  const deliveryParams = allParameters.filter(p => p.category === 'delivery');
  const paymentParams = allParameters.filter(p => p.category === 'payment');
  const otherParams = allParameters.filter(p => !['price', 'delivery', 'payment'].includes(p.category));

  // Allocate weights to categories
  // Reserve 15% for contract/control parameters
  const reservedForOther = 15;
  const availableForMain = 100 - reservedForOther;

  const allocatedPrice = Math.round((priceWeight / 100) * availableForMain);
  const allocatedDelivery = Math.round((deliveryWeight / 100) * availableForMain);
  const allocatedPayment = availableForMain - allocatedPrice - allocatedDelivery;

  // Distribute within categories
  const weights: ParameterWeight[] = allParameters.map((param, index) => {
    let weight = 0;

    if (param.category === 'price' && priceParams.length > 0) {
      // Distribute price weight: 50% to targetUnitPrice, 30% to maxAcceptable, 20% to volumeDiscount
      if (param.id === 'targetUnitPrice') weight = Math.round(allocatedPrice * 0.5);
      else if (param.id === 'maxAcceptablePrice') weight = Math.round(allocatedPrice * 0.3);
      else weight = Math.round(allocatedPrice * 0.2);
    } else if (param.category === 'delivery' && deliveryParams.length > 0) {
      // Distribute delivery weight: 70% to date, 30% to partial
      if (param.id === 'deliveryDate') weight = Math.round(allocatedDelivery * 0.7);
      else weight = Math.round(allocatedDelivery * 0.3);
    } else if (param.category === 'payment' && paymentParams.length > 0) {
      // Distribute payment weight: 60% to range, 40% to advance limit
      if (param.id === 'paymentTermsRange') weight = Math.round(allocatedPayment * 0.6);
      else weight = Math.round(allocatedPayment * 0.4);
    } else if (otherParams.length > 0) {
      // Distribute remaining weight equally among contract/control parameters
      weight = Math.round(reservedForOther / otherParams.length);
    }

    return {
      parameterId: param.id,
      parameterName: param.name,
      weight,
      source: param.source,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
  });

  // Adjust to ensure exactly 100%
  const currentTotal = weights.reduce((sum, w) => sum + w.weight, 0);
  if (currentTotal !== 100 && weights.length > 0) {
    const diff = 100 - currentTotal;
    // Add difference to the largest weight parameter
    const maxWeightIdx = weights.reduce((maxIdx, w, idx, arr) =>
      w.weight > arr[maxIdx].weight ? idx : maxIdx, 0);
    weights[maxWeightIdx].weight += diff;
  }

  return weights;
};

/**
 * NewDealPage - Multi-step wizard for creating a new negotiation deal
 * Replaces the simple form with a comprehensive configuration wizard
 */
export default function NewDealPage() {
  console.log('[NewDealPage] Component mounting...');
  const navigate = useNavigate();
  console.log('[NewDealPage] navigate hook loaded');
  const [searchParams] = useSearchParams();
  console.log('[NewDealPage] searchParams loaded:', searchParams.toString());
  const location = useLocation();

  // Support both 'requisitionId' and 'requisition' query params for flexibility
  const preselectedRequisitionId = searchParams.get('requisitionId') || searchParams.get('requisition');

  // URL parameters for refresh-safe navigation from VendorDetails
  const urlRfqId = searchParams.get('rfqId');
  const urlVendorId = searchParams.get('vendorId');
  const urlVendorName = searchParams.get('vendorName');  // Fallback for vendor matching
  const urlLocked = searchParams.get('locked') === 'true';
  const urlReturnTo = searchParams.get('returnTo');
  // Optional: contractId from "Start Negotiation" on existing contract
  // When provided, the deal will be linked to this existing contract
  const urlContractId = searchParams.get('contractId');

  console.log('[NewDealPage] URL params:', { urlRfqId, urlVendorId, urlVendorName, urlLocked, urlReturnTo, urlContractId });

  // Handle router state from VendorDetails "Start Negotiation" flow
  const routerState = location.state as {
    requisition?: RequisitionSummary;
    vendor?: VendorSummary;
    lockedFields?: boolean;
    returnTo?: string;
  } | null;

  // Check if we're in "locked" mode (either from router state OR URL param)
  const isLockedMode = (routerState?.lockedFields === true) || urlLocked;
  const prefilledRequisition = routerState?.requisition || null;
  const prefilledVendor = routerState?.vendor || null;
  const returnToPath = routerState?.returnTo || urlReturnTo || null;

  // Determine back button config based on URL context
  const backButtonConfig = useMemo(() => {
    // Priority 1: Return to path from router state OR URL param (VendorDetails flow)
    if (returnToPath) {
      return {
        label: 'Cancel',
        path: returnToPath,
      };
    }
    // Priority 2: Coming from a specific requisition via query param (rfqId or requisitionId)
    if (urlRfqId) {
      return {
        label: 'Back to Requisition',
        path: `/requisition-management/edit/${urlRfqId}`,
      };
    }
    if (preselectedRequisitionId) {
      return {
        label: 'Back to Deals',
        path: `/chatbot/requisitions/${preselectedRequisitionId}`,
      };
    }
    // Priority 3: Generic deal creation - go back to requisitions list
    return {
      label: 'Back to Requisitions',
      path: '/chatbot/requisitions',
    };
  }, [preselectedRequisitionId, returnToPath, urlRfqId]);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DealWizardFormData>(DEFAULT_WIZARD_FORM_DATA);

  // Data sources
  const [requisitions, setRequisitions] = useState<RequisitionSummary[]>([]);
  const [vendors, setVendors] = useState<VendorSummary[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [certifications, setCertifications] = useState<QualityCertification[]>([]);
  const [smartDefaults, setSmartDefaults] = useState<SmartDefaults | null>(null);

  // Loading states
  const [loadingRequisitions, setLoadingRequisitions] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingCertifications, setLoadingCertifications] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Validation & draft
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Email failure modal state
  const [showEmailFailedModal, setShowEmailFailedModal] = useState(false);
  const [emailFailureError, setEmailFailureError] = useState<string | null>(null);
  const [pendingDealNavigation, setPendingDealNavigation] = useState<{
    rfqId: number;
    vendorId: number;
    dealId: string;
  } | null>(null);
  const [retryingEmail, setRetryingEmail] = useState(false);

  // Load initial data
  useEffect(() => {
    console.log('[NewDealPage] useEffect for loadInitialData triggered');
    const loadInitialData = async () => {
      console.log('[NewDealPage] loadInitialData starting...');
      try {
        // Load requisitions
        try {
          console.log('[NewDealPage] Calling getRequisitions...');
          const rfqRes = await chatbotService.getRequisitions();
          console.log('[NewDealPage] getRequisitions response:', rfqRes);
          setRequisitions(rfqRes.data || []);
        } catch (err) {
          console.warn('[NewDealPage] Failed to load requisitions:', err);
          // Use mock data for development
          setRequisitions([]);
        }
        setLoadingRequisitions(false);

        // Note: Buyer company addresses are loaded in a separate useEffect
        // (not dependent on vendor selection)

        // Load certifications
        try {
          const certRes = await chatbotService.getQualityCertifications();
          setCertifications(certRes.data || []);
        } catch (err) {
          console.warn('Failed to load certifications:', err);
          // Use default certifications
          setCertifications([
            { id: 'ISO_9001', name: 'ISO 9001:2015', category: 'Quality Management' },
            { id: 'ISO_14001', name: 'ISO 14001:2015', category: 'Environmental' },
            { id: 'ISO_27001', name: 'ISO 27001:2022', category: 'Information Security' },
            { id: 'CE', name: 'CE Marking', category: 'European Conformity' },
            { id: 'FDA', name: 'FDA Registered', category: 'Food & Drug' },
            { id: 'UL', name: 'UL Listed', category: 'Safety' },
            { id: 'RoHS', name: 'RoHS Compliant', category: 'Hazardous Substances' },
          ]);
        }
        setLoadingCertifications(false);
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };

    loadInitialData();

    // Load draft from sessionStorage - always attempt to load temp draft on initial mount
    const tempDraft = sessionStorage.getItem(getDraftKey(null, null));
    if (tempDraft) {
      try {
        const parsed = JSON.parse(tempDraft);
        if (parsed.data) {
          // Merge with defaults to ensure all fields exist (especially stepFour for older drafts)
          setFormData({
            ...DEFAULT_WIZARD_FORM_DATA,
            ...parsed.data,
            stepFour: parsed.data.stepFour || DEFAULT_WIZARD_FORM_DATA.stepFour,
          });
          setLastSaved(parsed.savedAt ? new Date(parsed.savedAt) : null);
        }
      } catch (err) {
        console.warn('Failed to parse temp draft:', err);
      }
    }

    // Cleanup function
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Get current draft key based on selected RFQ+Vendor
  const currentDraftKey = useMemo(() => {
    return getDraftKey(formData.stepOne.requisitionId, formData.stepOne.vendorId);
  }, [formData.stepOne.requisitionId, formData.stepOne.vendorId]);

  // Auto-save to sessionStorage with dynamic key
  const saveDraftToSessionStorage = useCallback(() => {
    setDraftSaving(true);
    try {
      const draftData = JSON.stringify({
        data: formData,
        savedAt: new Date().toISOString(),
      });

      // Save to current key (RFQ+Vendor specific or temp)
      sessionStorage.setItem(currentDraftKey, draftData);

      // Also save to temp key for recovery on page reload
      sessionStorage.setItem(getDraftKey(null, null), draftData);

      setLastSaved(new Date());
    } catch (err) {
      console.warn('Failed to save draft:', err);
    }
    setDraftSaving(false);
  }, [formData, currentDraftKey]);

  // Setup auto-save timer
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveDraftToSessionStorage();
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, saveDraftToSessionStorage]);

  // Save draft on page unload (beforeunload event)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Synchronously save to sessionStorage before page unloads
      try {
        const draftData = JSON.stringify({
          data: formData,
          savedAt: new Date().toISOString(),
        });
        sessionStorage.setItem(currentDraftKey, draftData);
        sessionStorage.setItem(getDraftKey(null, null), draftData);
      } catch {
        // Ignore errors during unload
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, currentDraftKey]);

  // Load vendors when RFQ changes
  const handleRequisitionChange = useCallback(async (rfqId: number | null) => {
    setVendors([]);
    setSmartDefaults(null);

    if (!rfqId) return;

    setLoadingVendors(true);
    try {
      const res = await chatbotService.getRequisitionVendors(rfqId);
      setVendors(res.data || []);
    } catch (err) {
      console.warn('Failed to load vendors for RFQ:', err);
      setVendors([]);
    }
    setLoadingVendors(false);
  }, []);

  // Track if we've loaded vendors for the preselected requisition
  const [vendorsLoadedForPreselection, setVendorsLoadedForPreselection] = useState(false);

  // Track if we've initialized from router state (locked mode)
  const [routerStateInitialized, setRouterStateInitialized] = useState(false);

  // Initialize form from router state (VendorDetails "Start Negotiation" flow)
  useEffect(() => {
    if (isLockedMode && prefilledRequisition && prefilledVendor && !routerStateInitialized) {
      console.log('[NewDealPage] Initializing from router state (locked mode):', {
        requisition: prefilledRequisition,
        vendor: prefilledVendor,
      });

      // Set form data from router state
      setFormData(prev => ({
        ...prev,
        stepOne: {
          ...prev.stepOne,
          requisitionId: prefilledRequisition.id,
          vendorId: prefilledVendor.id,
          title: prefilledRequisition.title || prev.stepOne.title,
          vendorLocked: true, // Locked when coming from router state with lockedFields
        }
      }));

      // Add the prefilled requisition to the list if not present
      setRequisitions(prev => {
        const exists = prev.some(r => r.id === prefilledRequisition.id);
        if (!exists) {
          return [...prev, prefilledRequisition as RequisitionSummary];
        }
        return prev;
      });

      // Check if prefilled vendor has addresses
      const hasAddresses = prefilledVendor.addresses && prefilledVendor.addresses.length > 0;

      if (hasAddresses) {
        // Vendor has addresses, use directly
        console.log('[NewDealPage] Prefilled vendor has addresses, using directly');
        setVendors([prefilledVendor as VendorSummary]);
        setLoadingVendors(false);
      } else {
        // Vendor doesn't have addresses - fetch from API to get complete data
        console.log('[NewDealPage] Prefilled vendor missing addresses, fetching from API...');
        setLoadingVendors(true);

        // Fetch vendors for the requisition to get complete data including addresses
        chatbotService.getRequisitionVendors(prefilledRequisition.id)
          .then(res => {
            const fetchedVendors = res.data || [];
            console.log('[NewDealPage] Fetched vendors from API:', fetchedVendors.length);

            // Try to find matching vendor by multiple criteria (ID mismatch workaround)
            // VendorDetails passes vendorId, but API returns user.id, so match by name/email
            const fullVendorData = fetchedVendors.find(v =>
              v.id === prefilledVendor.id ||  // Try ID first (in case it matches)
              (v.email && v.email === prefilledVendor.email) ||  // Match by email
              (v.name && v.name === prefilledVendor.name)  // Match by name
            );

            if (fullVendorData) {
              console.log('[NewDealPage] Found vendor with addresses:', fullVendorData.addresses?.length || 0);
              // Update the form's vendorId to match the API's vendor ID
              setFormData(prev => ({
                ...prev,
                stepOne: {
                  ...prev.stepOne,
                  vendorId: fullVendorData.id,  // Use correct vendor ID from API
                }
              }));
              setVendors([fullVendorData]);
            } else if (fetchedVendors.length > 0) {
              // Vendor not matched by ID/email/name, but we have vendors for this requisition
              // Use the first vendor as fallback (API already filtered by requisition)
              console.log('[NewDealPage] Using first vendor from API response');
              setVendors(fetchedVendors);
            } else {
              // No vendors from API, use prefilled (will have no addresses)
              console.warn('[NewDealPage] No vendors from API, using prefilled vendor');
              setVendors([prefilledVendor as VendorSummary]);
            }
          })
          .catch(err => {
            console.warn('[NewDealPage] Failed to fetch vendor data:', err);
            // Fallback to prefilled vendor without addresses
            setVendors([prefilledVendor as VendorSummary]);
          })
          .finally(() => {
            setLoadingVendors(false);
          });
      }

      setRouterStateInitialized(true);
      setVendorsLoadedForPreselection(true); // Prevent other useEffect from overriding
    }
  }, [isLockedMode, prefilledRequisition, prefilledVendor, routerStateInitialized]);

  // Initialize from URL parameters (refresh-safe approach from VendorDetails)
  useEffect(() => {
    const initFromUrlParams = async () => {
      // Skip if no URL params or already initialized from router state
      if (!urlRfqId || !urlVendorId) return;
      if (routerStateInitialized) return;

      console.log('[NewDealPage] Initializing from URL params:', { rfqId: urlRfqId, vendorId: urlVendorId });

      try {
        setLoadingVendors(true);

        // Fetch requisitions to populate the dropdown and get selected RFQ details
        const rfqRes = await chatbotService.getRequisitions();
        const rfqList = rfqRes.data || [];
        setRequisitions(rfqList);

        const selectedRfq = rfqList.find(r => r.id === parseInt(urlRfqId));
        console.log('[NewDealPage] Found RFQ from URL:', selectedRfq);

        // Fetch vendors for the requisition - this returns vendors with addresses
        const vendorRes = await chatbotService.getRequisitionVendors(parseInt(urlRfqId));
        const vendorList = vendorRes.data || [];
        console.log('[NewDealPage] Fetched vendors for RFQ:', vendorList.length);

        // Find the specific vendor using multi-criteria matching
        // Priority: 1. ID match, 2. vendorId match, 3. name match (case-insensitive)
        const decodedVendorName = urlVendorName ? decodeURIComponent(urlVendorName) : null;
        const selectedVendor = vendorList.find(v =>
          v.id === parseInt(urlVendorId) ||
          v.id?.toString() === urlVendorId ||
          v.vendorId?.toString() === urlVendorId ||
          (decodedVendorName && v.name?.toLowerCase() === decodedVendorName.toLowerCase())
        );

        if (selectedVendor) {
          console.log('[NewDealPage] Found vendor match:', {
            id: selectedVendor.id,
            name: selectedVendor.name,
            addressCount: selectedVendor.addresses?.length || 0,
            matchedBy: selectedVendor.id === parseInt(urlVendorId) ? 'id' :
                       selectedVendor.id?.toString() === urlVendorId ? 'id-string' :
                       selectedVendor.vendorId?.toString() === urlVendorId ? 'vendorId' : 'name'
          });

          // Set vendors state - show ONLY this vendor in locked mode
          setVendors([selectedVendor]);

          // Set form data with pre-selected values
          // Lock dropdown when vendor is found from URL (per user requirement)
          setFormData(prev => ({
            ...prev,
            stepOne: {
              ...prev.stepOne,
              requisitionId: parseInt(urlRfqId),
              vendorId: selectedVendor.id,
              title: selectedRfq?.title || prev.stepOne.title,
              vendorLocked: isLockedMode,  // Respect locked=true from URL
            }
          }));
        } else if (vendorList.length > 0 && decodedVendorName) {
          // Vendor not found by ID or name - try partial name match as last resort
          const partialMatch = vendorList.find(v =>
            v.name?.toLowerCase().includes(decodedVendorName.toLowerCase()) ||
            decodedVendorName.toLowerCase().includes(v.name?.toLowerCase() || '')
          );

          if (partialMatch) {
            console.log('[NewDealPage] Found vendor via partial name match:', partialMatch.name);
            setVendors([partialMatch]);
            setFormData(prev => ({
              ...prev,
              stepOne: {
                ...prev.stepOne,
                requisitionId: parseInt(urlRfqId),
                vendorId: partialMatch.id,
                title: selectedRfq?.title || prev.stepOne.title,
                vendorLocked: isLockedMode,
              }
            }));
          } else {
            // Still no match - show all vendors but don't auto-select wrong one
            console.warn('[NewDealPage] No vendor match found, showing all vendors. URL vendorId:', urlVendorId, 'vendorName:', decodedVendorName);
            setVendors(vendorList);
            setFormData(prev => ({
              ...prev,
              stepOne: {
                ...prev.stepOne,
                requisitionId: parseInt(urlRfqId),
                vendorId: null,  // Don't auto-select wrong vendor
                title: selectedRfq?.title || prev.stepOne.title,
                vendorLocked: false,  // Unlock so user can select
              }
            }));
          }
        } else if (vendorList.length > 0) {
          // No vendor name hint and no ID match - show all vendors unlocked
          console.warn('[NewDealPage] Vendor not found by ID, no name hint. Showing all vendors.');
          setVendors(vendorList);
          setFormData(prev => ({
            ...prev,
            stepOne: {
              ...prev.stepOne,
              requisitionId: parseInt(urlRfqId),
              vendorId: null,  // Don't auto-select wrong vendor
              title: selectedRfq?.title || prev.stepOne.title,
              vendorLocked: false,  // Unlock dropdown since requested vendor not found
            }
          }));
        } else {
          // No vendors available - just set the RFQ
          console.warn('[NewDealPage] No vendors found for RFQ');
          setFormData(prev => ({
            ...prev,
            stepOne: {
              ...prev.stepOne,
              requisitionId: parseInt(urlRfqId),
              title: selectedRfq?.title || prev.stepOne.title,
            }
          }));
        }

        setRouterStateInitialized(true);
        setVendorsLoadedForPreselection(true);
      } catch (error) {
        console.error('[NewDealPage] Failed to initialize from URL params:', error);
        // On error, fall back to normal flow
      } finally {
        setLoadingVendors(false);
        setLoadingRequisitions(false);
      }
    };

    initFromUrlParams();
  }, [urlRfqId, urlVendorId, urlVendorName, routerStateInitialized, isLockedMode]);

  // Auto-populate requisition from URL query param (requisitionId=X scenario - NOT locked)
  useEffect(() => {
    if (preselectedRequisitionId && requisitions.length > 0) {
      const rfqId = parseInt(preselectedRequisitionId);
      const rfq = requisitions.find(r => r.id === rfqId);
      if (rfq) {
        // Always set the form data to match the URL parameter
        if (formData.stepOne.requisitionId !== rfqId) {
          setFormData(prev => ({
            ...prev,
            stepOne: {
              ...prev.stepOne,
              requisitionId: rfqId,
              vendorId: null, // Reset vendor when RFQ is pre-selected
              title: rfq.title || prev.stepOne.title,
              vendorLocked: false, // Explicitly NOT locked for requisitionId param
            }
          }));
        }
        // Always load vendors when we have a preselected requisition (even if draft had the same one)
        if (!vendorsLoadedForPreselection) {
          handleRequisitionChange(rfqId);
          setVendorsLoadedForPreselection(true);
        }
      }
    }
  }, [preselectedRequisitionId, requisitions, formData.stepOne.requisitionId, handleRequisitionChange, vendorsLoadedForPreselection]);

  // Load vendors when draft is restored with a requisitionId (but no URL param)
  // This ensures vendors are loaded even if coming from localStorage draft
  useEffect(() => {
    // Only run if there's no preselected requisition (already handled above)
    // and a requisitionId is set (e.g., from draft) but vendors array is empty
    if (!preselectedRequisitionId &&
        formData.stepOne.requisitionId &&
        vendors.length === 0 &&
        !loadingVendors &&
        !loadingRequisitions) {
      handleRequisitionChange(formData.stepOne.requisitionId);
    }
  }, [preselectedRequisitionId, formData.stepOne.requisitionId, vendors.length, loadingVendors, loadingRequisitions, handleRequisitionChange]);

  // Load smart defaults when vendor changes
  useEffect(() => {
    const loadSmartDefaults = async () => {
      const { requisitionId, vendorId } = formData.stepOne;
      if (!requisitionId || !vendorId) {
        setSmartDefaults(null);
        return;
      }

      try {
        const res = await chatbotService.getSmartDefaults(requisitionId, vendorId);
        console.log('[SmartDefaults] Raw response:', res);
        console.log('[SmartDefaults] res.data:', res.data);
        console.log('[SmartDefaults] priceQuantity:', res.data?.priceQuantity);
        console.log('[SmartDefaults] delivery:', res.data?.delivery);
        setSmartDefaults(res.data);

        // Apply smart defaults to form data if available
        if (res.data) {
          console.log('[SmartDefaults] Applying to form. totalTargetPrice:', res.data.priceQuantity?.totalTargetPrice);
          console.log('[SmartDefaults] Applying to form. totalMaxPrice:', res.data.priceQuantity?.totalMaxPrice);
          console.log('[SmartDefaults] Applying to form. totalQuantity:', res.data.priceQuantity?.totalQuantity);
          console.log('[SmartDefaults] Applying to form. maxDeliveryDate:', res.data.delivery?.maxDeliveryDate);
          setFormData((prev) => {
            console.log('[SmartDefaults] Previous targetUnitPrice:', prev.stepTwo.priceQuantity.targetUnitPrice);
            console.log('[SmartDefaults] Previous maxAcceptablePrice:', prev.stepTwo.priceQuantity.maxAcceptablePrice);
            console.log('[SmartDefaults] Previous minOrderQuantity:', prev.stepTwo.priceQuantity.minOrderQuantity);
            console.log('[SmartDefaults] Previous requiredDate:', prev.stepTwo.delivery.requiredDate);

            // Helper to check if a value is empty (null, undefined, 0, or empty string)
            const isEmpty = (val: unknown): boolean => val === null || val === undefined || val === 0 || val === '';

            return {
            ...prev,
            stepTwo: {
              ...prev.stepTwo,
              priceQuantity: {
                ...prev.stepTwo.priceQuantity,
                // Use total values from requisition (new behavior)
                // Use isEmpty check instead of ?? to also apply defaults when value is 0
                targetUnitPrice: isEmpty(prev.stepTwo.priceQuantity.targetUnitPrice)
                  ? (res.data.priceQuantity.totalTargetPrice ?? res.data.priceQuantity.targetUnitPrice)
                  : prev.stepTwo.priceQuantity.targetUnitPrice,
                maxAcceptablePrice: isEmpty(prev.stepTwo.priceQuantity.maxAcceptablePrice)
                  ? (res.data.priceQuantity.totalMaxPrice ?? res.data.priceQuantity.maxAcceptablePrice)
                  : prev.stepTwo.priceQuantity.maxAcceptablePrice,
                // Auto-populate minimum order quantity from total quantity
                minOrderQuantity: isEmpty(prev.stepTwo.priceQuantity.minOrderQuantity)
                  ? res.data.priceQuantity.totalQuantity
                  : prev.stepTwo.priceQuantity.minOrderQuantity,
                volumeDiscountExpectation: isEmpty(prev.stepTwo.priceQuantity.volumeDiscountExpectation)
                  ? res.data.priceQuantity.volumeDiscountExpectation
                  : prev.stepTwo.priceQuantity.volumeDiscountExpectation,
              },
              paymentTerms: {
                ...prev.stepTwo.paymentTerms,
                minDays: prev.stepTwo.paymentTerms.minDays ?? res.data.paymentTerms.minDays,
                maxDays: prev.stepTwo.paymentTerms.maxDays ?? res.data.paymentTerms.maxDays,
                advancePaymentLimit:
                  prev.stepTwo.paymentTerms.advancePaymentLimit ??
                  res.data.paymentTerms.advancePaymentLimit,
              },
              delivery: {
                ...prev.stepTwo.delivery,
                // deliveryDate from requisition -> preferredDate in wizard
                preferredDate: isEmpty(prev.stepTwo.delivery.preferredDate)
                  ? (res.data.delivery.deliveryDate ?? '')
                  : prev.stepTwo.delivery.preferredDate,
                // maxDeliveryDate from requisition -> requiredDate in wizard
                requiredDate: isEmpty(prev.stepTwo.delivery.requiredDate)
                  ? (res.data.delivery.maxDeliveryDate ?? '')
                  : prev.stepTwo.delivery.requiredDate,
              },
            },
            stepThree: {
              ...prev.stepThree,
              negotiationControl: {
                ...prev.stepThree.negotiationControl,
                deadline: isEmpty(prev.stepThree.negotiationControl.deadline)
                  ? (res.data.delivery.negotiationClosureDate ?? null)
                  : prev.stepThree.negotiationControl.deadline,
                // Auto-populate walkaway threshold from BATNA if available
                walkawayThreshold: isEmpty(prev.stepThree.negotiationControl.walkawayThreshold)
                  ? (res.data.negotiationLimits?.batna ?? prev.stepThree.negotiationControl.walkawayThreshold)
                  : prev.stepThree.negotiationControl.walkawayThreshold,
              },
            },
            // Auto-populate Step 4 weights from requisition priorities
            stepFour: prev.stepFour.weights.length === 0 && res.data.priorities
              ? (() => {
                  const priorityWeights = buildWeightsFromPriorities(
                    res.data.priorities.pricePriority,
                    res.data.priorities.deliveryPriority,
                    res.data.priorities.paymentTermsPriority
                  );
                  if (priorityWeights.length > 0) {
                    console.log('[SmartDefaults] Auto-populating Step 4 weights from requisition priorities:', {
                      pricePriority: res.data.priorities.pricePriority,
                      deliveryPriority: res.data.priorities.deliveryPriority,
                      paymentTermsPriority: res.data.priorities.paymentTermsPriority,
                    });
                    return {
                      weights: priorityWeights,
                      aiSuggested: true, // Mark as AI suggested since they come from requisition
                      totalWeight: priorityWeights.reduce((sum, w) => sum + w.weight, 0),
                    };
                  }
                  return prev.stepFour;
                })()
              : prev.stepFour,
          };
          });
        }
      } catch (err) {
        console.warn('Failed to load smart defaults:', err);
      }
    };

    loadSmartDefaults();
  }, [formData.stepOne.requisitionId, formData.stepOne.vendorId]);

  // Load buyer's company addresses (procurement manager's office address)
  // This is loaded once when the component mounts, not dependent on vendor selection
  useEffect(() => {
    const loadBuyerAddresses = async () => {
      setLoadingAddresses(true);
      try {
        // Fetch the buyer's (procurement manager's) company addresses
        const res = await chatbotService.getDeliveryAddresses();
        const buyerAddresses = res.data || [];
        setAddresses(buyerAddresses);

        // Auto-populate with default address if available and no address is selected yet
        if (buyerAddresses.length > 0 && !formData.stepTwo.delivery.locationId) {
          // Find the default address or use the first one
          const defaultAddr = buyerAddresses.find((addr) => addr.isDefault) || buyerAddresses[0];
          if (defaultAddr) {
            setFormData((prev) => ({
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
      } catch (err) {
        console.warn('Failed to load buyer addresses:', err);
        setAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadBuyerAddresses();
  }, []); // Load once on mount

  // Step update handlers
  const handleStepOneChange = (data: DealWizardStepOne) => {
    setFormData((prev) => ({ ...prev, stepOne: data }));
    setErrors({});
  };

  const handleStepTwoChange = (data: DealWizardStepTwo) => {
    setFormData((prev) => ({ ...prev, stepTwo: data }));
    setErrors({});
  };

  const handleStepThreeChange = (data: DealWizardStepThree) => {
    setFormData((prev) => ({ ...prev, stepThree: data }));
    setErrors({});
  };

  const handleStepFourChange = (data: DealWizardStepFour) => {
    setFormData((prev) => ({ ...prev, stepFour: data }));
    setErrors({});
  };

  // Validation
  const validateStepOne = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { stepOne } = formData;

    if (!stepOne.requisitionId) {
      newErrors.requisitionId = 'Please select an RFQ';
    }
    if (!stepOne.vendorId) {
      newErrors.vendorId = 'Please select a vendor';
    }
    if (!stepOne.title.trim()) {
      newErrors.title = 'Deal title is required';
    }

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
    if (
      priceQuantity.targetUnitPrice &&
      priceQuantity.maxAcceptablePrice &&
      priceQuantity.maxAcceptablePrice < priceQuantity.targetUnitPrice
    ) {
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
    if (
      delivery.partialDelivery.allowed &&
      !delivery.partialDelivery.minValue
    ) {
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
    }
    if (
      contractSla.lateDeliveryPenaltyPerDay === null ||
      contractSla.lateDeliveryPenaltyPerDay === undefined
    ) {
      newErrors.lateDeliveryPenaltyPerDay = 'Late delivery penalty is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStepFour = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { totalWeight } = formData.stepFour;

    if (Math.abs(totalWeight - 100) > 0.01) {
      newErrors.stepFour = `Parameter weights must sum to 100%. Current total: ${Math.round(totalWeight)}%`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = (): boolean => {
    const allErrors: Record<string, string[]> = {};

    // Validate Step 1
    if (!formData.stepOne.requisitionId) {
      allErrors.step1_requisitionId = ['Please select an RFQ'];
    }
    if (!formData.stepOne.vendorId) {
      allErrors.step1_vendorId = ['Please select a vendor'];
    }
    if (!formData.stepOne.title.trim()) {
      allErrors.step1_title = ['Deal title is required'];
    }

    // Validate Step 2
    if (!formData.stepTwo.priceQuantity.targetUnitPrice) {
      allErrors.step2_targetPrice = ['Target unit price is required'];
    }
    if (!formData.stepTwo.priceQuantity.maxAcceptablePrice) {
      allErrors.step2_maxPrice = ['Maximum acceptable price is required'];
    }
    if (!formData.stepTwo.delivery.requiredDate) {
      allErrors.step2_deliveryDate = ['Required delivery date is required'];
    }

    // Validate Step 3
    if (!formData.stepThree.contractSla.warrantyPeriod) {
      allErrors.step3_warranty = ['Warranty period is required'];
    }

    setValidationErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    let isValid = true;

    switch (currentStep) {
      case 1:
        isValid = validateStepOne();
        break;
      case 2:
        isValid = validateStepTwo();
        break;
      case 3:
        isValid = validateStepThree();
        break;
      case 4:
        isValid = validateStepFour();
        break;
    }

    if (isValid) {
      saveDraftToSessionStorage();
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setErrors({});
      setCurrentStep(stepId);
    }
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
  };

  // Address modal handler (placeholder)
  const handleAddNewAddress = () => {
    // In a full implementation, this would open a modal
    alert('Address management will be implemented. For now, please select an existing address.');
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateAll()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Convert weights array to a Record<string, number> for the API
      const parameterWeights: Record<string, number> = {};
      formData.stepFour.weights.forEach((w) => {
        parameterWeights[w.parameterId] = w.weight;
      });

      const rfqId = formData.stepOne.requisitionId!;
      const vendorId = formData.stepOne.vendorId!;

      const createInput = {
        title: formData.stepOne.title,
        counterparty: vendors.find((v) => v.id === vendorId)?.name,
        mode: formData.stepOne.mode,
        priority: formData.stepOne.priority,
        priceQuantity: formData.stepTwo.priceQuantity,
        paymentTerms: formData.stepTwo.paymentTerms,
        delivery: formData.stepTwo.delivery,
        contractSla: formData.stepThree.contractSla,
        negotiationControl: formData.stepThree.negotiationControl,
        customParameters: formData.stepThree.customParameters,
        parameterWeights,
        // Include contractId if starting from existing contract (from VendorDetails "Start Negotiation")
        ...(urlContractId ? { contractId: parseInt(urlContractId, 10) } : {}),
      };

      const response = await chatbotService.createDealWithConfig(rfqId, vendorId, createInput);

      // Clear drafts on successful creation (both specific and temp)
      sessionStorage.removeItem(currentDraftKey);
      sessionStorage.removeItem(getDraftKey(null, null));

      // Check email status from response
      const emailStatus = (response.data as any).emailStatus;
      const dealId = response.data.id;

      if (emailStatus && !emailStatus.success) {
        // Email failed - show warning modal with retry option
        setEmailFailureError(emailStatus.error || 'Unknown error');
        setPendingDealNavigation({ rfqId, vendorId, dealId });
        setShowEmailFailedModal(true);
        setSubmitting(false);
      } else {
        // Email sent successfully (or no email status returned) - show toast and navigate
        toast.success('Deal created! Email notification sent to vendor', {
          duration: 4000,
          icon: '✉️',
        });
        navigate(`/chatbot/requisitions/${rfqId}/vendors/${vendorId}/deals/${dealId}`);
      }
    } catch (err: unknown) {
      console.error('Failed to create deal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create deal. Please try again.';
      setSubmitError(errorMessage);
      setSubmitting(false);
    }
  };

  // Clear draft
  const handleClearDraft = () => {
    if (confirm('Are you sure you want to clear your saved draft? This cannot be undone.')) {
      // Clear both specific and temp drafts from sessionStorage
      sessionStorage.removeItem(currentDraftKey);
      sessionStorage.removeItem(getDraftKey(null, null));
      setFormData(DEFAULT_WIZARD_FORM_DATA);
      setLastSaved(null);
      setCurrentStep(1);
    }
  };

  // Email failure modal handlers
  const handleContinueWithoutEmail = () => {
    if (pendingDealNavigation) {
      setShowEmailFailedModal(false);
      toast('Deal created, but email was not sent. You can resend later.', {
        icon: '⚠️',
        duration: 5000,
      });
      navigate(`/chatbot/requisitions/${pendingDealNavigation.rfqId}/vendors/${pendingDealNavigation.vendorId}/deals/${pendingDealNavigation.dealId}`);
    }
  };

  const handleRetryEmail = async () => {
    if (!pendingDealNavigation) return;

    setRetryingEmail(true);
    try {
      const { rfqId, vendorId, dealId } = pendingDealNavigation;
      const result = await chatbotService.retryDealEmail({ rfqId, vendorId, dealId });

      if (result.data.success) {
        toast.success('Email sent successfully!', { icon: '✉️', duration: 4000 });
        setShowEmailFailedModal(false);
        navigate(`/chatbot/requisitions/${rfqId}/vendors/${vendorId}/deals/${dealId}`);
      } else {
        setEmailFailureError(result.data.error || 'Failed to send email');
        toast.error('Email retry failed. You can try again or continue without email.');
      }
    } catch (err: unknown) {
      console.error('Email retry failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry email';
      setEmailFailureError(errorMessage);
      toast.error('Email retry failed. You can try again or continue without email.');
    } finally {
      setRetryingEmail(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
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
            lockedFields={isLockedMode}
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

  console.log('[NewDealPage] About to render JSX, currentStep:', currentStep);

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 pt-6 pb-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <button
                onClick={() => navigate(backButtonConfig.path)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                {backButtonConfig.label}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Deal</h1>
              <p className="text-gray-600 text-sm mt-1">
                Configure your negotiation parameters
              </p>
            </div>

            {/* Draft Status */}
            <div className="flex items-center gap-3">
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {draftSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={handleClearDraft}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Clear Draft
              </button>
            </div>
          </div>

          {/* Step Progress */}
          <StepProgress
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            allowNavigation={true}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {renderStepContent()}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error creating deal</h3>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={submitting}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(backButtonConfig.path)}
                disabled={submitting}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Deal...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Deal
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Failed Modal */}
      {showEmailFailedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-900">Email Notification Failed</h3>
              </div>
              <button
                onClick={handleContinueWithoutEmail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <p className="text-gray-700 mb-4">
                Your deal was created successfully, but we couldn't send the email notification to the vendor.
              </p>

              {emailFailureError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{emailFailureError}</p>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500">
                You can retry sending the email or continue to the deal page. The vendor will need to be notified manually if you choose to continue.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleContinueWithoutEmail}
                disabled={retryingEmail}
                className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Continue Anyway
              </button>
              <button
                onClick={handleRetryEmail}
                disabled={retryingEmail}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {retryingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Retry Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
