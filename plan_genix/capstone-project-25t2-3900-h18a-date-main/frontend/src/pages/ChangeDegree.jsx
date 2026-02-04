import React, { useState, useMemo } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

import degrees from "../data/degrees.json";
import specialisations from "../data/specialisations.json";
import AutocompleteDropdown from "../components/AutocompleteDropdown";
import SelectDropdown from "../components/SelectDropdown";
import FilledButton from "../components/FilledButton";
import OutlinedButton from "../components/OutlineButton";
import YearTermPicker from "../components/YearTermPicker";

export default function ChangeDegree() {
  const payload = JSON.parse(localStorage.getItem("payload"));
  const selectedInterests = JSON.parse(localStorage.getItem("selectedInterests"));
  const [newDegree, setNewDegree] = useState(null);
  const [newSpecialisation, setNewSpecialisation] = useState(null);
  const navigate = useNavigate();
  const [newStartYear, setNewStartYear] = useState(null);
  const [newStartTerm, setNewStartTerm] = useState("");

  // This computes the list of specialisation options based on the selected degree
  const specialisationOptions = specialisations;

  // TODO: THIS NEEDS TO BE ADAPTED WITH A BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDegree || !newSpecialisation || !newStartYear || !newStartTerm) {
      alert("Please complete all fields.");
      return;
    }

    try {
        const response = await fetch("plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            completedCourses: payload.completedCourses,
            programCode: newDegree.code,
            currentTermString: newStartTerm,
            currentYear: newStartYear.year(),
            specialisationCode: newSpecialisation,
            commencingSemester: payload.commencingSemester,
            preferences: selectedInterests,
        }),
        });
        if (!response.ok) throw new Error("Failed to generate plan");

        const planData = await response.json();

        // Navigate only after successful plan generation
        navigate("/plan", {
        state: {
            planData,
            payload
        },
        });
    } catch (error) {
        console.error("Failed to generate plan:", error);
        alert("There was a problem generating your plan. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        padding: "3rem",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ width: 520 }}>
          <Typography variant="h5" fontWeight={700} mb={2}>
            Change Degree or Stream
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Your new selection will update the existing plan. Select your
            current degree if you are just changing specialisation.
          </Typography>

          <Stack spacing={3}>
            {/* Degree */}
            <AutocompleteDropdown
              required
              label="Select Degree"
              options={degrees}
              value={newDegree}
              onChange={setNewDegree}
              placeholder="e.g. 3778 Computer Science"
            />

            {/* Specialisation */}
            {newDegree && (
              <SelectDropdown
                selectedValue={newSpecialisation}
                setSelectedValue={setNewSpecialisation}
                options={specialisationOptions}
                id="new-specialisation"
                label="Select New Specialisation"
              />
            )}
            <YearTermPicker
              selectedYear={newStartYear}
              setSelectedYear={setNewStartYear}
              selectedTerm={newStartTerm}
              setSelectedTerm={setNewStartTerm}
            />
            {/* Action Buttons */}
            <Box display="flex" gap={3} mt={1}>
              <OutlinedButton
                label="Cancel"
                onClick={() => navigate("/plan")}
              />
              <FilledButton label="Save Changes" type="submit" />
            </Box>
          </Stack>
        </Box>
      </form>
    </Box>
  );
}
