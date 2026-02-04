import React from "react";
import { Box, Typography, Stepper, Step, StepLabel } from "@mui/material";

const steps = ["Upload Transcript", "Review & Preferences", "Select Interests"];

export default function StepIndicator({ activeStep }) {
  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
