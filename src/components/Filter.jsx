import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import RangeSlider from "./RangeSlider.jsx";
import CheckboxGroup from "./CheckboxGroup";
import DateFromTo from "./DateFromTo.jsx";
import InputText from "./InputText.jsx";
import { IoMdClose } from "react-icons/io";

const Filter = ({ onApply, onClose, filtersData = {} }) => {
  const [filters, setFilters] = useState({ ...filtersData });
  const filterRef = useRef(null);

  useEffect(() => {
    setFilters({ ...filtersData });
  }, [filtersData]);

  const handleRangeChange = (key, newValue) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: { ...prevFilters[key], value: newValue },
    }));
  };

  const handleInputChange = (key, field, value) => {
    const updatedRange = [...(filters[key]?.value || [0, 0])];
    updatedRange[field === "min" ? 0 : 1] = Number(value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: { ...prevFilters[key], value: updatedRange },
    }));
  };

  const handleCheckboxChange = (key, option) => {
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

  const handleInputTextChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: { ...prevFilters[key], value },
    }));
  };

  const handleDateChange = (key, field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: {
        ...prevFilters[key],
        value: { ...prevFilters[key].value, [field]: value },
      },
    }));
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
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
        acc[key] = { ...filter, value: [filter.range[0], filter.range[1]] };
      } else if (filter.controlType === "checkbox") {
        acc[key] = { ...filter, selected: {}, value: [] };
      } else if (filter.controlType === "rangeDate") {
        acc[key] = { ...filter, value: { from: "", to: "" } };
      } else if (filter.controlType === "inputText") {
        acc[key] = { ...filter, value: "" };
      }
      return acc;
    }, {});

    setFilters(clearedFilters);
    onApply(null);
  };

  return (
    <Box
      className="p-6 bg-white rounded-lg shadow-xl w-[400px] py-6"
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
              label={filter.label}
              description={filter.description}
              value={filter.value}
              range={filter.range}
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
              label={filter.label}
              value={filter.value}
              onChange={(field, value) => handleDateChange(key, field, value)}
            />
          );
        }

        if (filter.controlType === "inputText") {
          return (
            <InputText
              key={key}
              label={filter.label}
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
          className="bg-gray-300 text-gray-800 rounded-md px-4 py-2"
        >
          Cancel
        </button> */}
        <button
          onClick={handleReset}
          className="bg-gray-300 text-gray-800 rounded-md px-3 py-2"
        >
          Reset
        </button>
        <button
          onClick={() => onApply(filters)}
          className="bg-[#234BF3] text-white rounded-md px-3 py-2"
        >
          Apply
        </button>
      </Box>
    </Box>
  );
};

export default Filter;
