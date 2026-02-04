import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from "lucide-react";
import '../styles/Navbar.css'; // optional

export default function Navbar({ darkMode, setDarkMode }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="logo-text">
            <Link to="/" className="logo-link">myPlan++</Link>
        </h1>
      </div>
      <div className="navbar-right">
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <label className="toggle-switch">
                <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
                />
                <span className="slider" />
            </label>
            {darkMode ? <Moon size={20} style={{ marginLeft: '0.5rem' }} /> : <Sun size={20} style={{ marginLeft: '0.5rem' }} />}
        </div>
      </div>
    </header>
  );
}
