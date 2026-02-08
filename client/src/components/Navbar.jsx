import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const handleNavClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleGetStarted = () => {
    navigate("/scan");
  };

  return (
    <nav className="landing-navbar">
      <div className="landing-navbar-container">
        <div className="landing-logo">
          <img
            src="/fingerprint.png"
            alt="Fingerprint Logo"
            className="landing-logo-image"
          />
          <span>Digital Footprint</span>
        </div>

        <div className="landing-links">
          <button 
            onClick={() => handleNavClick("hero")} 
            className="landing-link"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Home
          </button>
          <button 
            onClick={() => handleNavClick("problems")} 
            className="landing-link"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Problems
          </button>
          <button 
            onClick={() => handleNavClick("features")} 
            className="landing-link"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Features
          </button>
          <button 
            onClick={handleGetStarted}
            className="landing-button"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}