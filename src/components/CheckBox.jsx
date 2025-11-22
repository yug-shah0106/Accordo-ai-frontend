import React, { useState } from "react";

const Checkbox = ({
  label,
  name,
  checked: controlledChecked,
  onChange: controlledOnChange,
  disabled = false,
  error = null,
  register,
}) => {
  const [localChecked, setLocalChecked] = useState(controlledChecked || false);
  const isControlled = controlledChecked !== undefined;

  const handleChange = (e) => {
    if (isControlled) {
      controlledOnChange(e);
    } else {
      setLocalChecked(e.target.checked);
    }
  };

  const checked = isControlled ? controlledChecked : localChecked;

  return (
    <div className="flex items-center space-x-2">
      <input
        id={name}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        {...(register ? register(name) : {})}
        className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
      />
      {label && (
        <label htmlFor={name} className="text-gray-700">
          {label}
        </label>
      )}
      {label && error && (
        <p className="text-red-500 text-sm">{error.message}</p>
      )}
    </div>
  );
};

export default Checkbox;
