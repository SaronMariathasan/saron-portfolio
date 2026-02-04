import React from "react";
import { Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

export default function YearTermPicker({
  selectedYear,
  setSelectedYear,
  selectedTerm,
  setSelectedTerm
}) {
  const termOptions = ["Term 1", "Term 2", "Term 3", "Summer Term"];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <DatePicker
            views={["year"]}
            label="Start Year"
            value={selectedYear}
            onChange={(newValue) => setSelectedYear(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                  },
                  "& fieldset": {
                    borderRadius: 4,
                  },
                },
              },
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="term-select-label">Start Term</InputLabel>
            <Select
              labelId="term-select-label"
              id="term-select"
              label="Start Term"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              sx={{
                borderRadius: 4,
                textAlign: "left",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: 4,
                },
              }}
            >
              {termOptions.map((term) => (
                <MenuItem key={term} value={term}>
                  {term}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}