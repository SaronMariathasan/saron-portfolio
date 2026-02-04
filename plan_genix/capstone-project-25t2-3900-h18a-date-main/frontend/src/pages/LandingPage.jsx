// src/pages/LandingPage.jsx
import React from "react";
import "../styles/LandingPage.css";
import { Link } from "react-router-dom";

export default function LandingPage() {
  //remove localstorage item with key "generatedPlan?"
  return (
    <div className="landing-container">
      <div className="landing-content">
        <header className="landing-header">
          <h1 className="landing-title">Welcome to <span className="brand-name">myPlan++</span></h1>
          <p className="landing-subtitle">
            Your personalised UNSW degree planner. Generate, visualise, and customise your course plan in minutes.
          </p>

          <div className="landing-buttons">
            <Link to="/upload">
              <button className="btn primary">Upload Transcript</button>
            </Link>
            <Link to="/manual-entry">
              <button className="btn secondary">Manually Enter Courses</button>
            </Link>
          </div>

          <p className="admin-link">
            Are you a course admin? Access the <strong>Admin Portal</strong>:{" "}
            <Link to="/admin/signin">Sign In</Link> or{" "}
            <Link to="/admin/signup">Sign Up</Link>
          </p>
        </header>

        <section className="features-section">
          <h2>Why use <span className="brand-name">myPlan++</span>?</h2>
          <ul className="features-list">
            <li>📄 Upload UNSW transcripts or previous plans</li>
            <li>📆 Auto-generate degree timeline based on rules</li>
            <li>🧠 Visual planner with drag-and-drop interface</li>
            <li>🌗 Dark mode & smart UX</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
