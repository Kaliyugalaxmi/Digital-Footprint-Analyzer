import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DeepScanUi.css";

export default function DeepScanUi() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/results", { state: { email: location.state?.email } });
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate, location.state]);

  return (
    <div className="deep-scan full-screen-with-navbar">
      <span className="status" style={{ fontSize: "1.2rem" }}>
        ● SYSTEM ONLINE
      </span>

      <h1 style={{ fontSize: "2.5rem", margin: "1rem 0" }}>
        <span className="highlight">Deep Scan</span> in Progress
      </h1>

      <p className="subtitle" style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        Mapping your digital footprint and checking for potential data leaks.
      </p>

      <div className="scan-center">
        <div className="fingerprint-wrapper">
          <img
            src="/fingerprint.png"
            alt="Fingerprint"
            className="fingerprint-img"
          />
          <div className="scan-line"></div>
        </div>
      </div>

      <p className="subtitle" style={{ fontSize: "1.1rem", marginTop: "1rem" }}>
        {location.state?.email
          ? `Analyzing ${location.state.email}…`
          : "Analyzing your digital footprint…"}
      </p>

      <div className="loading-bar" style={{ width: "70%", maxWidth: "500px", marginTop: "2rem" }}>
        <div className="loading-progress"></div>
      </div>

      <div className="progress-dots" style={{ marginTop: "1.5rem" }}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
