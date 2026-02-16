import React, { useState, useRef, useEffect } from 'react';
import {
  AlertCircle,
  FileText,
  Settings2,
  Plus,
  Trash2,
  Calendar,
  Shield,
  Clock,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type {
  DealWizardStepThree,
  WarrantyPeriod,
  PenaltyCapType,
  CustomParameter,
  CustomParameterType,
  ParameterFlexibility,
  QualityCertification,
} from '../../../types/chatbot';

interface StepThreeProps {
  data: DealWizardStepThree;
  onChange: (data: DealWizardStepThree) => void;
  certifications: QualityCertification[];
  loadingCertifications?: boolean;
  errors?: Record<string, string>;
}

const WARRANTY_OPTIONS_LIST: { value: WarrantyPeriod; label: string; months: number }[] = [
  { value: '0_MONTHS', label: '0 Months', months: 0 },
  { value: '6_MONTHS', label: '6 Months', months: 6 },
  { value: '1_YEAR', label: '1 Year', months: 12 },
  { value: '2_YEARS', label: '2 Years', months: 24 },
  { value: '3_YEARS', label: '3 Years', months: 36 },
  { value: '5_YEARS', label: '5 Years', months: 60 },
];

const PARAMETER_TYPES: { value: CustomParameterType; label: string }[] = [
  { value: 'BOOLEAN', label: 'Yes/No' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'TEXT', label: 'Text' },
  { value: 'DATE', label: 'Date' },
];

const FLEXIBILITY_OPTIONS: { value: ParameterFlexibility; label: string; description: string }[] = [
  { value: 'FIXED', label: 'Fixed', description: 'Must be exactly as specified' },
  { value: 'FLEXIBLE', label: 'Flexible', description: 'Preferred but negotiable' },
  { value: 'NICE_TO_HAVE', label: 'Nice to Have', description: 'Optional, good if achieved' },
];

// Quick date presets for deadline
const DATE_PRESETS = [
  { label: 'In 3 days', days: 3 },
  { label: 'In 1 week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
  { label: 'In 1 month', days: 30 },
];

/**
 * Custom Blue Range Slider Component (matches StepTwo styling)
 */
const BlueSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  helpText?: string;
}> = ({ value, onChange, min = 0, max = 100, step = 1, label, unit = '', helpText }) => {
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
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
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
      {helpText && (
        <p className="mt-2 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

/**
 * DateTime Picker Popup Component (Calendar + Time Selection)
 */
const DateTimePickerPopup: React.FC<{
  value: string | null;
  onChange: (datetime: string | null) => void;
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
}> = ({ value, onChange, label, required, helpText, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value into date and time parts
  const parseValue = () => {
    if (!value) return { date: null, hour: 12, minute: 0, period: 'PM' as const };
    const dt = new Date(value);
    let hour = dt.getHours();
    const period = hour >= 12 ? 'PM' as const : 'AM' as const;
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return {
      date: value.split('T')[0],
      hour,
      minute: dt.getMinutes(),
      period,
    };
  };

  const { date: selectedDate, hour, minute, period } = parseValue();

  // Close when clicking outside
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

  const formatDateForDisplay = (datetime: string | null) => {
    if (!datetime) return '';
    const dt = new Date(datetime);
    const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr} at ${timeStr}`;
  };

  const formatDateForValue = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const buildDateTime = (dateStr: string, h: number, m: number, p: 'AM' | 'PM') => {
    let hour24 = h;
    if (p === 'PM' && h !== 12) hour24 = h + 12;
    if (p === 'AM' && h === 12) hour24 = 0;
    // Create a proper ISO date string that Joi.isoDate() expects
    const date = new Date(dateStr);
    date.setHours(hour24, m, 0, 0);
    return date.toISOString();
  };

  const handleDateSelect = (dateStr: string) => {
    onChange(buildDateTime(dateStr, hour, minute, period));
  };

  const handleTimeChange = (h: number, m: number, p: 'AM' | 'PM') => {
    if (selectedDate) {
      onChange(buildDateTime(selectedDate, h, m, p));
    }
  };

  const addDays = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const dateStr = formatDateForValue(date);
    onChange(buildDateTime(dateStr, hour, minute, period));
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
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return formatDateForValue(date) === selectedDate;
  };

  const isToday = (date: Date) => {
    return formatDateForValue(date) === formatDateForValue(today);
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const days = [];

  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-9" />);
  }

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
        onClick={() => handleDateSelect(formatDateForValue(date))}
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
        <Clock className="w-4 h-4 inline mr-1" />
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
          {value ? formatDateForDisplay(value) : 'Select date and time...'}
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

      {/* Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-lg w-80">
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
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="h-9 flex items-center justify-center text-xs font-medium text-gray-500">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>

          {/* Time Picker Section */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Time
            </label>
            <div className="flex items-center gap-2">
              {/* Hour */}
              <select
                value={hour}
                onChange={(e) => handleTimeChange(parseInt(e.target.value), minute, period)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-gray-500 font-medium">:</span>
              {/* Minute */}
              <select
                value={minute}
                onChange={(e) => handleTimeChange(hour, parseInt(e.target.value), period)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
              >
                {[0, 15, 30, 45].map((m) => (
                  <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                ))}
              </select>
              {/* AM/PM */}
              <div className="flex">
                <button
                  type="button"
                  onClick={() => handleTimeChange(hour, minute, 'AM')}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-l-lg border transition-colors
                    ${period === 'AM'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeChange(hour, minute, 'PM')}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r transition-colors
                    ${period === 'PM'
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  PM
                </button>
              </div>
            </div>
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
              Clear
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
 * StepThree - Contract & Control Parameters
 * Collects Contract & SLA, Negotiation Control, and Custom Parameters
 */
const StepThree: React.FC<StepThreeProps> = ({
  data,
  onChange,
  certifications,
  errors = {},
}) => {
  const [showAddParameter, setShowAddParameter] = useState(false);
  const [certSearchTerm, setCertSearchTerm] = useState('');
  const [showCertDropdown, setShowCertDropdown] = useState(false);
  const [customWarrantyUnit, setCustomWarrantyUnit] = useState<'months' | 'years'>('months');
  const [newParameter, setNewParameter] = useState<Partial<CustomParameter>>({
    name: '',
    type: 'BOOLEAN',
    targetValue: false,
    flexibility: 'FLEXIBLE',
    includeInNegotiation: true,
  });

  const updateContractSla = (
    field: keyof typeof data.contractSla,
    value: WarrantyPeriod | number | null | typeof data.contractSla.maxPenaltyCap | string[]
  ) => {
    onChange({
      ...data,
      contractSla: { ...data.contractSla, [field]: value },
    });
  };

  const updateNegotiationControl = (
    field: keyof typeof data.negotiationControl,
    value: string | number | null
  ) => {
    onChange({
      ...data,
      negotiationControl: { ...data.negotiationControl, [field]: value },
    });
  };

  const parseNumber = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  // Handle penalty cap toggle and type change
  const handlePenaltyCapToggle = (enabled: boolean) => {
    if (enabled) {
      updateContractSla('maxPenaltyCap', { type: 'PERCENTAGE', value: null });
    } else {
      updateContractSla('maxPenaltyCap', null);
    }
  };

  const handlePenaltyCapTypeChange = (type: PenaltyCapType) => {
    updateContractSla('maxPenaltyCap', {
      type,
      value: data.contractSla.maxPenaltyCap?.value ?? null,
    });
  };

  const handlePenaltyCapValueChange = (value: number | null) => {
    if (data.contractSla.maxPenaltyCap) {
      updateContractSla('maxPenaltyCap', {
        ...data.contractSla.maxPenaltyCap,
        value,
      });
    }
  };

  // Quality standards management
  const addCertification = (certName: string) => {
    const current = data.contractSla.qualityStandards;
    if (!current.includes(certName)) {
      updateContractSla('qualityStandards', [...current, certName]);
    }
    setCertSearchTerm('');
    setShowCertDropdown(false);
  };

  const removeCertification = (certName: string) => {
    updateContractSla(
      'qualityStandards',
      data.contractSla.qualityStandards.filter(c => c !== certName)
    );
  };

  const filteredCertifications = certifications.filter(
    cert =>
      cert.name.toLowerCase().includes(certSearchTerm.toLowerCase()) &&
      !data.contractSla.qualityStandards.includes(cert.name)
  );

  // Custom parameters management
  const addCustomParameter = () => {
    if (newParameter.name?.trim()) {
      const param: CustomParameter = {
        id: `param_${Date.now()}`,
        name: newParameter.name.trim(),
        type: newParameter.type || 'BOOLEAN',
        targetValue: newParameter.targetValue ?? false,
        flexibility: newParameter.flexibility || 'FLEXIBLE',
        includeInNegotiation: newParameter.includeInNegotiation ?? true,
      };

      onChange({
        ...data,
        customParameters: [...data.customParameters, param],
      });

      setNewParameter({
        name: '',
        type: 'BOOLEAN',
        targetValue: false,
        flexibility: 'FLEXIBLE',
        includeInNegotiation: true,
      });
      setShowAddParameter(false);
    }
  };

  const removeCustomParameter = (paramId: string) => {
    onChange({
      ...data,
      customParameters: data.customParameters.filter(p => p.id !== paramId),
    });
  };

  const updateCustomParameter = (paramId: string, field: keyof CustomParameter, value: unknown) => {
    onChange({
      ...data,
      customParameters: data.customParameters.map(p =>
        p.id === paramId ? { ...p, [field]: value } : p
      ),
    });
  };

  const renderTargetValueInput = (param: Partial<CustomParameter>, isNew: boolean = false) => {
    const handleChange = (value: boolean | number | string) => {
      if (isNew) {
        setNewParameter({ ...newParameter, targetValue: value });
      } else if (param.id) {
        updateCustomParameter(param.id, 'targetValue', value);
      }
    };

    switch (param.type) {
      case 'BOOLEAN':
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleChange(true)}
              className={`
                flex-1 px-3 py-2 rounded border text-sm font-medium transition-all
                ${param.targetValue === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }
              `}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleChange(false)}
              className={`
                flex-1 px-3 py-2 rounded border text-sm font-medium transition-all
                ${param.targetValue === false
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }
              `}
            >
              No
            </button>
          </div>
        );
      case 'NUMBER':
        return (
          <input
            type="number"
            value={typeof param.targetValue === 'number' ? param.targetValue : ''}
            onChange={(e) => handleChange(parseNumber(e.target.value) ?? 0)}
            placeholder="Enter number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'TEXT':
        return (
          <input
            type="text"
            value={typeof param.targetValue === 'string' ? param.targetValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Enter text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'DATE':
        return (
          <input
            type="date"
            value={typeof param.targetValue === 'string' ? param.targetValue : ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Contract & SLA Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Contract & SLA</h3>
        </div>

        <div className="space-y-4">
          {/* Warranty Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warranty Period <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {WARRANTY_OPTIONS_LIST.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange({
                      ...data,
                      contractSla: {
                        ...data.contractSla,
                        warrantyPeriod: option.value,
                        customWarrantyMonths: null,
                      },
                    });
                  }}
                  className={`
                    flex-1 py-2 rounded-lg border-2 transition-all text-sm font-medium whitespace-nowrap text-center
                    ${data.contractSla.warrantyPeriod === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  <Shield className="w-4 h-4 mx-auto mb-1" />
                  {option.label}
                </button>
              ))}
              {/* Other / Custom option */}
              <button
                type="button"
                onClick={() => {
                  onChange({
                    ...data,
                    contractSla: {
                      ...data.contractSla,
                      warrantyPeriod: 'CUSTOM',
                      customWarrantyMonths: data.contractSla.customWarrantyMonths ?? null,
                    },
                  });
                }}
                className={`
                  flex-1 py-2 rounded-lg border-2 transition-all text-sm font-medium whitespace-nowrap text-center
                  ${data.contractSla.warrantyPeriod === 'CUSTOM'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                <Settings2 className="w-4 h-4 mx-auto mb-1" />
                Other
              </button>
            </div>

            {/* Custom warranty input (shown when "Other" is selected) */}
            {data.contractSla.warrantyPeriod === 'CUSTOM' && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Enter custom warranty period (max 120 months / 10 years)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={
                      data.contractSla.customWarrantyMonths !== null
                        ? customWarrantyUnit === 'years'
                          ? data.contractSla.customWarrantyMonths / 12
                          : data.contractSla.customWarrantyMonths
                        : ''
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (!raw || raw.trim() === '') {
                        onChange({
                          ...data,
                          contractSla: { ...data.contractSla, customWarrantyMonths: null },
                        });
                        return;
                      }
                      const parsed = parseFloat(raw);
                      if (isNaN(parsed)) return;
                      const months = customWarrantyUnit === 'years'
                        ? Math.round(parsed * 12)
                        : Math.round(parsed);
                      const clamped = Math.max(0, Math.min(120, months));
                      onChange({
                        ...data,
                        contractSla: { ...data.contractSla, customWarrantyMonths: clamped },
                      });
                    }}
                    placeholder={customWarrantyUnit === 'years' ? 'e.g., 4' : 'e.g., 18'}
                    min="0"
                    max={customWarrantyUnit === 'years' ? '10' : '120'}
                    step={customWarrantyUnit === 'years' ? '0.5' : '1'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <select
                    value={customWarrantyUnit}
                    onChange={(e) => setCustomWarrantyUnit(e.target.value as 'months' | 'years')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                  >
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
                {data.contractSla.customWarrantyMonths !== null && (
                  <p className="mt-1.5 text-xs text-gray-500">
                    = {data.contractSla.customWarrantyMonths} month{data.contractSla.customWarrantyMonths !== 1 ? 's' : ''}
                    {data.contractSla.customWarrantyMonths >= 12 && (
                      <> ({(data.contractSla.customWarrantyMonths / 12).toFixed(1).replace(/\.0$/, '')} year{data.contractSla.customWarrantyMonths >= 24 ? 's' : ''})</>
                    )}
                  </p>
                )}
              </div>
            )}

            {errors.warrantyPeriod && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.warrantyPeriod}
              </p>
            )}
          </div>

          {/* Defect Liability Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Defect Liability Period
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={data.contractSla.defectLiabilityMonths ?? ''}
                onChange={(e) => updateContractSla('defectLiabilityMonths', parseNumber(e.target.value))}
                placeholder="e.g., 12"
                min="1"
                step="1"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">months</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Period during which vendor is liable for defects</p>
          </div>

          {/* Late Delivery Penalty */}
          <div>
            <BlueSlider
              label="Late Delivery Penalty *"
              value={data.contractSla.lateDeliveryPenaltyPerDay ?? 1}
              onChange={(value) => updateContractSla('lateDeliveryPenaltyPerDay', value)}
              min={0.5}
              max={2}
              step={0.1}
              unit="%"
              helpText="Penalty percentage per day of late delivery"
            />
            {errors.lateDeliveryPenaltyPerDay && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.lateDeliveryPenaltyPerDay}
              </p>
            )}
          </div>

          {/* Maximum Penalty Cap */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Maximum Penalty Cap
              </label>
              <button
                type="button"
                onClick={() => handlePenaltyCapToggle(!data.contractSla.maxPenaltyCap)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${data.contractSla.maxPenaltyCap ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${data.contractSla.maxPenaltyCap ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {data.contractSla.maxPenaltyCap && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                {/* Cap Type Selection */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePenaltyCapTypeChange('PERCENTAGE')}
                    className={`
                      flex-1 px-3 py-2 rounded border text-sm font-medium transition-all
                      ${data.contractSla.maxPenaltyCap.type === 'PERCENTAGE'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePenaltyCapTypeChange('FIXED')}
                    className={`
                      flex-1 px-3 py-2 rounded border text-sm font-medium transition-all
                      ${data.contractSla.maxPenaltyCap.type === 'FIXED'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    Fixed Amount
                  </button>
                </div>

                {/* Cap Value Input */}
                <div className="flex items-center gap-2">
                  {data.contractSla.maxPenaltyCap.type === 'FIXED' && (
                    <span className="text-sm font-medium text-gray-600">$</span>
                  )}
                  <input
                    type="number"
                    value={data.contractSla.maxPenaltyCap.value ?? ''}
                    onChange={(e) => handlePenaltyCapValueChange(parseNumber(e.target.value))}
                    placeholder={data.contractSla.maxPenaltyCap.type === 'PERCENTAGE' ? '10' : '5000'}
                    min="0"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {data.contractSla.maxPenaltyCap.type === 'PERCENTAGE' && (
                    <span className="text-sm font-medium text-gray-600">%</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {data.contractSla.maxPenaltyCap.type === 'PERCENTAGE'
                    ? 'Maximum penalty as percentage of deal value'
                    : 'Maximum penalty as fixed dollar amount'}
                </p>
              </div>
            )}
          </div>

          {/* Quality Standards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="w-4 h-4 inline mr-1" />
              Quality Standards & Certifications
            </label>

            {/* Selected Certifications */}
            {data.contractSla.qualityStandards.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {data.contractSla.qualityStandards.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="p-0.5 hover:bg-blue-100 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Certification Search */}
            <div className="relative">
              <input
                type="text"
                value={certSearchTerm}
                onChange={(e) => {
                  setCertSearchTerm(e.target.value);
                  setShowCertDropdown(true);
                }}
                onFocus={() => setShowCertDropdown(true)}
                placeholder="Search certifications (ISO, CE, FDA, etc.)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Dropdown */}
              {showCertDropdown && certSearchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCertifications.length > 0 ? (
                    filteredCertifications.map((cert) => (
                      <button
                        key={cert.id}
                        type="button"
                        onClick={() => addCertification(cert.name)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-900">{cert.name}</span>
                        <span className="text-xs text-gray-500">{cert.category}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500 mb-2">No matching certifications</p>
                      <button
                        type="button"
                        onClick={() => {
                          addCertification(certSearchTerm);
                        }}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        + Add "{certSearchTerm}" as custom
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Search or type to add custom certifications</p>
          </div>
        </div>
      </section>

      {/* Negotiation Control Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Negotiation Control</h3>
        </div>

        <div className="space-y-4">
          {/* Negotiation Deadline - Custom Calendar + Time Picker */}
          <DateTimePickerPopup
            label="Negotiation Deadline"
            value={data.negotiationControl.deadline}
            onChange={(datetime) => updateNegotiationControl('deadline', datetime)}
            helpText="Deal will auto-escalate when deadline is reached"
          />

          {/* Maximum Rounds - Blue Slider */}
          <BlueSlider
            label="Maximum Negotiation Rounds"
            value={data.negotiationControl.maxRounds ?? 10}
            onChange={(value) => updateNegotiationControl('maxRounds', value)}
            min={5}
            max={20}
            step={1}
            unit=""
            helpText="Deal escalates after this many negotiation rounds"
          />

          {/* Walk-away Threshold - Blue Slider */}
          <BlueSlider
            label="Walk-away Threshold"
            value={data.negotiationControl.walkawayThreshold ?? 20}
            onChange={(value) => updateNegotiationControl('walkawayThreshold', value)}
            min={10}
            max={30}
            step={1}
            unit="%"
            helpText="AI will walk away if vendor price exceeds target by this percentage"
          />
        </div>
      </section>

      {/* Custom Parameters Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Custom Parameters</h3>
          </div>
          {!showAddParameter && (
            <button
              type="button"
              onClick={() => setShowAddParameter(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Parameter
            </button>
          )}
        </div>

        {/* Add New Parameter Form */}
        {showAddParameter && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Add Custom Parameter</h4>
              <button
                type="button"
                onClick={() => {
                  setShowAddParameter(false);
                  setNewParameter({
                    name: '',
                    type: 'BOOLEAN',
                    targetValue: false,
                    flexibility: 'FLEXIBLE',
                    includeInNegotiation: true,
                  });
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parameter Name */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Parameter Name</label>
                <input
                  type="text"
                  value={newParameter.name || ''}
                  onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                  placeholder="e.g., Free installation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Parameter Type */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Type</label>
                <select
                  value={newParameter.type || 'BOOLEAN'}
                  onChange={(e) => {
                    const type = e.target.value as CustomParameterType;
                    let defaultValue: boolean | number | string = false;
                    if (type === 'NUMBER') defaultValue = 0;
                    if (type === 'TEXT') defaultValue = '';
                    if (type === 'DATE') defaultValue = '';
                    setNewParameter({ ...newParameter, type, targetValue: defaultValue });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
                >
                  {PARAMETER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Value */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Target Value</label>
                {renderTargetValueInput(newParameter, true)}
              </div>

              {/* Flexibility */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Flexibility</label>
                <select
                  value={newParameter.flexibility || 'FLEXIBLE'}
                  onChange={(e) => setNewParameter({ ...newParameter, flexibility: e.target.value as ParameterFlexibility })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
                >
                  {FLEXIBILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {opt.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Include in Negotiation Toggle */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700">Include in AI Negotiation</label>
                <p className="text-xs text-gray-500">AI will actively negotiate this parameter</p>
              </div>
              <button
                type="button"
                onClick={() => setNewParameter({ ...newParameter, includeInNegotiation: !newParameter.includeInNegotiation })}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${newParameter.includeInNegotiation ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${newParameter.includeInNegotiation ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>

            {/* Add Button */}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={addCustomParameter}
                disabled={!newParameter.name?.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Add Parameter
              </button>
            </div>
          </div>
        )}

        {/* Existing Parameters List */}
        {data.customParameters.length > 0 ? (
          <div className="space-y-3">
            {data.customParameters.map((param) => (
              <div
                key={param.id}
                className="p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-gray-900">{param.name}</h4>
                      <span className={`
                        px-2 py-0.5 rounded text-xs font-medium
                        ${param.flexibility === 'FIXED' ? 'bg-red-100 text-red-700' :
                          param.flexibility === 'FLEXIBLE' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'}
                      `}>
                        {param.flexibility}
                      </span>
                      {param.includeInNegotiation && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          AI Negotiable
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="text-gray-500">Type:</span> {PARAMETER_TYPES.find(t => t.value === param.type)?.label}
                      <span className="mx-2">|</span>
                      <span className="text-gray-500">Target:</span>{' '}
                      {param.type === 'BOOLEAN' ? (param.targetValue ? 'Yes' : 'No') : String(param.targetValue)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => param.id && removeCustomParameter(param.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !showAddParameter && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No custom parameters added</p>
              <p className="text-xs text-gray-400 mt-1">
                Add parameters like "Free samples", "Training hours", etc.
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
};

export default StepThree;
