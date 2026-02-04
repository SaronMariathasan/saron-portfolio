import React from "react";
import { Box, Typography, Divider, Chip, Stack, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProfileSection() {
  const location = useLocation();
  const data = location?.state?.payload;
  const navigate = useNavigate();


  if (!data) {
    return <Typography>No degree or course data found.</Typography>;
  }

  const start = data?.commencingSemester || "N/A";
  const degree = data?.programCode || "N/A";
  const specialisation = data?.specialisationCode || "N/A";
  const completedCourses = data?.completedCourses || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={600}>
        Profile Overview
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Typography> <strong>Degree:</strong> {degree}</Typography>
      <Typography><strong>Specialisation:</strong> {specialisation}</Typography>
      <Typography>
        <strong>Start Term:</strong> {start}
      </Typography>

      <Typography sx={{ mt: 2 }} fontWeight={500}>
        Completed Courses:
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
        {completedCourses.map((code) => (
          <Chip label={code} key={code} />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate("/change-degree")}
      >
        Change Degree / Stream
      </Button>
    </Box>
  );
}
