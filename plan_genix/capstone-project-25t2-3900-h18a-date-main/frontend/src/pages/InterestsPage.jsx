import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Divider, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import StepIndicator from "../components/StepIndicator";

// Full list of areas of interest
const areasOfInterest = [
    "Artificial Intelligence",
    "Embedded Systems",
    "Data Science",
    "Software Engineering",
    "Cybersecurity",
    "Cloud Computing",
    "Robotics",
    "Game Development",
    "Human Rights",
    "Social Sciences",
    "Health",
    "Computer Science",
    "Interior Architecture",
    "Landscape",
    "Exercise Science",
    "Media",
    "Architecture",
    "Science",
    "Engineering",
    "History",
    "Environmental Science"
];

export default function InterestPage() {
    const navigate = useNavigate();
    const [selectedInterests, setSelectedInterests] = useState([]);
    const location = useLocation();
    const { payload } = location?.state || {};
    useEffect(() => {
    console.log("Collected data on interests page:", {
        payload,
        selectedInterests
    });
    localStorage.setItem("payload", JSON.stringify(payload));
    localStorage.setItem("selectedInterests", JSON.stringify(selectedInterests));
    }, [selectedInterests, payload]);

    const handleInterestChange = (interest) => {
        setSelectedInterests((prevSelected) => {
            if (prevSelected.includes(interest)) {
                // Deselect interest if already selected
                return prevSelected.filter((item) => item !== interest);
            } else {
                // Add interest to selection if not already selected
                return [...prevSelected, interest];
            }
        });
    };

    const handleContinue = async () => {
    try {
        const response = await fetch("/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            completedCourses: payload.completedCourses,
            programCode: payload.programCode,
            currentTermString: payload.currentTermString,
            currentYear: payload.currentYear,
            specialisationCode: payload.specialisationCode,
            commencingSemester: payload.commencingSemester,
            preferences: selectedInterests,
        }),
        });

        if (!response.ok) throw new Error("Failed to generate plan");

        const planData = await response.json();

        // Navigate only after successful plan generation
        localStorage.setItem("planData", JSON.stringify(planData));
        localStorage.setItem("payload", JSON.stringify(payload));
        localStorage.setItem("selectedInterests", JSON.stringify(selectedInterests));

        navigate("/plan", {
        state: {
            planData,
            selectedInterests,
            payload
        },
        });
    } catch (error) {
        console.error("Failed to generate plan:", error);
        alert("There was a problem generating your plan. Please try again.");
    }
    };

    return (
        <Box sx={{ maxWidth: "700px", margin: "0 auto", padding: "2rem" }}>
            <StepIndicator activeStep={2} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Select Your Areas of Interest
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                Please select the areas of interest that you're passionate about.
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Areas of Interest Buttons */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {areasOfInterest.map((interest) => (
                    <Grid item xs={12} sm={6} md={4} key={interest}>
                        <Button
                            variant={selectedInterests.includes(interest) ? "contained" : "outlined"}
                            fullWidth
                            sx={{
                                height: "100px", // Ensures all buttons have the same height
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                                textTransform: "none",
                                backgroundColor: selectedInterests.includes(interest) ? "#4C6EDB" : "transparent",
                                borderColor: "#4C6EDB",
                                color: selectedInterests.includes(interest) ? "white" : "#4C6EDB",
                                '&:hover': {
                                    backgroundColor: selectedInterests.includes(interest) ? "#3b5d92" : "#e6f0ff",
                                }
                            }}
                            onClick={() => handleInterestChange(interest)}
                        >
                            {interest}
                        </Button>
                    </Grid>
                ))}
            </Grid>

            {/* Continue Button */}
            <Button
                variant="contained"
                color="primary"
                fullWidth
                disabled={selectedInterests.length === 0}
                onClick={handleContinue}
            >
                Continue to Plan
            </Button>
        </Box>
    );
}
