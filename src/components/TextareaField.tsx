import { useState } from "react";

const TextareaField = ({
  label,
  name,
  register,
  error,
  value,
  onChange,
  className,
  labelClassName,
  wholeInputClassName,
  placeholder
}) => {
  const [internalValue, setInternalValue] = useState("");

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };

  return (
    <div className={`my-4 ${wholeInputClassName}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block text-gray-600 font-medium mb-2 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div>
        <textarea
          id={name}
          name={name}
          value={value ?? internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          {...(register && register(name))}
          className={`w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : ""} ${className}`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
      </div>
    </div>
  );
};

export default TextareaField;
