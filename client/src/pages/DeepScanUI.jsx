import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DeepScanUI.css";

const DeepScanUI = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { email, github: githubUsername } = location.state || {
    email: "test@example.com",
    github: "",
  };

  const [isScanning, setIsScanning] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [lastScannedDate, setLastScannedDate] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    let progress = 0;
    let apiFinished = false;

    const finishScan = () => {
      setTimeout(() => {
        setIsScanning(false);
      }, 1200);
    };

    const startFakeProgress = () => {
      const stages = [
        { until: 15, speed: 50 },
        { until: 35, speed: 80 },
        { until: 60, speed: 110 },
        { until: 80, speed: 150 },
        { until: 95, speed: 220 },
        { until: 100, speed: 300 },
      ];

      let currentStage = 0;

      const runStage = () => {
        const interval = setInterval(() => {
          progress += 1;
          setScanProgress(progress);

          if (progress >= stages[currentStage].until) {
            clearInterval(interval);
            currentStage++;

            if (currentStage < stages.length) {
              runStage();
            } else {
              if (apiFinished) finishScan();
            }
          }
        }, stages[currentStage].speed);
      };

      runStage();
    };

    const fetchAnalysis = async () => {
      try {
        console.log("Sending to API:", { email, githubUsername });

        const response = await fetch("http://localhost:5000/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, githubUsername }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Analysis failed");

        setResults(data);
        apiFinished = true;

        if (data.scanTimestamp) {
          setLastScannedDate(new Date(data.scanTimestamp));
        }

        localStorage.setItem(
          "scanReport",
          JSON.stringify({
            email: data.email,
            breaches: data.breaches || [],
            github: {
              exists: data.social?.isPublic || false,
              username: data.social?.username || null,
              repos: data.social?.repos || 0,
              followers: data.social?.followers || 0,
              bio: data.social?.bio || "No bio available",
              profileUrl: data.social?.profileUrl || null,
              avatar: data.social?.avatar || null,
            },
            riskScore: data.riskScore || 0,
            riskLevel:
              data.riskScore > 70 ? "High" :
              data.riskScore > 40 ? "Medium" : "Low",
            recommendations: data.recommendations || [],
            scanDate: new Date().toLocaleString(),
          })
        );

        console.log("Report saved");

        if (progress >= 100) finishScan();

      } catch (err) {
        console.error(err);
        setError(err.message);
        setIsScanning(false);
      }
    };

    startFakeProgress();
    fetchAnalysis();

  }, [email, githubUsername]);


  if (isScanning) {
    return (
      <div className="scan-screen">
        <div className="scan-content-wrapper">
          <div className="scan-container">
            <div className="scan-content">
              <div className="scan-header-section">
                <div className="scan-email-info">
                  <p className="scan-email-label">Scanning Target</p>
                  <p className="scan-email-value">{email}</p>
                </div>
              </div>

              <div className="circular-progress-section">
                <div className="progress-circle-container">
                  <svg className="progress-circle-svg" width="200" height="200" viewBox="0 0 200 200">
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                    <circle
                      className="progress-circle-bg"
                      cx="100"
                      cy="100"
                      r="80"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      className="progress-circle-fill"
                      cx="100"
                      cy="100"
                      r="80"
                      strokeWidth="8"
                      fill="none"
                      stroke="#3b82f6"
                      strokeDasharray={502}
                      strokeDashoffset={502 - (502 * scanProgress) / 100}
                      style={{
                        transition: 'stroke-dashoffset 0.5s ease-out'
                      }}
                    />
                  </svg>
                  <div className="progress-text-overlay">
                    <span className="progress-percentage">{Math.min(Math.round(scanProgress), 100)}%</span>
                    <span className="progress-label">Analyzing</span>
                  </div>
                </div>
              </div>

              <h1 className="scan-title">Security Analysis</h1>
              <p className="scan-subtitle">Deep scanning your digital presence for vulnerabilities and potential leaks.</p>

              <div className="scan-modules">
                <div className={`scan-module ${scanProgress > 15 ? "completed" : "active"}`}>
                  <div className="module-icon">✓</div>
                  <div className="module-content">
                    <h3 className="module-title">Email Database Check</h3>
                    <p className="module-desc">No breaches found in 14 major databases</p>
                  </div>
                  <div className="module-indicator"></div>
                </div>

                <div className={`scan-module ${scanProgress > 60 ? "completed" : scanProgress > 15 ? "active" : ""}`}>
                  <div className="module-icon">⚙️</div>
                  <div className="module-content">
                    <h3 className="module-title">Social Media Audit</h3>
                    <p className="module-desc">Analyzing privacy on LinkedIn, X, and Meta</p>
                  </div>
                  <div className="module-indicator"></div>
                </div>

                <div className={`scan-module ${scanProgress > 85 ? "completed" : scanProgress > 60 ? "active" : ""}`}>
                  <div className="module-icon">🔒</div>
                  <div className="module-content">
                    <h3 className="module-title">Dark Web Monitoring</h3>
                    <p className="module-desc">Waiting to initialize module...</p>
                  </div>
                  <div className="module-indicator"></div>
                </div>
              </div>

              
            </div>
          </div>
        </div>
        
      </div>
    );
  }

  if (error) {
    return (
      <div className="scan-screen-pro">
        <div className="scan-container">
          <div className="scan-content error-content">
            <div className="error-icon">⚠️</div>
            <h1 className="scan-title">Analysis Failed</h1>
            <p className="error-message">{error}</p>
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="scan-screen-pro">
        <div className="scan-container">
          <div className="scan-content">
            <div className="spinner-loader"></div>
            <p className="scan-subtitle">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  const breaches = results?.breaches || [];
  const social = results?.social || {
    isPublic: false,
    followers: 0,
    repos: 0,
    profileUrl: null,
    bio: null,
  };
  const riskScore = results?.riskScore || 0;
  const recommendations = results?.recommendations || [];

  const riskLevel =
    riskScore > 70 ? "high" : riskScore > 40 ? "medium" : "low";

  const formatDateAndTime = (date) => {
    if (!date) return { dateStr: "Never", timeStr: "" };
    
    const now = new Date();
    const scanDate = new Date(date);
    const diffMs = now - scanDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let dateStr = "";
    if (diffMins < 1) {
      dateStr = "Just now";
    } else if (diffMins < 60) {
      dateStr = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      dateStr = `${diffHours}h ago`;
    } else if (diffDays < 7) {
      dateStr = `${diffDays}d ago`;
    } else {
      dateStr = scanDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    const timeStr = scanDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateAndTime(lastScannedDate);

  return (
    <div className="scan-screen">
      <div className="analysis-dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="title">Analysis Results</h1>
            <p className="muted">Scanned: {results?.email || "Unknown"}</p>
          </div>

          <div className="last-scanned-badge">
            <span className="badge-label">Last Scanned</span>
            <span className="badge-date">{dateStr}</span>
            {timeStr && <span className="badge-time">{timeStr}</span>}
          </div>
        </div>

        <div className="analysis-grid">
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
                {social.username && (
                  <p className="username">
                    <strong>Username:</strong> @{social.username}
                  </p>
                )}
                {social.bio && (
                  <p className="bio">
                    <strong>Bio:</strong> {social.bio}
                  </p>
                )}
                {social.company && (
                  <p className="company">
                    <strong>Company:</strong> {social.company}
                  </p>
                )}
                {social.location && (
                  <p className="location">
                    <strong>Location:</strong> {social.location}
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
              <p className="muted">
                {githubUsername
                  ? `GitHub profile not found or is private`
                  : "No GitHub username provided"}
              </p>
            )}
          </div>

          <div className="card center">
            <h2>Overall Risk Score</h2>
            
            <div className="risk-display-wrapper">
              <div className="ring-wrapper">
                <svg className="risk-svg" width="140" height="140" viewBox="0 0 220 220">
                  <defs>
                    <linearGradient id="riskGradientLow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="riskGradientMedium" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="riskGradientHigh" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                  <circle
                    className="risk-bg"
                    cx="110"
                    cy="110"
                    r="95"
                    strokeWidth="9"
                    fill="none"
                  />
                  <circle
                    className={`risk-progress ${riskLevel}`}
                    cx="110"
                    cy="110"
                    r="95"
                    strokeWidth="9"
                    fill="none"
                    strokeDasharray={597}
                    strokeDashoffset={597 * (1 - riskScore / 100)}
                  />
                </svg>

                <div className="risk-text">
                  <span className="risk-number">{riskScore}%</span>
                  <span className="risk-sub">EXPOSED</span>
                </div>
              </div>
              <span className={`risk-label ${riskLevel}`}>
                {riskLevel === "high"
                  ? "High Risk"
                  : riskLevel === "medium"
                  ? "Medium Risk"
                  : "Low Risk"}
              </span>
            </div>
          </div>
        </div>

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
                  <span className="action-badge">
                    {item.level === "high"
                      ? "Critical"
                      : item.level === "medium"
                      ? "Important"
                      : "Recommended"}
                  </span>

                  <div className="action-content">
                    <h3 className="action-title">{item.title}</h3>
                    <p className="action-description">{item.desc}</p>
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