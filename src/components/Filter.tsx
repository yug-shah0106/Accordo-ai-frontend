import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import RangeSlider from "./RangeSlider.jsx";
import CheckboxGroup from "./CheckboxGroup";
import DateFromTo from "./DateFromTo.jsx";
import InputText from "./InputText.jsx";
import { IoMdClose } from "react-icons/io";

interface FilterValue {
  controlType: string;
  label?: string;
  description?: string;
  value?: any;
  range?: number[];
  options?: any[];
  selected?: Record<string, boolean>;
  [key: string]: any;
}

interface FilterProps {
  onApply: (filters: any) => void;
  onClose: () => void;
  filtersData?: Record<string, FilterValue>;
}

const Filter = ({ onApply, onClose, filtersData = {} }: FilterProps) => {
  const [filters, setFilters] = useState<Record<string, FilterValue>>({ ...filtersData });
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilters({ ...filtersData });
  }, [filtersData]);

  const handleRangeChange = (key: string, newValue: number | number[]) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: { ...prevFilters[key], value: newValue },
    }));
  };

  const handleInputChange = (key: string, field: string, value: string) => {
    const updatedRange = [...(filters[key]?.value || [0, 0])];
    updatedRange[field === "min" ? 0 : 1] = Number(value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: { ...prevFilters[key], value: updatedRange },
    }));
  };

  const handleCheckboxChange = (key: string, option: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: {
        ...prevFilters[key],
        selected: {
          ...prevFilters[key]?.selected,
          [option]: !prevFilters[key]?.selected?.[option],
        },
      },
    }));
  };

  const handleInputTextChange = (key: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: { ...prevFilters[key], value },
    }));
  };

  const handleDateChange = (key: string, field: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: {
        ...prevFilters[key],
        value: { ...prevFilters[key].value, [field]: value },
      },
    }));
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleReset = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      const filter = filters[key];

      if (filter.controlType === "rangeNumeric") {
        acc[key] = { ...filter, value: [filter.range?.[0] || 0, filter.range?.[1] || 0] };
      } else if (filter.controlType === "checkbox") {
        acc[key] = { ...filter, selected: {}, value: [] };
      } else if (filter.controlType === "rangeDate") {
        acc[key] = { ...filter, value: { from: "", to: "" } };
      } else if (filter.controlType === "inputText") {
        acc[key] = { ...filter, value: "" };
      }
      return acc;
    }, {} as Record<string, FilterValue>);

    setFilters(clearedFilters);
    onApply(null);
  };

  return (
    <Box
      className="p-6 bg-white rounded-lg shadow-xl w-[400px] pt-6 pb-0"
      ref={filterRef}
    >
      <div className="flex justify-between">
        <h2 className="font-normal  font-Roboto text-[24px] ">Filter</h2>
        <button onClick={onClose} className="text-black font-medium">
          <IoMdClose />
        </button>
      </div>

      <hr className="my-3 border-spacing-0 border-black opacity-[50%]" />
      {Object.keys(filters || {}).map((key) => {
        const filter = filters[key];

        if (filter.controlType === "rangeNumeric") {
          return (
            <RangeSlider
              key={key}
              label={filter.label || ""}
              description={filter.description}
              value={filter.value || [0, 0]}
              range={filter.range || [0, 100]}
              onChange={(newValue) => handleRangeChange(key, newValue)}
              onInputChange={(field, value) =>
                handleInputChange(key, field, value)
              }
            />
          );
        }

        if (filter.controlType === "checkbox") {
          return (
            <CheckboxGroup
              key={key}
              label={filter.label}
              options={filter.options}
              selectedOptions={filter.selected || {}}
              onChange={(option) => handleCheckboxChange(key, option)}
            />
          );
        }

        if (filter.controlType === "rangeDate") {
          return (
            <DateFromTo
              key={key}
              label={filter.label || ""}
              value={filter.value}
              onChange={(field, value) => handleDateChange(key, field, value)}
            />
          );
        }

        if (filter.controlType === "inputText") {
          return (
            <InputText
              key={key}
              label={filter.label || ""}
              value={filter.value}
              onChange={(value) => handleInputTextChange(key, value)}
            />
          );
        }

        return null;
      })}

      <Box className="flex justify-end gap-4 mt-6">
        {/* <button
          onClick={onClose}
          className="bg-gray-300 text-gray-800 rounded-md px-4 pt-2 pb-0"
        >
          Cancel
        </button> */}
        <button
          onClick={handleReset}
          className="bg-gray-300 text-gray-800 rounded-md px-3 pt-2 pb-0"
        >
          Reset
        </button>
        <button
          onClick={() => onApply(filters)}
          className="bg-[#234BF3] text-white rounded-md px-3 pt-2 pb-0"
        >
          Apply
        </button>
      </Box>
    </Box>
  );
};

export default Filter;
