import { Link } from "react-router-dom";
import "./AppNavbar.css";

export default function AppNavbar() {
  return (
    <nav className="app-navbar">
      <div className="brand">
        <img
          src="/fingerprint.png"
          alt="Logo"
          className="brand-logo"
        />
        <span className="brand-text">Digital Footprint </span>
      </div>

      <div className="right">
        <Link to="/scan">Scan</Link>
        <Link to="/results">Results</Link>
        <Link to="/report">Report</Link>
      </div>
    </nav>
  );
}
