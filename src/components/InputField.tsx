import { Eye, EyeOff } from 'lucide-react';
import { useState, ReactNode, InputHTMLAttributes } from "react";

import { FieldError, UseFormRegister } from "react-hook-form";

interface InputFieldProps {
  label?: string;
  type?: string;
  name: string;
  value?: string | number;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];
  onInput?: InputHTMLAttributes<HTMLInputElement>["onInput"];
  placeholder?: string;
  register?: UseFormRegister<any>;
  error?: FieldError;
  validation?: object;
  labelSideComponent?: ReactNode;
  labelClassName?: string;
  className?: string;
  wholeInputClassName?: string;
  max?: string | number;
  min?: string | number;
  step?: string | number;
  disabled?: boolean;
  required?: boolean;
}

export default function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  onInput,
  placeholder,
  register,
  error,
  validation,
  labelSideComponent,
  labelClassName,
  className,
  wholeInputClassName,
  max,
  min,
  step,
  disabled,
  required,
}: InputFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const togglePasswordVisibility = (): void => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <div className={`my-4 ${wholeInputClassName || ""}`}>
      {label && (
        <div className="flex justify-between">
          <label
            htmlFor={name}
            className={`block text-sm text-gray-600 dark:text-dark-text-secondary font-medium mb-2 ${labelClassName || ""}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {labelSideComponent}
        </div>
      )}
      <div className="relative">
        <input
          id={name}
          type={
            type === "password"
              ? !isPasswordVisible
                ? "password"
                : "text"
              : type
          }
          name={name}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onInput={onInput}
          max={max}
          min={min}
          step={step}
          {...(register &&
            register(name, {
              ...(validation && validation),
            }))}
          className={`w-full border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text px-4 py-3 text-base rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${error ? "border-red-500" : ""
            } ${className || ""}`}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {isPasswordVisible ? <Eye /> : <EyeOff />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error?.message}</p>}
    </div>
  );
}
