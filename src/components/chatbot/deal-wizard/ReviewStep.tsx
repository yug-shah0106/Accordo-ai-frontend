import React from 'react';
import {
  FileText,
  Building2,
  DollarSign,
  CreditCard,
  Truck,
  Shield,
  Settings2,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
} from 'lucide-react';
import type {
  DealWizardFormData,
  RequisitionSummary,
  VendorSummary,
  DeliveryAddress,
} from '../../../types/chatbot';

interface ReviewStepProps {
  data: DealWizardFormData;
  requisitions: RequisitionSummary[];
  vendors: VendorSummary[];
  addresses: DeliveryAddress[];
  onEditStep: (step: number) => void;
  validationErrors?: Record<string, string[]>;
}

const WARRANTY_LABELS: Record<string, string> = {
  '0_MONTHS': '0 Months',
  '6_MONTHS': '6 Months',
  '1_YEAR': '1 Year',
  '2_YEARS': '2 Years',
  '3_YEARS': '3 Years',
  '5_YEARS': '5 Years',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  'BANK_TRANSFER': 'Bank Transfer',
  'CREDIT': 'Credit',
  'LC': 'Letter of Credit (LC)',
};

const FLEXIBILITY_LABELS: Record<string, string> = {
  'FIXED': 'Fixed',
  'FLEXIBLE': 'Flexible',
  'NICE_TO_HAVE': 'Nice to Have',
};

/**
 * ReviewStep - Summary of all wizard data before final submission
 * Shows all entered information organized by section with edit buttons
 */
const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  requisitions,
  vendors,
  addresses,
  onEditStep,
  validationErrors = {},
}) => {
  const selectedRfq = requisitions.find(r => r.id === data.stepOne.requisitionId);
  const selectedVendor = vendors.find(v => v.id === data.stepOne.vendorId);
  const selectedAddress = addresses.find(a => a.id === data.stepTwo.delivery.locationId);

  const formatCurrency = (value: number | null) => {
    if (value === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasStepErrors = (step: number): boolean => {
    const stepPrefix = `step${step}`;
    return Object.keys(validationErrors).some(key => key.startsWith(stepPrefix));
  };

  const SectionHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    step: number;
  }> = ({ icon, title, step }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {hasStepErrors(step) && (
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        )}
      </div>
      <button
        type="button"
        onClick={() => onEditStep(step)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
      >
        <Edit2 className="w-3.5 h-3.5" />
        Edit
      </button>
    </div>
  );

  const DataRow: React.FC<{
    label: string;
    value: React.ReactNode;
    highlight?: boolean;
  }> = ({ label, value, highlight = false }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${highlight ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
        {value || '—'}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Review Your Deal Configuration</h2>
            <p className="text-sm text-gray-600">
              Please review all the information below before creating your deal
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <SectionHeader
          icon={<Building2 className="w-5 h-5 text-gray-600" />}
          title="Basic Information"
          step={1}
        />

        <div className="space-y-1">
          <DataRow
            label="RFQ / Requisition"
            value={selectedRfq ? `${selectedRfq.rfqNumber} - ${selectedRfq.title}` : null}
            highlight
          />
          <DataRow
            label="Vendor"
            value={selectedVendor ? `${selectedVendor.name}${selectedVendor.companyName ? ` (${selectedVendor.companyName})` : ''}` : null}
            highlight
          />
          <DataRow label="Deal Title" value={data.stepOne.title} highlight />
          <DataRow
            label="Negotiation Mode"
            value={
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                data.stepOne.mode === 'INSIGHTS'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-cyan-100 text-cyan-700'
              }`}>
                {data.stepOne.mode === 'INSIGHTS' ? 'Automated (INSIGHTS)' : 'Conversational'}
              </span>
            }
          />
          <DataRow
            label="Priority"
            value={
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                data.stepOne.priority === 'HIGH'
                  ? 'bg-red-100 text-red-700'
                  : data.stepOne.priority === 'MEDIUM'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
              }`}>
                {data.stepOne.priority}
              </span>
            }
          />
        </div>
      </section>

      {/* Step 2: Commercial Parameters */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <SectionHeader
          icon={<DollarSign className="w-5 h-5 text-gray-600" />}
          title="Commercial Parameters"
          step={2}
        />

        {/* Price & Quantity */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <DollarSign className="w-4 h-4" /> Price & Quantity
          </h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-x-6">
              <DataRow
                label="Target Unit Price"
                value={formatCurrency(data.stepTwo.priceQuantity.targetUnitPrice)}
                highlight
              />
              <DataRow
                label="Max Acceptable Price"
                value={formatCurrency(data.stepTwo.priceQuantity.maxAcceptablePrice)}
              />
              <DataRow
                label="Min Order Quantity"
                value={data.stepTwo.priceQuantity.minOrderQuantity?.toLocaleString()}
              />
              <DataRow
                label="Preferred Quantity"
                value={data.stepTwo.priceQuantity.preferredQuantity?.toLocaleString()}
              />
              <DataRow
                label="Volume Discount"
                value={data.stepTwo.priceQuantity.volumeDiscountExpectation
                  ? `${data.stepTwo.priceQuantity.volumeDiscountExpectation}%`
                  : null}
              />
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <CreditCard className="w-4 h-4" /> Payment Terms
          </h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <DataRow
              label="Payment Days Range"
              value={`${data.stepTwo.paymentTerms.minDays} - ${data.stepTwo.paymentTerms.maxDays} days`}
            />
            <DataRow
              label="Advance Payment Limit"
              value={data.stepTwo.paymentTerms.advancePaymentLimit
                ? `${data.stepTwo.paymentTerms.advancePaymentLimit}%`
                : 'Not set'}
            />
            <DataRow
              label="Accepted Methods"
              value={
                data.stepTwo.paymentTerms.acceptedMethods.length > 0
                  ? data.stepTwo.paymentTerms.acceptedMethods
                      .map(m => PAYMENT_METHOD_LABELS[m])
                      .join(', ')
                  : 'Any'
              }
            />
          </div>
        </div>

        {/* Delivery */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Truck className="w-4 h-4" /> Delivery Parameters
          </h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <DataRow
              label="Required Delivery Date"
              value={formatDate(data.stepTwo.delivery.requiredDate)}
              highlight
            />
            <DataRow
              label="Preferred Delivery Date"
              value={formatDate(data.stepTwo.delivery.preferredDate)}
            />
            <DataRow
              label="Delivery Location"
              value={selectedAddress
                ? `${selectedAddress.name} - ${selectedAddress.city}, ${selectedAddress.state}`
                : data.stepTwo.delivery.locationAddress}
            />
            <DataRow
              label="Partial Delivery"
              value={
                data.stepTwo.delivery.partialDelivery.allowed
                  ? `Yes (Min ${data.stepTwo.delivery.partialDelivery.minValue || '—'} ${
                      data.stepTwo.delivery.partialDelivery.type === 'PERCENTAGE' ? '%' : 'units'
                    })`
                  : 'No'
              }
            />
          </div>
        </div>
      </section>

      {/* Step 3: Contract & Control */}
      <section className="bg-white rounded-lg border border-gray-200 p-5">
        <SectionHeader
          icon={<FileText className="w-5 h-5 text-gray-600" />}
          title="Contract & Control"
          step={3}
        />

        {/* Contract & SLA */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Shield className="w-4 h-4" /> Contract & SLA
          </h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <DataRow
              label="Warranty Period"
              value={
                data.stepThree.contractSla.warrantyPeriod === 'CUSTOM'
                  ? data.stepThree.contractSla.customWarrantyMonths !== null
                    ? `${data.stepThree.contractSla.customWarrantyMonths} month${data.stepThree.contractSla.customWarrantyMonths !== 1 ? 's' : ''}`
                    : '—'
                  : WARRANTY_LABELS[data.stepThree.contractSla.warrantyPeriod || ''] || '—'
              }
              highlight
            />
            <DataRow
              label="Defect Liability"
              value={data.stepThree.contractSla.defectLiabilityMonths
                ? `${data.stepThree.contractSla.defectLiabilityMonths} months`
                : null}
            />
            <DataRow
              label="Late Delivery Penalty"
              value={`${data.stepThree.contractSla.lateDeliveryPenaltyPerDay}% per day`}
              highlight
            />
            <DataRow
              label="Max Penalty Cap"
              value={
                data.stepThree.contractSla.maxPenaltyCap
                  ? data.stepThree.contractSla.maxPenaltyCap.type === 'PERCENTAGE'
                    ? `${data.stepThree.contractSla.maxPenaltyCap.value}%`
                    : formatCurrency(data.stepThree.contractSla.maxPenaltyCap.value)
                  : 'No cap'
              }
            />
            {data.stepThree.contractSla.qualityStandards.length > 0 && (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <span className="text-sm text-gray-500">Quality Standards:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.stepThree.contractSla.qualityStandards.map(cert => (
                    <span
                      key={cert}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Negotiation Control */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Settings2 className="w-4 h-4" /> Negotiation Control
          </h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <DataRow
              label="Deadline"
              value={formatDateTime(data.stepThree.negotiationControl.deadline)}
            />
            <DataRow
              label="Max Rounds"
              value={data.stepThree.negotiationControl.maxRounds}
            />
            <DataRow
              label="Walk-away Threshold"
              value={`${data.stepThree.negotiationControl.walkawayThreshold}% above target`}
            />
          </div>
        </div>

        {/* Custom Parameters */}
        {data.stepThree.customParameters.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Custom Parameters
            </h4>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {data.stepThree.customParameters.map(param => (
                <div
                  key={param.id}
                  className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-700">{param.name}</span>
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                      param.flexibility === 'FIXED'
                        ? 'bg-red-100 text-red-700'
                        : param.flexibility === 'FLEXIBLE'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {FLEXIBILITY_LABELS[param.flexibility]}
                    </span>
                    {param.includeInNegotiation && (
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        AI
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {param.type === 'BOOLEAN'
                      ? (param.targetValue ? 'Yes' : 'No')
                      : String(param.targetValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Step 4: Parameter Weights */}
      {data.stepFour && data.stepFour.weights && data.stepFour.weights.length > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 p-5">
          <SectionHeader
            icon={<Scale className="w-5 h-5 text-gray-600" />}
            title="Parameter Weights"
            step={4}
          />

          {/* AI Suggested Badge */}
          {data.stepFour.aiSuggested && (
            <div className="mb-4 flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm w-fit">
              <Sparkles className="w-4 h-4" />
              <span>AI Suggested Weights</span>
            </div>
          )}

          {/* Weight Summary */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Weight:</span>
              <span className={`text-sm font-semibold ${
                Math.abs(data.stepFour.totalWeight - 100) < 0.01
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {Math.round(data.stepFour.totalWeight)}%
              </span>
            </div>
          </div>

          {/* Weight List */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4">
              {data.stepFour.weights
                .filter(w => w.weight > 0)
                .sort((a, b) => b.weight - a.weight)
                .map(weight => (
                  <div
                    key={weight.parameterId}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: weight.color || '#3B82F6' }}
                      />
                      <span className="text-sm text-gray-700">{weight.parameterName}</span>
                    </div>
                    <span
                      className="text-sm font-medium px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${weight.color || '#3B82F6'}20`,
                        color: weight.color || '#3B82F6',
                      }}
                    >
                      {weight.weight}%
                    </span>
                  </div>
                ))}
            </div>
            {data.stepFour.weights.filter(w => w.weight === 0).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-400">
                  {data.stepFour.weights.filter(w => w.weight === 0).length} parameters with 0% weight (ignored in negotiation)
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Validation Warnings */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">Please fix the following issues:</h4>
              <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                {Object.entries(validationErrors).map(([field, errors]) =>
                  errors.map((error, idx) => (
                    <li key={`${field}-${idx}`}>{error}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewStep;
