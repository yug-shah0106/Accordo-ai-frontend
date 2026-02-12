import React, { useEffect, useState } from 'react';
import { AlertCircle, FileText, Loader2, Lock } from 'lucide-react';
import type {
  DealWizardStepOne,
  NegotiationPriority,
  RequisitionSummary,
  VendorSummary,
} from '../../../types/chatbot';

interface StepOneProps {
  data: DealWizardStepOne;
  onChange: (data: DealWizardStepOne) => void;
  requisitions: RequisitionSummary[];
  vendors: VendorSummary[];
  loadingRequisitions: boolean;
  loadingVendors: boolean;
  onRequisitionChange: (rfqId: number | null) => void;
  errors?: Record<string, string>;
  lockedFields?: boolean;
}

/**
 * StepOne - Basic Information
 * Collects RFQ, Vendor, Title, Mode, and Priority
 */
const StepOne: React.FC<StepOneProps> = ({
  data,
  onChange,
  requisitions = [],
  vendors = [],
  loadingRequisitions,
  loadingVendors,
  onRequisitionChange,
  errors = {},
  lockedFields = false,
}) => {
  // Ensure arrays are always arrays (defensive coding)
  const safeRequisitions = Array.isArray(requisitions) ? requisitions : [];
  const safeVendors = Array.isArray(vendors) ? vendors : [];
  const [selectedRfq, setSelectedRfq] = useState<RequisitionSummary | null>(null);

  // Find selected RFQ when data changes
  useEffect(() => {
    if (data.requisitionId) {
      const rfq = safeRequisitions.find(r => r.id === data.requisitionId);
      setSelectedRfq(rfq || null);
    } else {
      setSelectedRfq(null);
    }
  }, [data.requisitionId, safeRequisitions]);

  const handleRequisitionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rfqId = e.target.value ? parseInt(e.target.value, 10) : null;
    const rfq = safeRequisitions.find(r => r.id === rfqId);

    // Update form data
    onChange({
      ...data,
      requisitionId: rfqId,
      vendorId: null, // Reset vendor when RFQ changes
      title: rfq?.title || data.title, // Auto-populate title from RFQ
    });

    // Trigger vendor loading
    onRequisitionChange(rfqId);
  };

  const handleVendorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorId = e.target.value ? parseInt(e.target.value, 10) : null;
    onChange({ ...data, vendorId });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const handlePriorityChange = (priority: NegotiationPriority) => {
    onChange({ ...data, priority });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* RFQ Selection */}
      <div>
        <label
          htmlFor="requisitionId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          RFQ / Requisition <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            id="requisitionId"
            name="requisitionId"
            value={data.requisitionId || ''}
            onChange={handleRequisitionSelect}
            disabled={loadingRequisitions || lockedFields}
            className={`
              w-full px-4 py-2.5 border rounded-lg appearance-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500
              ${lockedFields ? 'bg-gray-100 cursor-not-allowed' : ''}
              ${errors.requisitionId ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          >
            <option value="">Select an RFQ...</option>
            {safeRequisitions.map((rfq) => (
              <option key={rfq.id} value={rfq.id}>
                {rfq.rfqNumber} - {rfq.title} ({formatCurrency(rfq.estimatedValue)})
              </option>
            ))}
          </select>
          {loadingRequisitions && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.requisitionId && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.requisitionId}
          </p>
        )}

        {/* RFQ Details Card */}
        {selectedRfq && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-blue-900">{selectedRfq.title}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-blue-700">
                  <span>Project: {selectedRfq.projectName}</span>
                  <span>Value: {formatCurrency(selectedRfq.estimatedValue)}</span>
                  <span>Products: {selectedRfq.productCount}</span>
                  <span>Vendors: {selectedRfq.vendorCount}</span>
                </div>
                {selectedRfq.negotiationClosureDate && (
                  <p className="mt-1 text-blue-600">
                    Deadline: {new Date(selectedRfq.negotiationClosureDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Locked Fields Notice */}
        {lockedFields && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                RFQ and Vendor are pre-selected from Requisition Management and cannot be changed.
              </p>
            </div>
          </div>
        )}

        {/* Vendor-only Locked Notice (when only vendor is locked via URL param) */}
        {!lockedFields && data.vendorLocked && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Vendor is pre-selected and cannot be changed for this negotiation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Vendor Selection */}
      <div>
        <label
          htmlFor="vendorId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Vendor <span className="text-red-500">*</span>
          {(lockedFields || data.vendorLocked) && (
            <span className="ml-2 inline-flex items-center">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
            </span>
          )}
        </label>
        <div className="relative">
          <select
            id="vendorId"
            name="vendorId"
            value={data.vendorId || ''}
            onChange={handleVendorSelect}
            disabled={!data.requisitionId || loadingVendors || lockedFields || data.vendorLocked}
            className={`
              w-full px-4 py-2.5 border rounded-lg appearance-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500
              ${(lockedFields || data.vendorLocked) ? 'bg-gray-100 cursor-not-allowed' : ''}
              ${errors.vendorId ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
          >
            <option value="">
              {!data.requisitionId
                ? 'Select an RFQ first...'
                : loadingVendors
                  ? 'Loading vendors...'
                  : safeVendors.length === 0
                    ? 'No vendors attached to this RFQ'
                    : 'Select a vendor...'}
            </option>
            {safeVendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name} {vendor.companyName ? `(${vendor.companyName})` : ''}
                {vendor.pastDealsCount > 0 && ` - ${vendor.pastDealsCount} past deals`}
              </option>
            ))}
          </select>
          {loadingVendors && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.vendorId && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.vendorId}
          </p>
        )}

        {/* Vendor warning if no vendors */}
        {data.requisitionId && !loadingVendors && vendors.length === 0 && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                No vendors are attached to this RFQ. Please attach vendors to the requisition first.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Deal Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Deal Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={data.title}
          onChange={handleChange}
          placeholder="e.g., IT Equipment Procurement - Q1 2026"
          className={`
            w-full px-4 py-2.5 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'}
          `}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.title}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Auto-populated from RFQ title. You can customize it.
        </p>
      </div>

      {/* Negotiation Mode */}
      <div>
        <label
          htmlFor="mode"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Negotiation Mode <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            id="mode"
            name="mode"
            value={data.mode}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="INSIGHTS">INSIGHTS (Automated Negotiation)</option>
            <option value="CONVERSATION">CONVERSATION (AI-Assisted Chat)</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {data.mode === 'INSIGHTS'
            ? 'Automated decision engine with utility scoring and explainability'
            : 'Free-form AI-assisted conversation with vendor'}
        </p>
      </div>

      {/* Negotiation Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Negotiation Strategy <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {(['HIGH', 'MEDIUM', 'LOW'] as NegotiationPriority[]).map((priority) => (
            <button
              key={priority}
              type="button"
              onClick={() => handlePriorityChange(priority)}
              className={`
                flex-1 px-4 py-3 rounded-lg border-2 transition-all
                ${data.priority === priority
                  ? priority === 'HIGH'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : priority === 'MEDIUM'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }
              `}
            >
              <div className="text-center">
                <p className="font-medium">
                  {priority === 'HIGH' ? 'Maximize Savings' : priority === 'MEDIUM' ? 'Fair Deal' : 'Quick Close'}
                </p>
                <p className="text-xs mt-0.5 opacity-75">
                  {priority === 'HIGH'
                    ? 'Aggressive'
                    : priority === 'MEDIUM'
                      ? 'Balanced'
                      : 'Flexible'}
                </p>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {data.priority === 'HIGH'
            ? 'Maximize Savings: Aggressive negotiation focused on getting the best price. More negotiation rounds, stricter acceptance criteria.'
            : data.priority === 'MEDIUM'
              ? 'Fair Deal: Balanced approach where both parties achieve reasonable outcomes. Standard negotiation rounds.'
              : 'Quick Close: Flexible negotiation focused on faster resolution. Fewer rounds, more willing to accept good offers.'}
        </p>
      </div>
    </div>
  );
};

export default StepOne;
