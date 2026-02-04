import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

import getDesignTokens from "./theme";

import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import PlanView from "./pages/PlanView";
import EditPlan from "./pages/EditPlan";
import ManualEntry from "./pages/ManualEntry";
import UploadTranscript from "./pages/UploadTranscript";
import EditUploaded from "./pages/EditUploaded";
import InterestPage from "./pages/InterestsPage";
import ChangeDegree from "./pages/ChangeDegree";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setDarkMode(currentTheme === "dark");
    const observer = new MutationObserver(() => {
      const updatedTheme = document.documentElement.getAttribute("data-theme");
      setDarkMode(updatedTheme === "dark");
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const theme = createTheme(getDesignTokens(darkMode ? "dark" : "light"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            element={<Layout darkMode={darkMode} setDarkMode={setDarkMode} />}
          >
            <Route path="/" element={<LandingPage />} />
            <Route path="/upload" element={<UploadTranscript />} />
            <Route path="/edit-upload" element={<EditUploaded />} />
            <Route path="/plan" element={<PlanView />} />
            <Route path="/edit-plan" element={<EditPlan />} />
            <Route path="/manual-entry" element={<ManualEntry />} />
            <Route path="/interests" element={<InterestPage />} />
            <Route path="/change-degree" element={<ChangeDegree />} />
          </Route>
          {/* admin pages */}
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
