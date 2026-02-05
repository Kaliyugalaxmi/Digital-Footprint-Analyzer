import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ===============================
// Health check
// ===============================
app.get("/", (req, res) => {
  res.send("Digital Footprint Analyzer API running");
});

// ===============================
// Email breach check + GitHub profile
// ===============================
app.post("/api/check-email", async (req, res) => {
  const { email, githubUsername } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // ===== LeakCheck API Call =====
    const leakCheckResponse = await fetch(
      `https://leakcheck.io/api/public?check=${email}`,
      {
        headers: {
          "X-API-Key": process.env.LEAKCHECK_API_KEY,
        },
      }
    );

    const leakCheckData = await leakCheckResponse.json();

    let breaches = [];
    let baseRiskScore = 20;

    // Handle LeakCheck response
    if (leakCheckData.success && leakCheckData.found > 0) {
      breaches = leakCheckData.sources.map((source) => {
        return `${source} (breach detected)`;
      });

      baseRiskScore = Math.min(90, 20 + leakCheckData.found * 15);
    }

    // ===== GitHub API Call (if username provided) =====
    let socialData = {
      followers: 0,
      repos: 0,
      isPublic: false,
      platforms: [],
      profileUrl: null,
      bio: null,
      location: null,
    };

    if (githubUsername && githubUsername.trim()) {
      try {
        const githubHeaders = {
          "User-Agent": "Digital-Footprint-Analyzer",
        };

        // Add GitHub token if available for higher rate limits
        if (process.env.GITHUB_TOKEN) {
          githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const githubResponse = await fetch(
          `https://api.github.com/users/${encodeURIComponent(githubUsername)}`,
          { headers: githubHeaders }
        );

        if (githubResponse.ok) {
          const githubData = await githubResponse.json();

          socialData = {
            followers: githubData.followers || 0,
            repos: githubData.public_repos || 0,
            isPublic: true,
            platforms: ["GitHub"],
            profileUrl: githubData.html_url,
            bio: githubData.bio,
            location: githubData.location,
            createdAt: githubData.created_at,
          };

          console.log(`✅ GitHub data for ${githubUsername}:`, {
            followers: githubData.followers,
            public_repos: githubData.public_repos,
            profile_url: githubData.html_url,
          });

          // Adjust risk score based on public repos exposure
          if (githubData.public_repos > 10) {
            baseRiskScore += 5;
          }
          if (githubData.public_repos > 20) {
            baseRiskScore += 5;
          }
        } else {
          console.warn(`GitHub user ${githubUsername} not found or error occurred`);
        }
      } catch (githubError) {
        console.error("GitHub API Error:", githubError.message);
        // Continue without GitHub data if API fails
      }
    }

    // ===== Generate Recommendations =====
    const recommendations = generateRecommendations(
      breaches.length,
      socialData.isPublic,
      baseRiskScore
    );

    res.json({
      email,
      breaches,
      riskScore: Math.min(100, baseRiskScore),
      social: socialData,
      recommendations,
    });
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ 
      error: "Failed to analyze digital footprint",
      details: error.message 
    });
  }
});

// ===============================
// Generate smart recommendations
// ===============================
function generateRecommendations(breachCount, isPublic, riskScore) {
  const recommendations = [];

  // Always include these common recommendations (in order of importance)
  if (breachCount > 0) {
    recommendations.push({
      title: "🔴 Change compromised passwords immediately",
      desc: `Your email was found in ${breachCount} breach(es). Update passwords for all affected accounts right away.`,
      level: "critical",
    });
  }

  recommendations.push({
    title: "Enable two-factor authentication (2FA)",
    desc: "Add an extra security layer to your accounts with 2FA on email, GitHub, banking, and social media.",
    level: "warning",
  });

  recommendations.push({
    title: "Use a password manager",
    desc: "Generate and store unique, strong passwords for each account using a reputable password manager.",
    level: "info",
  });

  if (isPublic) {
    recommendations.push({
      title: "Review public profile visibility",
      desc: "Make sure sensitive personal information is private on your public profiles and social accounts.",
      level: "warning",
    });
  }

  recommendations.push({
    title: "Keep software updated",
    desc: "Regularly update your OS, browsers, and applications to patch security vulnerabilities.",
    level: "info",
  });

  if (riskScore > 60) {
    recommendations.push({
      title: "Monitor your credit",
      desc: "Use credit monitoring services to detect suspicious activity and identity theft early.",
      level: "warning",
    });

    recommendations.push({
      title: "Review app permissions",
      desc: "Audit and revoke unnecessary access for third-party applications connected to your accounts.",
      level: "warning",
    });
  }

  recommendations.push({
    title: "Update recovery information",
    desc: "Ensure your account recovery email and phone number are current and secure.",
    level: "info",
  });

  recommendations.push({
    title: "Check account activity logs",
    desc: "Regularly review login history and connected devices on your important accounts.",
    level: "info",
  });

  return recommendations;
}

// ===============================
// Server start
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});