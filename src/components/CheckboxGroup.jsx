import { Switch } from "@mui/material";
import React from "react";

const CheckboxGroup = ({
  options = [],
  selectedOptions = {},
  onChange,
  label,
}) => {
  if (!options || options.length === 0) {
    return <div>No options available</div>;
  }

  return (
    <div className="my-5">
      {/* <label className="font-medium font-Roboto text-[20px]">{label}</label> */}
      <div>
        {/* {options.map((option, index) => (
          <div className="flex" key={index}>
            <input
              type="checkbox"
              className="cursor-pointer gap-4"
              checked={!!selectedOptions[option]} // Ensures the checkbox stays checked
              onChange={() => onChange(option)}
            />
            &nbsp;
            <span className="text-xs pt-1 font-Roboto text-[#18100E] font-normal">
              {option}
            </span>
          </div>
        ))} */}
        {/* <div className="flex items-center font-Roboto justify-between">
          Type 1 <Switch {...label} defaultChecked />
        </div>
        <div className="flex items-center font-Roboto justify-between">
          Type 2 <Switch {...label} />
        </div>
        <div className="flex items-center font-Roboto justify-between">
          Type 3 <Switch {...label} defaultChecked />
        </div>         */}
      </div>
    </div>
  );
};

export default CheckboxGroup;
