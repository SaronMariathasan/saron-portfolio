import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Divider,
} from "@mui/material";
import StepIndicator from "../components/StepIndicator";

const mockSpecialisations = ["COMPA1", "COMPN1", "COMPY1"];

export default function EditUploaded() {
  const location = useLocation();
  const parsedData = location?.state?.parsedData || null;
  const currTerm = parsedData.currTerm || null;
  const currYear = parsedData.currYear || null;
  const currProg = parsedData.currProg || null;
  const specCode = parsedData.specCode || null;
  console.log("EditUploaded received parsedData:", parsedData);

  const [selectedSpec, setSelectedSpec] = useState("");
  const [planPreference, setPlanPreference] = useState("");
  const [estimatedEndYear, setEstimatedEndYear] = useState("");
  const navigate = useNavigate();

const handleContinue = async () => {
  const payload = {
    programCode: currProg,
    specialisationCode: specCode,
    completedCourses: completedCourses,
    commencingSemester: `T${startTerm.replace("Term ", "")} ${startYear}`,
    currentTermString: currTerm,
    currentYear: currYear,
  };

  // Save payload to localStorage
  try {
    localStorage.setItem("planPayload", JSON.stringify(payload));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
    alert("Something went wrong saving your data. Please try again.");
    return;
  }

  // Navigate to /interests like ManualEntry does
  navigate("/interests", {
    state: {
      payload,
    },
  });
};


  const {
    completedCourses = [],
    coreCourses = [],
    electives = [],
    uocRemaining,
    startYear,
    startTerm,
  } = parsedData || {};

  const uniqueCompletedCourses = [...new Set(completedCourses)];

  const isCore = (code) => coreCourses.includes(code);
  const isElective = (code) => electives.includes(code);

  if (!parsedData) {
    return (
      <Typography variant="h6" color="error">
        No transcript data found. Please upload again.
      </Typography>
    );
  }

    return (
        <Box sx={{ maxWidth: "700px", margin: "0 auto", padding: "2rem" }}>
            <StepIndicator activeStep={1} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Review Parsed Transcript
            </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        We’ve extracted your transcript info. Make sure everything looks right.
      </Typography>
      <Divider sx={{ my: 2 }} />

      {parsedData?.startYear && (
        <>
          <Typography variant="h6" fontWeight={500}>
            Start of Program:
          </Typography>
          <Typography sx={{ mb: 4 }}>
            {startTerm ?? "Unknown Term"} {startYear ?? "Unknown Year"}
          </Typography>
        </>
      )}

      {/* Completed Courses with UOC */}
      <Typography variant="h6" fontWeight={500} sx={{ mb: 1 }}>
        Completed Courses:
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap" mb={4}>
        {uniqueCompletedCourses.map((course) => (
          <Chip
            key={course}
            label={course}
            sx={{
              backgroundColor: isCore(course)
                ? "#FFA500"
                : isElective(course)
                ? "#9c27b0"
                : undefined,
              color: "#fff",
            }}
          />
        ))}
      </Stack>

      {/* Units of Credit Remaining */}
      <Typography variant="h6" fontWeight={500}>
        Units of Credit Remaining:
      </Typography>
      <Typography sx={{ mb: 4 }}>{uocRemaining ?? "Unknown"}</Typography>

            {/* Specialisation Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Specialisation</InputLabel>
                <Select
                    value={selectedSpec}
                    label="Select Specialisation"
                    onChange={(e) => setSelectedSpec(e.target.value)}
                >
                    {mockSpecialisations.map((spec) => (
                        <MenuItem key={spec} value={spec}>
                            {spec}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Continue to Plan View Button */}
            <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={!selectedSpec}
                onClick={handleContinue}
            >
                Next: Select Interests
            </Button>
        </Box>
    );
}
