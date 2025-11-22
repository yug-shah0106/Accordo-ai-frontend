import React, { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";

const InputField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
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
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };


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
          max={max}
          min={min}
          {...(register &&
            register(name, {
              ...(validation && validation),
            }))}
          className={`w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : ""
            } ${className}`}
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
};

export default InputField;
