import { useState, ChangeEvent, ReactNode } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { FieldError, UseFormRegister } from "react-hook-form";

interface InputFieldProps {
  label?: string;
  type?: string;
  name: string;
  value?: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onInput?: (e: ChangeEvent<HTMLInputElement>) => void;
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
  disabled?: boolean;
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
  disabled,
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
            className={`block text-gray-600 font-medium mb-2 ${labelClassName || ""}`}
          >
            {label}
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
          {...(register &&
            register(name, {
              ...(validation && validation),
            }))}
          className={`w-full border border-gray-300 px-4 pt-2 pb-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : ""
            } ${className || ""}`}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {isPasswordVisible ? <GoEye /> : <GoEyeClosed />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error?.message}</p>}
    </div>
  );
}
