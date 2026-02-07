// backend/routes/scan.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

// Example endpoint: POST /scan
router.post("/scan", async (req, res) => {
  const { email, githubUsername } = req.body;

  try {
    // --------- LeakCheck ----------
    const leakCheckRes = await axios.get(
      `https://api.leakcheck.net/?email=${email}&key=YOUR_LEAKCHECK_KEY`
    );
    const leakResult = leakCheckRes.data.found ? "Exposed" : "Not Found";

    // --------- GitHub ----------
    let githubResult = {};
    try {
      const githubRes = await axios.get(
        `https://api.github.com/users/${githubUsername}`
      );
      githubResult = {
        exists: true,
        public_repos: githubRes.data.public_repos,
        followers: githubRes.data.followers,
        following: githubRes.data.following,
        bio: githubRes.data.bio,
        public_email: githubRes.data.email,
      };
    } catch {
      githubResult = { exists: false };
    }

    // --------- Risk Score ----------
    let riskScore = 0;
    if (leakResult === "Exposed") riskScore += 2;
    if (githubResult.exists) riskScore += 1;
    if (githubResult.public_email || githubResult.bio) riskScore += 1;

    let riskLevel = "Low";
    if (riskScore === 2) riskLevel = "Medium";
    if (riskScore >= 3) riskLevel = "High";

    // --------- Final Summary ----------
    const summary = {
      email,
      githubUsername,
      leakResult,
      githubResult,
      riskScore,
      riskLevel,
      recommendations: [
        leakResult === "Exposed" && "Change password for breached accounts",
        "Enable Two-Factor Authentication",
        githubResult.public_email && "Avoid sharing sensitive info publicly on GitHub",
      ].filter(Boolean),
      scanDate: new Date().toLocaleString(),
    };

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Scan failed" });
  }
});

module.exports = router;
