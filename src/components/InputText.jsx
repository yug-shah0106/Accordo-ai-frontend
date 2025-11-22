import React from 'react'
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

const InputText = ({ label, value, onChange }) => {
    return (
      <Box className="mb-2">
        <p className="font-medium text-[18px] font-Roboto">{label}</p>
        <TextField
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="border border-gray-300 rounded-md text-xs w-full"
          inputProps={{ style: { padding: "4px 8px" }, placeholder: "Enter here"  }}
        />
      </Box>
    );
  };

export default InputText