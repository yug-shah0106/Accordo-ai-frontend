import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../Button';
import useFetchData from '../../hooks/useFetchData';
import chatbotService from '../../services/chatbot.service';
import DealWizardModal from './DealWizardModal';
import type { DealWizardFormData, VendorDealSummary } from '../../types';

interface Contract {
  id: string;
  vendorId: string;
  uniqueToken: string;
  status?: string;
  createdAt?: string;
  chatbotDealId?: string | null;
  previousContractId?: string | null;
}

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
  Contract?: Contract[];
  status?: string;
}

interface Vendor {
  id: string;
  vendorId: string;
  Vendor?: {
    name: string;
    companyName?: string;
    email?: string;
  };
}

interface StartDealsProps {
  currentStep: number;
  prevStep: () => void;
  requisitionId: string;
  requisition: Requisition | null;
}

interface DealResult {
  vendorId: string;
  vendorName: string;
  status: 'fulfilled' | 'rejected';
  error?: string;
}

const StartDeals: React.FC<StartDealsProps> = ({
  currentStep,
  prevStep,
  requisitionId,
  requisition,
}) => {
  const navigate = useNavigate();

  // State
  const [deals, setDeals] = useState<VendorDealSummary[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [results, setResults] = useState<DealResult[] | null>(null);

  // Fetch deals
  const fetchDeals = useCallback(async () => {
    if (!requisitionId) return;
    setLoadingDeals(true);
    try {
      const response = await chatbotService.getRequisitionDeals(parseInt(requisitionId));
      setDeals(response.data?.deals || []);
    } catch {
      setDeals([]);
    } finally {
      setLoadingDeals(false);
    }
  }, [requisitionId]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Fetch vendor list
  const { data: vendorList } = useFetchData<Vendor>('/vendor/get-all');
  const contractData = requisition?.Contract || [];

  // Compute pending contracts (no deal linked)
  const pendingContracts = useMemo(() => {
    return contractData.filter(contract => !contract.chatbotDealId);
  }, [contractData]);

  // Build pending vendor info
  // Note: contract.vendorId may be a number at runtime despite string type,
  // so coerce to string for consistent comparison throughout
  const pendingVendors = useMemo(() => {
    return pendingContracts.map(contract => {
      const vendorIdStr = String(contract.vendorId);
      const matched = vendorList?.find(
        v => String(v?.vendorId) === vendorIdStr
      );
      return {
        vendorId: vendorIdStr,
        contractId: String(contract.id),
        vendorName: matched?.Vendor?.name || matched?.Vendor?.companyName || 'Unknown Vendor',
        email: matched?.Vendor?.email,
      };
    });
  }, [pendingContracts, vendorList]);

  // Selection handlers
  const toggleVendor = (vendorId: string) => {
    setSelectedVendorIds(prev =>
      prev.includes(vendorId) ? prev.filter(id => id !== vendorId) : [...prev, vendorId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVendorIds.length === pendingVendors.length) {
      setSelectedVendorIds([]);
    } else {
      setSelectedVendorIds(pendingVendors.map(v => v.vendorId));
    }
  };

  // Open modal
  const handleConfigureDeals = () => {
    if (selectedVendorIds.length === 0) {
      toast.error('Select at least one vendor');
      return;
    }
    setIsModalOpen(true);
  };

  // Create deals in parallel
  const handleCreateDeals = async (formData: DealWizardFormData) => {
    setIsModalOpen(false);
    setCreating(true);
    setResults(null);

    // Sanitize form data (same as NewDealPage handleSubmit)
    const parameterWeights: Record<string, number> = {};
    formData.stepFour.weights.forEach(w => {
      parameterWeights[w.parameterId] = w.weight;
    });

    const sanitizedDelivery = {
      ...formData.stepTwo.delivery,
      requiredDate: formData.stepTwo.delivery.requiredDate || null,
      preferredDate: formData.stepTwo.delivery.preferredDate || null,
    };

    const sanitizedNegotiationControl: { deadline: string | null } = {
      deadline: formData.stepThree.negotiationControl.deadline || null,
    };

    const penaltyPerDay = formData.stepThree.contractSla.lateDeliveryPenaltyPerDay;
    const sanitizedContractSla = {
      ...formData.stepThree.contractSla,
      lateDeliveryPenaltyPerDay: penaltyPerDay !== null && penaltyPerDay !== undefined
        ? Math.min(2, Math.max(0.5, penaltyPerDay))
        : 1,
      maxPenaltyCap: formData.stepThree.contractSla.maxPenaltyCap?.type
        ? formData.stepThree.contractSla.maxPenaltyCap
        : null,
    };

    const sanitizedPriceQuantity = {
      ...formData.stepTwo.priceQuantity,
      targetUnitPrice: formData.stepTwo.priceQuantity.targetUnitPrice ?? 0,
      maxAcceptablePrice: formData.stepTwo.priceQuantity.maxAcceptablePrice ?? 0,
      minOrderQuantity: formData.stepTwo.priceQuantity.minOrderQuantity ?? 0,
    };

    const rfqId = parseInt(requisitionId);

    // Create deals in parallel for each selected vendor
    const promises = selectedVendorIds.map(vendorId => {
      const pending = pendingVendors.find(v => v.vendorId === vendorId);
      const vendor = vendorList?.find(v => v?.vendorId?.toString() === vendorId);

      const createInput = {
        title: formData.stepOne.title,
        counterparty: pending?.vendorName || vendor?.Vendor?.name,
        mode: formData.stepOne.mode,
        priority: formData.stepOne.priority,
        priceQuantity: sanitizedPriceQuantity,
        paymentTerms: formData.stepTwo.paymentTerms,
        delivery: sanitizedDelivery,
        contractSla: sanitizedContractSla,
        negotiationControl: sanitizedNegotiationControl,
        customParameters: formData.stepThree.customParameters,
        parameterWeights,
        ...(pending?.contractId ? { contractId: parseInt(pending.contractId, 10) } : {}),
      };

      return chatbotService
        .createDealWithConfig(rfqId, parseInt(vendorId), createInput)
        .then(() => ({
          vendorId,
          vendorName: pending?.vendorName || 'Vendor',
          status: 'fulfilled' as const,
        }))
        .catch((err: any) => ({
          vendorId,
          vendorName: pending?.vendorName || 'Vendor',
          status: 'rejected' as const,
          error: err?.response?.data?.message || err?.message || 'Unknown error',
        }));
    });

    const allResults = await Promise.allSettled(promises);

    const dealResults: DealResult[] = allResults.map(r =>
      r.status === 'fulfilled' ? r.value : { vendorId: '', vendorName: 'Unknown', status: 'rejected' as const, error: 'Promise rejected' }
    );

    setResults(dealResults);
    setCreating(false);

    const succeeded = dealResults.filter(r => r.status === 'fulfilled').length;
    const failed = dealResults.filter(r => r.status === 'rejected').length;

    if (succeeded > 0 && failed === 0) {
      toast.success(`All ${succeeded} deals created successfully!`);
    } else if (succeeded > 0) {
      toast(`${succeeded} deals created, ${failed} failed`, { icon: '⚠️' });
    } else {
      toast.error(`All ${failed} deals failed to create`);
    }

    // Refresh deals list
    fetchDeals();
  };

  // Retry failed vendors
  const handleRetryFailed = () => {
    if (!results) return;
    const failedIds = results.filter(r => r.status === 'rejected').map(r => r.vendorId);
    setSelectedVendorIds(failedIds);
    setResults(null);
    setIsModalOpen(true);
  };

  const handleFinish = () => {
    navigate('/requisition-management');
  };

  const succeededCount = results?.filter(r => r.status === 'fulfilled').length ?? 0;
  const failedCount = results?.filter(r => r.status === 'rejected').length ?? 0;

  return (
    <div className="border-2 rounded p-4 w-full max-w-full overflow-hidden">
      <h3 className="text-lg font-semibold">Start Deals</h3>
      <p className="font-normal text-[#46403E] py-2 text-sm">
        Select vendors and configure negotiation deals in batch
      </p>

      {/* Loading state */}
      {loadingDeals && (
        <div className="flex items-center gap-2 py-8 justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading vendor data...</span>
        </div>
      )}

      {/* No pending vendors */}
      {!loadingDeals && pendingVendors.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center my-4">
          <p className="text-gray-600 text-sm">
            {deals.length > 0
              ? 'All vendors already have active deals. You can finish or go back to add more vendors.'
              : 'No vendors have been added yet. Go back to Step 3 to add vendors first.'}
          </p>
        </div>
      )}

      {/* Vendor selection */}
      {!loadingDeals && pendingVendors.length > 0 && !results && (
        <div className="mt-4">
          {/* Select All */}
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedVendorIds.length === pendingVendors.length && pendingVendors.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({pendingVendors.length} pending vendor{pendingVendors.length !== 1 ? 's' : ''})
              </span>
            </label>
            {selectedVendorIds.length > 0 && (
              <span className="text-xs text-blue-600 font-medium">
                {selectedVendorIds.length} selected
              </span>
            )}
          </div>

          {/* Vendor checkboxes */}
          <ul className="space-y-2">
            {pendingVendors.map(vendor => (
              <li
                key={vendor.vendorId}
                className={`px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedVendorIds.includes(vendor.vendorId)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => toggleVendor(vendor.vendorId)}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVendorIds.includes(vendor.vendorId)}
                    onChange={() => toggleVendor(vendor.vendorId)}
                    onClick={e => e.stopPropagation()}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900 text-sm">{vendor.vendorName}</span>
                    {vendor.email && (
                      <span className="text-xs text-gray-500 ml-2">{vendor.email}</span>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                    Pending
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {/* Configure button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleConfigureDeals}
              disabled={selectedVendorIds.length === 0 || creating}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiPlay className="w-4 h-4" />
              Configure & Start Deals ({selectedVendorIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Creating state */}
      {creating && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">
            Creating deals for {selectedVendorIds.length} vendor{selectedVendorIds.length !== 1 ? 's' : ''}...
          </p>
        </div>
      )}

      {/* Results summary */}
      {results && !creating && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Results</h4>

          {/* Summary bar */}
          {succeededCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">{succeededCount} deal{succeededCount !== 1 ? 's' : ''} created successfully</span>
            </div>
          )}
          {failedCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2">
              <FiX className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{failedCount} deal{failedCount !== 1 ? 's' : ''} failed</span>
            </div>
          )}

          {/* Per-vendor results */}
          <ul className="space-y-1">
            {results.map(result => (
              <li
                key={result.vendorId}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  result.status === 'fulfilled'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {result.status === 'fulfilled' ? (
                  <FiCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <FiX className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span className="font-medium">{result.vendorName}</span>
                {result.error && (
                  <span className="text-xs text-red-600 ml-auto truncate max-w-[200px]" title={result.error}>
                    {result.error}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Retry failed */}
          {failedCount > 0 && (
            <button
              type="button"
              onClick={handleRetryFailed}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Retry {failedCount} failed vendor{failedCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Footer navigation */}
      <div className="mt-4 flex justify-start gap-3">
        <Button
          className="px-3 py-2 bg-[white] text-[black] border rounded !w-fit text-sm"
          onClick={() => prevStep()}
          type="button"
          disabled={creating || currentStep === 1}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={handleFinish}
          disabled={creating || (results !== null && succeededCount === 0 && pendingVendors.length > 0)}
          className="px-3 py-2 bg-blue-500 text-white rounded !w-fit text-sm"
        >
          Finish
        </Button>
      </div>

      {/* Deal Wizard Modal */}
      <DealWizardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDeals}
        requisitionId={parseInt(requisitionId)}
        requisition={requisition}
        selectedVendorIds={selectedVendorIds}
      />
    </div>
  );
};

export default StartDeals;
