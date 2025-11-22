import React from "react";

const getNestedValue = (obj, path) => {
  return path && path.split('.').reduce((acc, key) => acc && acc[key], obj);
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
}) => {
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
        // {...(register && register(name))}
        {...(register &&
          register(name, {
            ...(validation && validation),
          }))}
        className={`w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : ""
        } ${className}`}
      >
        <option value="" disabled>
          {placeholder ?? "Select"}
        </option>
        {options.map((option, index) => {
          
         // console.log("okey",optionKey,option[optionKey],getNestedValue(option, optionValue))
          return (
          <option
            key={index}
            value={option[optionValue] ?? option.value ?? option}
          >
            {String(getNestedValue(option, optionKey) ?? option.value ?? option)}
            {/* {option[optionKey] ?? option.label ?? options.value ?? option} */}
          </option>
        )})}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error?.message}</p>}
    </div>
  );
};

export default SelectField;
