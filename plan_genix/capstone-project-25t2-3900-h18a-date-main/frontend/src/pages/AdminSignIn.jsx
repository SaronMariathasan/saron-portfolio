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
import { loginAdmin } from "../utils/adminApi";

export default function AdminSignIn() {
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
      const { token } = await loginAdmin({ email, password });
      localStorage.setItem("adminToken", token);

      setSnackbar({
        open: true,
        message: "Welcome!",
        severity: "success",
      });
      setTimeout(() => navigate("/admin/dashboard"), 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Invalid credentials",
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
        backgroundColor: "#f9fafb",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Admin Sign In
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              backgroundColor: "primary.main",
              color: "common.white",
              py: 1.5,
              borderRadius: 1,
            }}
          >
            Sign In
          </Button>
        </Box>

        <Typography variant="body2" mt={3} color="text.secondary">
          Need an account?{" "}
          <Link to="/admin/signup" style={{ color: "#f97316", fontWeight: 600 }}>
            Sign Up
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
