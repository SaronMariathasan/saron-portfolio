  // Manual entry form for users who don't want to upload a transcript
  import React, { useState, useMemo } from "react";
  import {
    Box,
    Typography,
    Stack,
    TextField,
    Chip,
    useTheme,
    useMediaQuery,
  } from "@mui/material";
  import degrees from "../data/degrees.json";
  import AutocompleteDropdown from "../components/AutocompleteDropdown";
  import YearTermPicker from "../components/YearTermPicker";
  import FilledButton from "../components/FilledButton";
  import OutlinedButton from "../components/OutlineButton";
  import { useNavigate } from "react-router-dom";
  import SelectDropdown from "../components/SelectDropdown";
  import Autocomplete from "@mui/material/Autocomplete";
  import courses from "../data/courses.json";
  import specialisations from "../data/specialisations.json";
  import {
    CheckCircleOutline,
    School,
    Timeline,
    Bolt,
    DragIndicator,
  } from "@mui/icons-material";
  //TODO: Manual entry plan gen is broken- see discord screenshot
  export default function ManualEntry() {
    // Local state for form inputs
    const studyloadOptions = [1, 2, 3];
    const [selectedDegree, setSelectedDegree] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [planPreference, setPlanPreference] = useState(null);
    const [studyload, setStudyload] = useState(null);
    const [specialisation, setSpecialisation] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const navigate = useNavigate();

    // Derive specialisations based on selected degree
    const specialisationOptions = specialisations

    // TODO: THIS HANDLES CONNECTION TO PLAN GENERATION
    const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !selectedDegree ||
      !selectedYear ||
      !selectedTerm ||
      !specialisation
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    const payload = {
      programCode: selectedDegree.code,
      specialisationCode: specialisation,
      completedCourses: selectedCourses,
      commencingSemester: `T${selectedTerm.replace("Term ", "")} ${selectedYear.year()}`,
      currentTermString: selectedTerm,
      currentYear: parseInt(selectedYear.year()),
    };

    try {
      // Store payload and continue to interests step
      localStorage.setItem("planPayload", JSON.stringify(payload));

      navigate("/interests", {
        state: {
          payload,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }

    console.log("Submitted payload (without generating plan):", payload);
  };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          padding: "3rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Left side: Form for user input */}
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <Box sx={{ maxWidth: 520 }}>
            {/* Step indicator */}
            <Chip
              label="Step 1 of 3"
              color="warning"
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Typography variant="h5" fontWeight={700} mb={1}>
              Degree Information
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Help us tailor your course plan by providing your degree info.
            </Typography>

            <Stack spacing={3}>
              {/* Degree input */}
              <AutocompleteDropdown
                required
                label="Select Degree"
                options={degrees}
                value={selectedDegree}
                onChange={setSelectedDegree}
                placeholder="Type or select a degree"
              />

              {/* Conditionally show specialisation if degree selected */}
              {selectedDegree && (
                <SelectDropdown
                  selectedValue={specialisation}
                  setSelectedValue={setSpecialisation}
                  options={specialisationOptions}
                  id="specialisation"
                  label="Specialisation"
                />
              )}

              {/* Year + Term picker */}
              <YearTermPicker
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                selectedTerm={selectedTerm}
                setSelectedTerm={setSelectedTerm}
              />
              {/* Courses the user already completed */}
              <Autocomplete
                multiple
                freeSolo
                options={courses}
                value={selectedCourses}
                onChange={(event, newValue) => {
                  setSelectedCourses(newValue);
                  // Log newly added entries not in current list
                  const newEntries = newValue.filter(
                    (val) => !courses.includes(val)
                  );
                  if (newEntries.length > 0) {
                    console.log(
                      "New courses added (to backend later):",
                      newEntries
                    );
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Courses Completed"
                    placeholder="e.g. COMP1511"
                  />
                )}
                filterSelectedOptions
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderRadius: 4,
                  },
                }}
              />

              {/* Continue / Cancel actions */}
              <Box display="flex" gap={3} mt={2}>
                <OutlinedButton label="Cancel" onClick={() => navigate("/")} />
                <FilledButton label="Continue" type="submit" />
              </Box>
            </Stack>
          </Box>
        </form>

        {/* Right side: Instructional guide */}
        <Box
          sx={{
            width: 400,
            backgroundColor: "rgba(251, 146, 60, 0.05)",
            borderRadius: 3,
            padding: 3,
            border: "1px dashed #fb923c",
            flexShrink: 0,
            marginTop: isMobile ? "2rem" : "4rem",
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            How it works
          </Typography>
          <Stack spacing={1.5} fontSize="0.95rem">
            <Box display="flex" alignItems="center" gap={1}>
              <School fontSize="small" />
              <span>Select your degree and specialisation.</span>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Timeline fontSize="small" />
              <span>Enter your starting term and study pace.</span>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircleOutline fontSize="small" />
              <span>Add any courses you’ve already completed.</span>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Bolt fontSize="small" />
              <span>We’ll generate your ideal roadmap ✨</span>
            </Box>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            mt={2}
            display="block"
          >
            <DragIndicator fontSize="inherit" sx={{ mr: 0.5 }} />
            Tip: You can drag and edit your roadmap later.
          </Typography>
        </Box>
      </Box>
    );
  }
