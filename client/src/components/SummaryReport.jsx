import "./SummaryReport.css";


export default function SummaryReport({ summary }) {
  const {
    email,
    breaches,
    github,
    riskScore,
    riskLevel,
    recommendations,
    scanDate,
  } = summary;

  const riskColor =
    riskLevel === "High"
      ? "#ef4444"
      : riskLevel === "Medium"
      ? "#f59e0b"
      : "#22c55e";

  return (
    <div className="report-wrapper">
      {/* HEADER */}
      <div className="report-header">
        <div>
          <h1>Digital Footprint Report</h1>
          <p>Scanned {email}</p>
        </div>

        <div className="scan-badge">
          <span>LAST SCAN</span>
          <strong>{scanDate}</strong>
        </div>
      </div>

      {/* GRID */}
      <div className="report-grid">

        {/* EMAIL CARD */}
        <div className="report-card">
          <h2>📧 Email Security</h2>
          {breaches.length > 0 ? (
            <div className="status danger">
              ⚠ Found in {breaches.length} breach(s)
            </div>
          ) : (
            <div className="status safe">
              ✅ No Breaches Found
            </div>
          )}
        </div>

        {/* GITHUB CARD */}
        <div className="report-card">
          <h2>🐙 GitHub Exposure</h2>
          {github.exists ? (
            <>
              <div className="github-stats">
                <div>
                  <span>{github.repos}</span>
                  <p>Repos</p>
                </div>
                <div>
                  <span>{github.followers}</span>
                  <p>Followers</p>
                </div>
              </div>
              <p className="bio">{github.bio}</p>
            </>
          ) : (
            <p>No GitHub profile found</p>
          )}
        </div>

        {/* RISK CARD */}
        <div className="report-card risk-card">
          <h2>🛡 Risk Score</h2>
          <div className="risk-circle" style={{ borderColor: riskColor }}>
            <span>{riskScore}</span>
          </div>
          <p style={{ color: riskColor }}>{riskLevel} Risk</p>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="recommendations">
        <h2>🔐 Security Recommendations</h2>
        <ul>
          {recommendations.map((rec, i) => (
            <li key={i}>✔ {rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
