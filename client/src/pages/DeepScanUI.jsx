import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "./DeepScanUI.css";

const DeepScanUI = () => {
  const location = useLocation();
  const { email, githubUsername } = location.state || {
    email: "test@example.com",
    githubUsername: "",
  };

  const [isScanning, setIsScanning] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [lastScannedDate, setLastScannedDate] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        // ===== DEBUG: Log what's being sent =====
        console.log("🔍 DeepScanUI - Data being sent to API:", {
          email,
          githubUsername,
          timestamp: new Date().toISOString(),
        });

        const response = await fetch("http://localhost:5000/api/check-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            githubUsername,
          }),
        });

        const data = await response.json();
        console.log("📊 API Response:", data);
        console.log("📊 API Response - Email field:", data.email);
        console.log("📊 API Response - Timestamp:", data.scanTimestamp);

        if (!response.ok) {
          throw new Error(data.error || "Analysis failed");
        }

        setTimeout(() => {
          setResults(data);
          // Set last scanned date from API response
          if (data.scanTimestamp) {
            setLastScannedDate(new Date(data.scanTimestamp));
            console.log("✅ Last scanned date set:", new Date(data.scanTimestamp));
          }
          setIsScanning(false);
        }, 3000);
      } catch (err) {
        console.error("❌ Error:", err);
        setError(err.message);
        setIsScanning(false);
      }
    };

    fetchAnalysis();
  }, [email, githubUsername]);

  /* SCANNING UI */
  if (isScanning) {
    return (
      <div className="scan-screen">
        <div className="scan-loader-card">
          <div className="spinner"></div>
          <h1>Initializing Deep Scan</h1>
          <p className="muted">
            Analyzing digital footprint and security exposure...
          </p>

          <div className="scan-steps">
            <span>✔ Checking email breaches</span>
            <span>✔ Scanning GitHub profile</span>
            <span className="blink">⏳ Calculating risk score</span>
          </div>
        </div>
      </div>
    );
  }

  /* ERROR UI */
  if (error) {
    return (
      <div className="scan-screen">
        <div className="scan-loader-card">
          <h1>⚠️ Analysis Failed</h1>
          <p className="muted">{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  /* Loading Results */
  if (!results) {
    return (
      <div className="scan-screen">
        <div className="scan-loader-card">
          <div className="spinner"></div>
          <p className="muted">Loading results...</p>
        </div>
      </div>
    );
  }

  // Extract data with safe defaults
  const breaches = results?.breaches || [];
  const social = results?.social || {
    isPublic: false,
    followers: 0,
    repos: 0,
    profileUrl: null,
  };
  const riskScore = results?.riskScore || 0;
  const recommendations = results?.recommendations || [];

  const riskLevel =
    riskScore > 70 ? "high" : riskScore > 40 ? "medium" : "low";

  // Format last scanned date with relative time
  const formatDate = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* RESULTS UI */
  return (
    <div className="scan-screen">
      <div className="analysis-dashboard">
        {/* Header with Badge */}
        <div className="dashboard-header">
          <div>
            <h1 className="title">Analysis Results</h1>
            <p className="muted">Scanned: {results?.email || "Unknown"}</p>
          </div>
          
          {/* Last Scanned Badge - Integrated into header */}
          <div className="last-scanned-badge">
            <span className="badge-label">● LAST SCANNED:</span>
            <span className="badge-time">
              {lastScannedDate ? formatDate(lastScannedDate) : "Never"}
            </span>
          </div>
        </div>

        {/* TOP GRID - Main Metrics */}
        <div className="analysis-grid">
          {/* EMAIL BREACH */}
          <div className="card">
            <h2>Email Breach Results</h2>
            {breaches.length > 0 ? (
              <div className="alert danger">
                Email found in {breaches.length} breach(es)
              </div>
            ) : (
              <div className="alert success">✓ No breaches detected</div>
            )}
          </div>

          {/* GITHUB PROFILE */}
          <div className="card">
            <h2>GitHub Profile</h2>
            {social.isPublic ? (
              <>
                <div className="stats">
                  <div>
                    <span className="stat-value">{social.followers}</span>
                    <span className="stat-label">Followers</span>
                  </div>
                  <div>
                    <span className="stat-value">{social.repos}</span>
                    <span className="stat-label">Public Repos</span>
                  </div>
                </div>
                <div className="privacy public">🔓 Profile is public</div>
                {social.bio && (
                  <p className="bio">
                    <strong>Bio:</strong> {social.bio}
                  </p>
                )}
                {social.profileUrl && (
                  <a
                    href={social.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    View Profile →
                  </a>
                )}
              </>
            ) : (
              <p className="muted">No GitHub profile analyzed</p>
            )}
          </div>

          {/* RISK SCORE */}
          <div className="card center">
            <h2>Overall Risk Score</h2>
            <svg className="risk-svg" width="180" height="180">
              <circle
                className="risk-bg"
                cx="90"
                cy="90"
                r="70"
                strokeWidth="12"
                fill="none"
              />
              <circle
                className={`risk-progress ${riskLevel}`}
                cx="90"
                cy="90"
                r="70"
                strokeWidth="12"
                fill="none"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * riskScore) / 100}
              />
            </svg>

            <div className="risk-text">
              <span className="risk-number">{riskScore}%</span>
              <span className="risk-sub">EXPOSED</span>
            </div>
            <span className={`risk-label ${riskLevel}`}>
              {riskLevel === "high"
                ? "🔴 High Risk"
                : riskLevel === "medium"
                ? "🟡 Medium Risk"
                : "🟢 Low Risk"}
            </span>
          </div>
        </div>

        {/* RECOMMENDED ACTIONS */}
        <div className="actions-section">
          <div className="actions-header">
            <div className="actions-title-group">
              <h2>Recommended Actions</h2>
              <p className="actions-subtitle">
                {recommendations.length > 0
                  ? `${recommendations.length} action(s) to improve your security`
                  : "No recommendations at this time"}
              </p>
            </div>
            <div className="actions-legend">
              <div className="legend-item">
                <span className="legend-dot high"></span>
                <span>Critical</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot medium"></span>
                <span>Important</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot low"></span>
                <span>Recommended</span>
              </div>
            </div>
          </div>

          {recommendations.length > 0 ? (
            <div className="actions-container">
              {recommendations.map((item, index) => (
                <div
                  key={index}
                  className={`action-card-enhanced ${item.level}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {/* Priority Badge */}
                  <div className="action-badge">
                    {item.level === "high"
                      ? "🔴 Critical"
                      : item.level === "medium"
                      ? "🟡 Important"
                      : "🟢 Recommended"}
                  </div>

                  {/* Icon */}
                  <div className="action-icon">
                    {item.level === "high"
                      ? "⚠️"
                      : item.level === "medium"
                      ? "✓"
                      : "💡"}
                  </div>

                  {/* Content */}
                  <div className="action-content">
                    <h3 className="action-title">{item.title}</h3>
                    <p className="action-description">{item.desc}</p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="action-progress">
                    <div className="progress-bar"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-actions-placeholder">
              <div className="placeholder-icon">✨</div>
              <p>Your account is in great shape!</p>
              <span className="placeholder-subtitle">
                Continue monitoring for any security concerns
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepScanUI;