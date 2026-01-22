import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, DollarSign, Truck, CreditCard, Info, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  DealWizardStepTwo,
  PaymentMethod,
  PartialDeliveryType,
  DeliveryAddress,
  SmartDefaults,
} from '../../../types/chatbot';

interface StepTwoProps {
  data: DealWizardStepTwo;
  onChange: (data: DealWizardStepTwo) => void;
  addresses: DeliveryAddress[];
  loadingAddresses?: boolean;
  smartDefaults: SmartDefaults | null;
  errors?: Record<string, string>;
  onAddNewAddress?: () => void;
  vendorId?: number | null; // Used to show empty state message when vendor is selected but has no addresses
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CREDIT', label: 'Credit' },
  { value: 'LC', label: 'Letter of Credit (LC)' },
];

// Quick date presets
const DATE_PRESETS = [
  { label: 'In 7 days', days: 7 },
  { label: 'In 2 weeks', days: 14 },
  { label: 'In 1 month', days: 30 },
  { label: 'In 3 months', days: 90 },
];

/**
 * Custom Blue Range Slider Component
 */
const BlueSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
}> = ({ value, onChange, min = 0, max = 50, label, unit = '%' }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          {/* Track background */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            {/* Filled track */}
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {/* Slider input (transparent, overlaid) */}
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {/* Thumb indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md pointer-events-none transition-all duration-150"
            style={{ left: `calc(${percentage}% - 10px)` }}
          />
        </div>
        {/* Value display */}
        <div className="w-20 text-center px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-lg font-semibold text-blue-700">
            {value}{unit}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Calendar Popup Component
 */
const CalendarPopup: React.FC<{
  value: string | null;
  onChange: (date: string | null) => void;
  minDate?: string;
  maxDate?: string;
  error?: string;
  label: string;
  required?: boolean;
  helpText?: string;
}> = ({ value, onChange, minDate, maxDate, error, label, required, helpText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDateForDisplay = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateForValue = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const addDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    onChange(formatDateForValue(date));
    setIsOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const isDateDisabled = (date: Date) => {
    const dateStr = formatDateForValue(date);
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!value) return false;
    return formatDateForValue(date) === value;
  };

  const isToday = (date: Date) => {
    return formatDateForValue(date) === formatDateForValue(today);
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const days = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-9" />);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const disabled = isDateDisabled(date);
    const selected = isDateSelected(date);
    const todayClass = isToday(date);

    days.push(
      <button
        key={day}
        type="button"
        disabled={disabled}
        onClick={() => {
          onChange(formatDateForValue(date));
          setIsOpen(false);
        }}
        className={`
          h-9 w-9 rounded-full text-sm font-medium transition-all
          ${disabled
            ? 'text-gray-300 cursor-not-allowed'
            : selected
              ? 'bg-blue-500 text-white'
              : todayClass
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'text-gray-700 hover:bg-gray-100'
          }
        `}
      >
        {day}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Input field */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-2 px-4 py-2.5 border rounded-lg text-left
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}
        `}
      >
        <Calendar className="w-4 h-4 text-gray-400" />
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? formatDateForDisplay(value) : 'Select a date...'}
        </span>
      </button>

      {/* Quick preset buttons */}
      <div className="flex flex-wrap gap-2 mt-2">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.days}
            type="button"
            onClick={() => addDays(preset.days)}
            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Calendar popup */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-lg w-72">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="h-9 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              className="w-full mt-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Clear date
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

/**
 * StepTwo - Commercial Parameters
 * Collects Price & Quantity, Payment Terms, and Delivery Parameters
 */
const StepTwo: React.FC<StepTwoProps> = ({
  data,
  onChange,
  addresses,
  smartDefaults,
  errors = {},
  onAddNewAddress,
  vendorId,
}) => {
  const updatePriceQuantity = (
    field: keyof typeof data.priceQuantity,
    value: number | null
  ) => {
    onChange({
      ...data,
      priceQuantity: { ...data.priceQuantity, [field]: value },
    });
  };

  const updatePaymentTerms = (
    field: keyof typeof data.paymentTerms,
    value: number | null | PaymentMethod[]
  ) => {
    onChange({
      ...data,
      paymentTerms: { ...data.paymentTerms, [field]: value },
    });
  };

  const updateDelivery = (
    field: keyof typeof data.delivery,
    value: string | number | null | typeof data.delivery.partialDelivery
  ) => {
    onChange({
      ...data,
      delivery: { ...data.delivery, [field]: value },
    });
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const currentMethods = data.paymentTerms.acceptedMethods;
    const isSelected = currentMethods.includes(method);
    const newMethods = isSelected
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    updatePaymentTerms('acceptedMethods', newMethods);
  };

  const handlePartialDeliveryToggle = (allowed: boolean) => {
    updateDelivery('partialDelivery', {
      allowed,
      type: allowed ? 'QUANTITY' : null,
      minValue: null,
    });
  };

  const handlePartialDeliveryTypeChange = (type: PartialDeliveryType) => {
    updateDelivery('partialDelivery', {
      ...data.delivery.partialDelivery,
      type,
      minValue: null,
    });
  };

  const handlePartialDeliveryValueChange = (value: number | null) => {
    updateDelivery('partialDelivery', {
      ...data.delivery.partialDelivery,
      minValue: value,
    });
  };

  const parseNumber = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };


  return (
    <div className="space-y-8">
      {/* Smart Defaults Info */}
      {smartDefaults && smartDefaults.confidence > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700">
              <p className="font-medium">Smart defaults applied</p>
              <p className="text-xs mt-0.5">
                Based on {smartDefaults.source === 'combined'
                  ? 'vendor history and similar deals'
                  : smartDefaults.source === 'vendor_history'
                    ? 'previous deals with this vendor'
                    : smartDefaults.source === 'similar_deals'
                      ? 'similar deals'
                      : 'industry standards'
                }
                {' '}({Math.round(smartDefaults.confidence * 100)}% confidence)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Price & Quantity Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Price & Quantity</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Unit Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Unit Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data.priceQuantity.targetUnitPrice ?? ''}
                onChange={(e) => updatePriceQuantity('targetUnitPrice', parseNumber(e.target.value))}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`
                  w-full pl-8 pr-4 py-2.5 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.targetUnitPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                `}
              />
            </div>
            {errors.targetUnitPrice && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.targetUnitPrice}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Ideal price you want to achieve</p>
          </div>

          {/* Maximum Acceptable Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Acceptable Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={data.priceQuantity.maxAcceptablePrice ?? ''}
                onChange={(e) => updatePriceQuantity('maxAcceptablePrice', parseNumber(e.target.value))}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`
                  w-full pl-8 pr-4 py-2.5 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.maxAcceptablePrice ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                `}
              />
            </div>
            {errors.maxAcceptablePrice && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.maxAcceptablePrice}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Walk-away price ceiling</p>
          </div>

          {/* Minimum Order Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Order Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={data.priceQuantity.minOrderQuantity ?? ''}
              onChange={(e) => updatePriceQuantity('minOrderQuantity', parseNumber(e.target.value))}
              placeholder="0"
              min="1"
              step="1"
              className={`
                w-full px-4 py-2.5 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                ${errors.minOrderQuantity ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
            />
            {errors.minOrderQuantity && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.minOrderQuantity}
              </p>
            )}
          </div>

          {/* Preferred Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Quantity
            </label>
            <input
              type="number"
              value={data.priceQuantity.preferredQuantity ?? ''}
              onChange={(e) => updatePriceQuantity('preferredQuantity', parseNumber(e.target.value))}
              placeholder="Optional"
              min="1"
              step="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="mt-1 text-xs text-gray-500">Ideal order quantity</p>
          </div>

          {/* Volume Discount Expectation - Teal Slider */}
          <div className="md:col-span-2">
            <BlueSlider
              label="Volume Discount Expectation"
              value={data.priceQuantity.volumeDiscountExpectation ?? 0}
              onChange={(value) => updatePriceQuantity('volumeDiscountExpectation', value)}
              min={0}
              max={50}
              unit="%"
            />
            <p className="mt-2 text-xs text-gray-500">Expected discount for bulk orders</p>
          </div>
        </div>
      </section>

      {/* Payment Terms Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment Terms</h3>
        </div>

        <div className="space-y-4">
          {/* Payment Days Range - Fixed with 'days' label outside */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Payment Days <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={data.paymentTerms.minDays ?? ''}
                  onChange={(e) => updatePaymentTerms('minDays', parseNumber(e.target.value))}
                  placeholder="30"
                  min="1"
                  step="1"
                  className={`
                    flex-1 px-4 py-2.5 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    ${errors.minPaymentDays ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                  `}
                />
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">days</span>
              </div>
              {errors.minPaymentDays && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.minPaymentDays}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Payment Days <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={data.paymentTerms.maxDays ?? ''}
                  onChange={(e) => updatePaymentTerms('maxDays', parseNumber(e.target.value))}
                  placeholder="60"
                  min="1"
                  step="1"
                  className={`
                    flex-1 px-4 py-2.5 border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    ${errors.maxPaymentDays ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                  `}
                />
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">days</span>
              </div>
              {errors.maxPaymentDays && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.maxPaymentDays}
                </p>
              )}
            </div>
          </div>

          {/* Advance Payment Limit - Teal Slider */}
          <div>
            <BlueSlider
              label="Advance Payment Limit"
              value={data.paymentTerms.advancePaymentLimit ?? 0}
              onChange={(value) => updatePaymentTerms('advancePaymentLimit', value)}
              min={0}
              max={50}
              unit="%"
            />
            <p className="mt-2 text-xs text-gray-500">Maximum upfront payment you're willing to make</p>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accepted Payment Methods
            </label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => togglePaymentMethod(method.value)}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                    ${data.paymentTerms.acceptedMethods.includes(method.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Parameters Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Delivery Parameters</h3>
        </div>

        <div className="space-y-4">
          {/* Delivery Dates - Calendar Popup with Quick Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CalendarPopup
              label="Required Delivery Date"
              required
              value={data.delivery.requiredDate}
              onChange={(date) => updateDelivery('requiredDate', date)}
              minDate={new Date().toISOString().split('T')[0]}
              error={errors.requiredDate}
              helpText="Must-have deadline"
            />

            <CalendarPopup
              label="Preferred Delivery Date"
              value={data.delivery.preferredDate}
              onChange={(date) => updateDelivery('preferredDate', date)}
              minDate={new Date().toISOString().split('T')[0]}
              maxDate={data.delivery.requiredDate || undefined}
              error={errors.preferredDate}
              helpText="Ideal delivery date (before required)"
            />
          </div>

          {/* Delivery Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <select
                value={data.delivery.locationId ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'new') {
                    onAddNewAddress?.();
                  } else {
                    // Store the string ID directly (e.g., "company-1", "project-5")
                    onChange({
                      ...data,
                      delivery: {
                        ...data.delivery,
                        locationId: value || null,
                        locationAddress: null,
                      },
                    });
                  }
                }}
                className={`
                  w-full pl-10 pr-4 py-2.5 border rounded-lg appearance-none
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${errors.locationId ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                `}
              >
                {!vendorId ? (
                  <option value="">Please select a vendor first...</option>
                ) : addresses.length === 0 ? (
                  <option value="">No delivery addresses found for this vendor</option>
                ) : (
                  <option value="">Select a delivery address...</option>
                )}
                {addresses.map((addr) => {
                  // Build a formatted location string with city/state if available
                  const locationParts = [addr.city, addr.state].filter(Boolean);
                  const locationStr = locationParts.length > 0 ? ` (${locationParts.join(', ')})` : '';
                  return (
                    <option key={addr.id} value={addr.id}>
                      {addr.name}{locationStr} - {addr.address}
                      {addr.isDefault && ' ★ Default'}
                    </option>
                  );
                })}
                <option value="new">+ Add New Address</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.locationId && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.locationId}
              </p>
            )}
          </div>

          {/* Partial Delivery */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Allow Partial Delivery
              </label>
              <button
                type="button"
                onClick={() => handlePartialDeliveryToggle(!data.delivery.partialDelivery.allowed)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${data.delivery.partialDelivery.allowed ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${data.delivery.partialDelivery.allowed ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {data.delivery.partialDelivery.allowed && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                {/* Partial Delivery Type */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePartialDeliveryTypeChange('QUANTITY')}
                    className={`
                      flex-1 px-3 py-2 rounded border text-sm font-medium transition-all
                      ${data.delivery.partialDelivery.type === 'QUANTITY'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    Minimum Quantity
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePartialDeliveryTypeChange('PERCENTAGE')}
                    className={`
                      flex-1 px-3 py-2 rounded border text-sm font-medium transition-all
                      ${data.delivery.partialDelivery.type === 'PERCENTAGE'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    Minimum Percentage
                  </button>
                </div>

                {/* Partial Delivery Value */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    {data.delivery.partialDelivery.type === 'PERCENTAGE'
                      ? 'Minimum percentage per shipment'
                      : 'Minimum quantity per shipment'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={data.delivery.partialDelivery.minValue ?? ''}
                      onChange={(e) => handlePartialDeliveryValueChange(parseNumber(e.target.value))}
                      placeholder={data.delivery.partialDelivery.type === 'PERCENTAGE' ? '25' : '100'}
                      min="1"
                      max={data.delivery.partialDelivery.type === 'PERCENTAGE' ? 100 : undefined}
                      className={`
                        w-full px-4 py-2 border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                        ${errors.partialDeliveryValue ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                      `}
                    />
                    {data.delivery.partialDelivery.type === 'PERCENTAGE' && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    )}
                  </div>
                  {errors.partialDeliveryValue && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.partialDeliveryValue}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StepTwo;
