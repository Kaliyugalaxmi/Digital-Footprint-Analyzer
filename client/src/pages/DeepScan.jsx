import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function DeepScan() {
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const navigate = useNavigate();

  const handleStartAnalysis = () => {
    if (!email) return alert("Please enter an email");

    navigate("/loading", { state: { email, github } });
  };

  return (
    <div className="page deep-scan">
      <div className="card">
        <span className="status">● SYSTEM ONLINE</span>

        <h1>Initialize <span className="highlight">Deep Scan</span></h1>
        <p className="subtitle">Map your digital footprint and check for email breaches.</p>

        <div className="field">
          <label>Email for breach analysis</label>
          <input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          <small>Enter your email to check if it has appeared in any data breaches.</small>
        </div>

        <div className="field">
          <label>GitHub username (optional)</label>
          <input type="text" placeholder="github_username" value={github} onChange={e => setGithub(e.target.value)} />
          <small>Analyze your GitHub profile for public exposure.</small>
        </div>

        <button className="btn primary start-btn" onClick={handleStartAnalysis}>
          START ANALYSIS ⟳
        </button>

        <div className="privacy">🔒 Privacy Guarantee · Zero-Knowledge Encryption Active</div>
      </div>
    </div>
  );
}
