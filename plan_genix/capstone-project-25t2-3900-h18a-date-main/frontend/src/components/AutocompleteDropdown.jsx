import React from "react";
import { Autocomplete, TextField } from "@mui/material";


export default function AutocompleteDropdown({
  label,
  options,
  value,
  onChange, 
  placeholder = '',
  getOptionLabel = (option) => option.label ?? option,
  isOptionEqualToValue = (option, value) => option.code === value.code,
  ...props
}) {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}

      renderInput={(params) => (
        <TextField 
          {...params} 
          label={label} 
          placeholder={placeholder} 
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
            }
          }} 
        />
      )}
      {...props}
    />
  );
}