  import React from "react";
  import Slider from "@mui/material/Slider";
  import Box from "@mui/material/Box";

  const RangeSlider = ({ label, description, value, range, onChange, onInputChange,moduleName, fieldName }) => {
    return (
      <Box className="mb-6">
        <p className="font-medium text-[20px] font-Roboto">{label}</p>
        <p className="text-sm text-gray-500 font-normal font-Roboto">{description}</p>
        <div className="py-2 px-4">
          <Slider
            value={value}
            min={range[0]}
            max={range[1]}
            onChange={(e, newValue) => onChange(newValue)}
            valueLabelDisplay="auto"
            sx={{
              color: "#1C3CC2",
              "& .MuiSlider-thumb": { backgroundColor: "#1C3CC2" }, 
              "& .MuiSlider-track": { backgroundColor: "#1C3CC2" }, 
              "& .MuiSlider-rail": { backgroundColor: "#D1CFCF" } 
            }}
          />
        </div>
        <Box className="flex gap-4 mt-2">
          <div className="border border-gray-300 rounded-md px-2 py-1">
            <label className="text-xs font-Roboto font-normal text-gray-600">Min  {label}</label>
            <input
              type="number"
              value={value[0]}
              onChange={(e) => onInputChange("min", e.target.value)}
               className="text-sm w-full outline-none "
              placeholder="Min"
            />
          </div>
          <div className="border border-gray-300 rounded-md  px-2 py-1">
            <label className="text-xs font-Roboto font-normal text-gray-600">Max  {label}</label>
            <input
              type="number"
              value={value[1]}
              onChange={(e) => onInputChange("max", e.target.value)}
              className=" text-sm w-full outline-none"
              placeholder="Max"
            />
          </div>
        </Box>
      </Box>
    );
  };

  export default RangeSlider;
