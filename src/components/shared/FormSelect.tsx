import React from 'react';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface FormSelectProps {
  name: string;
  label?: string;
  options?: SelectOption[];
  optionGroups?: SelectOptionGroup[];
  value?: string | number | string[] | number[] | null;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  error?: string | null;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  multiple?: boolean;
  autoFocus?: boolean;
  className?: string;
  labelClassName?: string;
  valueKey?: string;
  labelKey?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  options = [],
  optionGroups,
  value,
  placeholder = 'Select an option...',
  onChange,
  onBlur,
  error,
  helpText,
  required = false,
  disabled = false,
  isLoading = false,
  multiple = false,
  autoFocus = false,
  className = '',
  labelClassName = '',
  valueKey = 'value',
  labelKey = 'label',
}) => {
  const hasError = Boolean(error);
  const isDisabled = disabled || isLoading;

  const selectClasses = `
    w-full px-4 py-2.5 pr-10 border rounded-lg appearance-none
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
    ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const labelClasses = `
    block text-sm font-medium text-gray-700 mb-1
    ${labelClassName}
  `.trim().replace(/\s+/g, ' ');

  // Normalize value to string or empty string for single select
  // For multiple, keep as array
  const normalizedValue = multiple
    ? value || []
    : value === null || value === undefined
    ? ''
    : String(value);

  // Render options from array
  const renderOptions = (opts: SelectOption[]) => {
    return opts.map((option) => {
      const optValue = option[valueKey as keyof SelectOption];
      const optLabel = option[labelKey as keyof SelectOption];

      return (
        <option key={String(optValue)} value={String(optValue)}>
          {String(optLabel)}
        </option>
      );
    });
  };

  // Render option groups
  const renderOptionGroups = () => {
    if (!optionGroups) return null;

    return optionGroups.map((group, index) => (
      <optgroup key={index} label={group.label}>
        {renderOptions(group.options)}
      </optgroup>
    ));
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        {/* Select Element */}
        <select
          id={name}
          name={name}
          value={normalizedValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={isDisabled}
          required={required}
          multiple={multiple}
          autoFocus={autoFocus}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={
            hasError
              ? `${name}-error`
              : helpText
              ? `${name}-help`
              : undefined
          }
          className={selectClasses}
        >
          {/* Placeholder Option */}
          {!multiple && (
            <option value="" disabled={required}>
              {isLoading ? 'Loading...' : placeholder}
            </option>
          )}

          {/* Options or Option Groups */}
          {optionGroups ? renderOptionGroups() : renderOptions(options)}
        </select>

        {/* Loading Indicator or Chevron Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" data-lucide="loader-2" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" data-lucide="chevron-down" />
          )}
        </div>
      </div>

      {/* Help Text */}
      {helpText && !hasError && (
        <p id={`${name}-help`} className="mt-1 text-xs text-gray-500">
          {helpText}
        </p>
      )}

      {/* Error Message */}
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" data-lucide="alert-circle" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;
