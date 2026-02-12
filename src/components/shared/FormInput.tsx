import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormInputProps {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local';
  value?: string | number | null;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string | null;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  labelClassName?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  onBlur,
  error,
  helpText,
  required = false,
  disabled = false,
  readOnly = false,
  min,
  max,
  step,
  maxLength,
  autoComplete,
  autoFocus,
  className = '',
  labelClassName = '',
  prefixIcon,
  suffixIcon,
}) => {
  const hasError = Boolean(error);
  const hasPrefixIcon = Boolean(prefixIcon);
  const hasSuffixIcon = Boolean(suffixIcon);

  const inputClasses = `
    w-full px-4 py-2.5 border rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
    ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'}
    ${readOnly ? 'bg-gray-50' : 'bg-white'}
    ${hasPrefixIcon ? 'pl-10' : ''}
    ${hasSuffixIcon ? 'pr-10' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const labelClasses = `
    block text-sm font-medium text-gray-700 mb-1
    ${labelClassName}
  `.trim().replace(/\s+/g, ' ');

  // Normalize value to string or empty string
  const normalizedValue = value === null || value === undefined ? '' : String(value);

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Prefix Icon */}
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {prefixIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          id={name}
          name={name}
          type={type}
          value={normalizedValue}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={
            hasError
              ? `${name}-error`
              : helpText
              ? `${name}-help`
              : undefined
          }
          className={inputClasses}
        />

        {/* Suffix Icon */}
        {suffixIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {suffixIcon}
          </div>
        )}
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

export default FormInput;
