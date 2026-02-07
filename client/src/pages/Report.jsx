import React from "react";

const SummaryReport = ({ summary }) => {
  if (!summary) return <p>Scan results will appear here...</p>;

  const { email, githubUsername, leakResult, githubResult, riskScore, riskLevel, recommendations, scanDate } = summary;

  const riskColor = {
    Low: "green",
    Medium: "orange",
    High: "red",
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", maxWidth: "600px" }}>
      <h2>Digital Footprint Summary Report</h2>
      <p><strong>Scan Date:</strong> {scanDate}</p>
      <hr />

      <h3>Email Scan (LeakCheck)</h3>
      <p>Status: <strong>{leakResult}</strong></p>

      <h3>GitHub Profile</h3>
      {githubResult.exists ? (
        <>
          <p>Username exists ✅</p>
          <p>Public Repos: {githubResult.public_repos}</p>
          <p>Followers: {githubResult.followers}, Following: {githubResult.following}</p>
          {githubResult.bio && <p>Bio: {githubResult.bio}</p>}
          {githubResult.public_email && <p>Public Email: {githubResult.public_email}</p>}
        </>
      ) : (
        <p>Username not found ❌</p>
      )}

      <h3>Risk Analysis</h3>
      <p>
        Score: <strong>{riskScore}</strong> | Level: <strong style={{ color: riskColor[riskLevel] }}>{riskLevel}</strong>
      </p>

      <h3>Recommendations</h3>
      <ul>
        {recommendations.length > 0 ? recommendations.map((r, i) => <li key={i}>{r}</li>) : <li>No recommendations</li>}
      </ul>
    </div>
  );
};

export default SummaryReport;
