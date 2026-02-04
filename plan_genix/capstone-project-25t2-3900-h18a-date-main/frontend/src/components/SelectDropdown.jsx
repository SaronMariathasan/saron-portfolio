import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

export default function SelectDropdown({
  selectedValue,
  setSelectedValue,
  options,
  id,
  label,
  ...props
}) {
  const labelId = `${id}-label`;

  // If options are objects with 'code' and 'label'
  const isObjectOptions = typeof options?.[0] === "object";

  return (
    <FormControl>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        {...props}
        labelId={labelId}
        id={id}
        value={selectedValue}
        onChange={(e) => setSelectedValue(e.target.value)}
        sx={{
          textAlign: "left",
          borderRadius: 4,
          "& .MuiOutlinedInput-notchedOutline": {
            borderRadius: 4,
          },
        }}
      >
        {options.map((option, index) => {
          const value = isObjectOptions ? option.code : option;
          const display = isObjectOptions ? option.label : option;
          return (
            <MenuItem key={index} value={value}>
              {display}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
