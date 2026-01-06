import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

interface DateFromToValue {
  from?: string;
  to?: string;
}

interface DateFromToProps {
  label: string;
  value: DateFromToValue;
  onChange: (field: "from" | "to", newValue: string) => void;
}

const DateFromTo = ({ label, value, onChange }: DateFromToProps) => {
  const today = new Date().toISOString().split("T")[0]; 

  return (
    <Box className="mb-6">
      <p className="font-medium text-[18px] font-Roboto">{label}</p>
      <Box className="flex gap-4 mt-2">
        <TextField
          type="date"
          value={value?.from || ""}
          onChange={(e) => onChange("from", e.target.value)}
          className="border border-gray-300 rounded-md px-2 pt-1 pb-0 text-sm w-full"
          inputProps={{  style: { padding: "4px 8px" } }} 
        />
        <TextField
          type="date"
          value={value?.to || ""}
          onChange={(e) => onChange("to", e.target.value)}
          className="border border-gray-300 rounded-md px-2 pt-1 pb-0 text-sm w-full"
          inputProps={{ min: value?.from || today, style: { padding: "4px 8px" } }} 
        />
      </Box>
    </Box>
  );
};

export default DateFromTo;
