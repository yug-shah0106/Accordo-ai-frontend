import { ChangeEvent, ReactNode } from "react";
import { FieldError, UseFormRegister } from "react-hook-form";

interface SelectFieldProps {
  label?: string;
  name: string;
  options?: any[];
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  register?: UseFormRegister<any>;
  error?: FieldError;
  labelSideComponent?: ReactNode;
  labelClassName?: string;
  className?: string;
  validation?: object;
  wholeInputClassName?: string;
  optionKey?: string;
  optionValue?: string;
}

const getNestedValue = (obj: any, path: string): any => {
  return path && path.split('.').reduce((acc: any, key: string) => acc && acc[key], obj);
};

const SelectField = ({
  label,
  name,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  register,
  error,
  labelSideComponent,
  labelClassName,
  className,
  validation,
  wholeInputClassName,
  optionKey,
  optionValue,
}: SelectFieldProps) => {
  return (
    <div className={`my-4 ${wholeInputClassName}`}>
      {label && (
        <div className="flex justify-between">
          <label
            htmlFor={name}
            className={`block text-gray-600 font-medium mb-2 ${labelClassName}`}
          >
            {label}
          </label>
          {labelSideComponent}
        </div>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        {...(register &&
          register(name, {
            ...(validation && validation),
          }))}
        className={`w-full border border-gray-300 px-4 pt-2 pb-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : ""
        } ${className}`}
      >
        <option value="" disabled>
          {placeholder ?? "Select"}
        </option>
        {options.map((option, index) => {
          return (
          <option
            key={index}
            value={option[optionValue || 'value'] ?? option.value ?? option}
          >
            {String(getNestedValue(option, optionKey || 'label') ?? option.value ?? option)}
          </option>
        )})}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error?.message}</p>}
    </div>
  );
};

export default SelectField;
