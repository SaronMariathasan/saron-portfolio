import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { registerAdmin } from "../utils/adminApi";

export default function AdminSignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  const handleClose = () =>
    setSnackbar((s) => ({ ...s, open: false }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerAdmin({
        nameFirst: firstName,
        nameLast: lastName,
        email,
        password,
      });
      setSnackbar({
        open: true,
        message: "Sign up successful!",
        severity: "success",
      });
      // redirect after short pause
      setTimeout(() => navigate("/admin/signin"), 1500);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Registration failed",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Admin Sign Up
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="First Name"
            fullWidth
            required
            margin="normal"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            fullWidth
            required
            margin="normal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            helperText="Minimum 8 characters, must include a letter and a number"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: "primary.main",
              color: "common.white",
              py: 1.5,
              borderRadius: 1,
            }}
          >
            Sign Up
          </Button>
        </Box>

        <Typography variant="body2" mt={3} color="text.secondary">
          Already have an account?{" "}
          <Link to="/admin/signin" style={{ color: "#f97316", fontWeight: 600 }}>
            Sign In
          </Link>
        </Typography>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
