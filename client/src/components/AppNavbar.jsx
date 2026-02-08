import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AppNavbar.css";

export default function AppNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? "app-link active" : "app-link";
  };

  return (
    <nav className="app-navbar">
      <div className="app-navbar-container">
        <div className="app-logo" onClick={() => navigate("/")}>
          <img
            src="/fingerprint.png"
            alt="Fingerprint Logo"
            className="app-logo-image"
          />
          <span>Digital Footprint</span>
        </div>

        <div className="app-links">
          <button 
            className={isActive("/")}
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button 
            className={isActive("/scan")}
            onClick={() => navigate("/scan")}
          >
            Scan
          </button>
          <button 
            className={isActive("/report")}
            onClick={() => navigate("/report")}
          >
            Report
          </button>
        </div>
      </div>
    </nav>
  );
}