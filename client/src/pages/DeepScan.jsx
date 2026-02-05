import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function DeepScan() {
  const [identity, setIdentity] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const navigate = useNavigate();

  const handleStartAnalysis = () => {
    if (!identity) return alert("Please enter an email");

    // Navigate to loading page with both email and github username
    navigate("/loading", { 
      state: { 
        email: identity,
        githubUsername: githubUsername 
      } 
    });
  };

  return (
    <div className="page deep-scan">
      <div className="card">
        <span className="status">● SYSTEM ONLINE</span>

        <h1>
          Initialize <span className="highlight">Deep Scan</span>
        </h1>

        <p className="subtitle">
          Map your digital footprint and check for email breaches.
        </p>

        <div className="field">
          <label>EMAIL FOR BREACH ANALYSIS</label>
          <input
            type="email"
            placeholder="email@example.com"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
          />
          <small>
            Enter your email to check if it has appeared in any data breaches.
          </small>
        </div>

        <div className="field">
          <label>GITHUB USERNAME (OPTIONAL)</label>
          <input
            type="text"
            placeholder="github_username"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
          />
          <small>
            Analyze your GitHub profile for public exposure.
          </small>
        </div>

        <button className="btn primary start-btn" onClick={handleStartAnalysis}>
          START ANALYSIS ⟳
        </button>

        <div className="privacy">
          🔒 Privacy Guarantee · Zero-Knowledge Encryption Active
        </div>
      </div>
    </div>
  );
}