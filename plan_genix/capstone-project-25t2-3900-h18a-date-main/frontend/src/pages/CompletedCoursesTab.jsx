import React from "react";
import { useLocation } from "react-router-dom";
import { Box, Typography, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import TermColumn from "../components/TermColumn";

const TERMS = ["Term1", "Term2", "Term3"];

const groupCompletedCourses = (courses) => {
  const grouped = {};
  courses.forEach(({ year, term, code, title, type }) => {
    if (!grouped[year]) grouped[year] = { Term1: [], Term2: [], Term3: [] };
    grouped[year][term]?.push({ id: code, title, type });
  });
  return grouped;
};

export default function CompletedCoursesTab() {
  const location = useLocation();
  const parsedData = location?.state?.parsedData || {};
  const completedCoursePlan = groupCompletedCourses(parsedData.allPassedCoursesDetailed || []);

  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          width: "90vw",
          maxWidth: "2500px",
          margin: "0 auto",
          padding: 4,
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          color="var(--text-color)"
          sx={{ mb: 3 }}
        >
          Completed Courses
        </Typography>

        {Object.entries(completedCoursePlan).map(([year, terms]) => (
          <Box key={year} sx={{ my: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                backgroundColor: "var(--term-bg)",
                color: "var(--text-color)",
                padding: "0.5rem 1rem",
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
              }}
            >
              {year}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 0.2,
              }}
            >
              {TERMS.map((term) => (
                <TermColumn
                  key={`${year}-${term}`}
                  year={year}
                  term={term}
                  courses={terms[term] || []}
                  isCompleted
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </ThemeProvider>
  );
}
