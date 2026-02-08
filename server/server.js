import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== IMPROVED RISK CALCULATION & RECOMMENDATIONS =====

function calculateRiskScore(breaches, githubData, email) {
  let riskScore = 10;

  // ===== 1. BREACH ANALYSIS (40 points max) =====
  if (breaches && Array.isArray(breaches) && breaches.length > 0) {
    const breachCount = breaches.length;
    riskScore += Math.min(40, breachCount * 8);

    // FIXED: Convert breach items to strings safely
    const breachStrings = breaches.map(b => {
      if (typeof b === 'string') return b.toLowerCase();
      if (typeof b === 'object' && b !== null) {
        return JSON.stringify(b).toLowerCase();
      }
      return String(b).toLowerCase();
    });

    const hasPasswordBreach = breachStrings.some(b => 
      b.includes('password') || b.includes('credential')
    );
    if (hasPasswordBreach) {
      riskScore += 15;
    }

    const hasPIIBreach = breachStrings.some(b => 
      b.includes('ssn') || 
      b.includes('credit') ||
      b.includes('address') ||
      b.includes('phone')
    );
    if (hasPIIBreach) {
      riskScore += 10;
    }
  }

  // ===== 2. EMAIL PATTERN ANALYSIS (15 points max) =====
  const emailAnalysis = analyzeEmailPattern(email);
  riskScore += emailAnalysis.riskPoints;

  // ===== 3. GITHUB PROFILE EXPOSURE (25 points max) =====
  if (githubData && githubData.isPublic) {
    let gitHubRisk = 5;

    if (githubData.repos > 0) {
      gitHubRisk += Math.min(10, Math.floor(githubData.repos / 5));
    }

    if (githubData.followers > 100) {
      gitHubRisk += 5;
    }
    if (githubData.followers > 1000) {
      gitHubRisk += 5;
    }

    if (githubData.bio && githubData.bio.length > 0) {
      gitHubRisk += 2;
    }
    if (githubData.location && githubData.location.length > 0) {
      gitHubRisk += 2;
    }

    if (githubData.createdAt) {
      const accountAgeYears = (new Date() - new Date(githubData.createdAt)) / (365.25 * 24 * 60 * 60 * 1000);
      if (accountAgeYears > 5) {
        gitHubRisk += 3;
      }
    }

    riskScore += Math.min(25, gitHubRisk);
  }

  // ===== 4. REPUTATION FACTORS (10 points max) =====
  if (email) {
    const domain = email.split('@')[1];
    const publicDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const isPublicDomain = publicDomains.includes(domain);
    
    if (isPublicDomain) {
      riskScore += 5;
    }
  }

  // ===== 5. SECONDARY EXPOSURE (10 points max) =====
  if (githubData && githubData.isPublic && breaches && Array.isArray(breaches) && breaches.length > 0) {
    riskScore += 10;
  }

  return Math.min(100, Math.max(0, riskScore));
}

function analyzeEmailPattern(email) {
  let riskPoints = 0;
  const details = [];

  if (!email) return { riskPoints: 0, details: [] };

  const [localPart] = email.split('@');

  const commonPatterns = ['password', '123', '000', 'admin', 'user', 'test', 'guest'];
  const hasCommonPattern = commonPatterns.some(pattern => 
    localPart.toLowerCase().includes(pattern)
  );
  if (hasCommonPattern) {
    riskPoints += 5;
    details.push('Email contains common pattern');
  }

  if (/\d{3,}/.test(localPart)) {
    riskPoints += 3;
    details.push('Sequential numbers in email');
  }

  if (localPart.length > 12 && /[._-]/.test(localPart)) {
    riskPoints -= 2;
    details.push('Complex email format');
  }

  if (localPart.includes('+')) {
    riskPoints += 2;
    details.push('Plus addressing detected');
  }

  return { 
    riskPoints: Math.max(0, riskPoints), 
    details 
  };
}

function generateIntelligentRecommendations(breaches, githubData, email, riskScore) {
  const recommendations = [];

  // FIXED: Safely convert breaches to strings
  const breachStrings = [];
  if (Array.isArray(breaches)) {
    breachStrings.push(...breaches.map(b => {
      if (typeof b === 'string') return b;
      if (typeof b === 'object' && b !== null) return JSON.stringify(b);
      return String(b);
    }));
  }

  // ===== CRITICAL PRIORITY =====

  if (breachStrings.length > 0) {
    const passwordBreaches = breachStrings.filter(b => 
      b.toLowerCase().includes('password') || 
      b.toLowerCase().includes('credential')
    );
    
    if (passwordBreaches.length > 0) {
      recommendations.push({
        title: '🔴 URGENT: Change all passwords immediately',
        desc: `Your passwords were exposed in ${breachStrings.length} breach(es). Change passwords for all critical accounts (email, banking, social media).`,
        level: 'high',
        actionItems: [
          'Change email account password FIRST',
          'Update passwords for banking & financial accounts',
          'Change passwords for social media accounts',
          'Update passwords for work/corporate accounts'
        ]
      });
    } else {
      recommendations.push({
        title: '🔴 Data breach detected on your email',
        desc: `Your email was found in ${breachStrings.length} breach(es). Monitor account for suspicious activity.`,
        level: 'high',
        actionItems: [
          'Monitor your email for unusual activity',
          'Check bank statements for unauthorized charges',
          'Enable breach alerts on email account'
        ]
      });
    }
  }

  // PII exposure
  if (breachStrings.some(b => 
    b.toLowerCase().includes('ssn') || 
    b.toLowerCase().includes('credit') ||
    b.toLowerCase().includes('address')
  )) {
    recommendations.push({
      title: '🔴 Personal information exposed',
      desc: 'SSN, credit card, or address exposed. Monitor credit and consider fraud protection.',
      level: 'high',
      actionItems: [
        'Place fraud alert with credit bureaus',
        'Consider credit freeze at Equifax, Experian, TransUnion',
        'Monitor credit reports at annualcreditreport.com'
      ]
    });
  }

  // ===== HIGH PRIORITY =====

  if (breachStrings.length === 0) {
    recommendations.push({
      title: '🟡 Enable two-factor authentication (2FA)',
      desc: 'Protect your email with 2FA. Even if password is compromised, account stays secure.',
      level: 'high',
      actionItems: [
        'Enable 2FA on your primary email account',
        'Use authenticator app (Google Authenticator, Authy)',
        'Save backup codes in secure location'
      ]
    });
  }

  if (githubData && githubData.isPublic && githubData.repos > 0) {
    recommendations.push({
      title: '🟡 Audit GitHub repositories for secrets',
      desc: `You have ${githubData.repos} public repo(s). Check for exposed API keys, credentials, or .env files.`,
      level: 'high',
      actionItems: [
        'Search repos for .env files with secrets',
        'Enable GitHub secret scanning',
        'Remove API keys from commit history',
        'Make sensitive projects private'
      ]
    });
  }

  if (githubData && githubData.isPublic && githubData.followers > 500) {
    recommendations.push({
      title: '🟡 Review GitHub profile visibility',
      desc: 'Large following means your actions and data are visible. Review what you\'re exposing.',
      level: 'medium',
      actionItems: [
        'Review bio and location information',
        'Check pinned projects for sensitive data',
        'Monitor followers and following lists'
      ]
    });
  }

  // ===== MEDIUM PRIORITY =====

  recommendations.push({
    title: '🟢 Use a password manager',
    desc: 'Store unique, strong passwords for each service. Prevents breach damage from spreading.',
    level: 'medium',
    actionItems: [
      'Choose: Bitwarden (free), 1Password, LastPass, or KeePass',
      'Migrate existing passwords to manager',
      'Generate strong unique passwords for all accounts',
      'Use for all new account creation'
    ]
  });

  recommendations.push({
    title: '🟢 Strengthen email account security',
    desc: 'Email is the master key to all accounts. Protect it well.',
    level: 'medium',
    actionItems: [
      'Enable 2FA on email account',
      'Update recovery phone and backup email',
      'Check for unauthorized email forwarding rules',
      'Enable security alerts for login attempts'
    ]
  });

  if (breachStrings.length > 0) {
    recommendations.push({
      title: '🟢 Monitor for future breaches',
      desc: 'Set up alerts if your email appears in future data leaks.',
      level: 'medium',
      actionItems: [
        'Sign up for breach alert services (free)',
        'Periodically check haveibeenpwned.com',
        'Enable email provider\'s breach alerts',
        'Consider paid monitoring if PII exposed'
      ]
    });
  }

  if (riskScore > 60) {
    recommendations.push({
      title: '🟢 Reduce your digital footprint',
      desc: 'Minimize online exposure to reduce risk surface.',
      level: 'low',
      actionItems: [
        'Make GitHub repos private if not needed for portfolio',
        'Remove personal info from public profiles',
        'Opt out of data broker websites',
        'Use privacy email forwarding services'
      ]
    });
  }

  recommendations.push({
    title: '🟢 Regular security maintenance',
    desc: 'Make security checks a quarterly habit.',
    level: 'low',
    actionItems: [
      'Review login activity logs quarterly',
      'Update security questions and recovery info',
      'Remove unused accounts and old app permissions',
      'Audit which apps have access to your email'
    ]
  });

  recommendations.push({
    title: '🟢 Protect against phishing attacks',
    desc: 'Breaches often lead to phishing emails targeting your accounts.',
    level: 'low',
    actionItems: [
      'Be suspicious of "verify account" emails',
      'Never click links in emails - go to site directly',
      'Check sender email address carefully',
      'Enable Gmail phishing warnings'
    ]
  });

  return recommendations;
}

// ===== MongoDB Schema =====
const scanResultSchema = new mongoose.Schema({
  email: { type: String, required: true },
  githubUsername: { type: String },
  breaches: { type: [String], default: [] },
  riskScore: { type: Number, default: 20 },
  social: {
    followers: Number,
    repos: Number,
    isPublic: Boolean,
    profileUrl: String,
    bio: String,
    location: String,
    createdAt: Date,
  },
  recommendations: { type: Array, default: [] },
  scanTimestamp: { type: Date, default: Date.now },
});

const ScanResult = mongoose.model("ScanResult", scanResultSchema, "scanresults");

// ===== MongoDB Connection =====
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/digital_footprint_analyzer";

console.log("\n" + "=".repeat(70));
console.log("🚀 STARTING SERVER");
console.log("=".repeat(70));
console.log("📍 MongoDB URI:", MONGO_URI);

async function connectDB() {
  try {
    console.log("\n⏳ Attempting to connect to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });
    
    console.log("\n✅ MONGODB CONNECTED SUCCESSFULLY!");
    console.log("   Database:", mongoose.connection.name);
    return true;
  } catch (err) {
    console.error("\n❌ MONGODB CONNECTION FAILED!");
    console.error("   Error:", err.message);
    return false;
  }
}

// ===== Health Check =====
app.get("/", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "Server is running",
    mongodb: isConnected ? "✅ Connected" : "❌ Disconnected",
  });
});

// ===== POST: Scan Email =====
app.post("/api/check-email", async (req, res) => {
  try {
    const { email, githubUsername } = req.body || {};

    console.log("\n📧 NEW SCAN REQUEST");
    console.log("   Email:", email);
    console.log("   GitHub:", githubUsername || "(not provided)");

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    let breaches = [];

    // ---- LeakCheck API ----
    console.log("📡 Checking for breaches...");
    try {
      const leakCheckResponse = await fetch(
        `https://leakcheck.io/api/public?check=${email}`,
        {
          headers: {
            "X-API-Key": process.env.LEAKCHECK_API_KEY || "test-key",
          },
        }
      );
      const leakCheckData = await leakCheckResponse.json();
      
      if (leakCheckData.success && leakCheckData.found > 0) {
        // FIXED: Extract source names from LeakCheck response
        breaches = (leakCheckData.sources || []).map(src => {
          // If src is an object with 'name' property, get the name
          if (typeof src === 'object' && src !== null && src.name) {
            return src.name;
          }
          // If src is already a string, use it
          if (typeof src === 'string') {
            return src;
          }
          // Otherwise convert to string
          return String(src);
        });
        console.log("   ⚠️  Breaches found:", leakCheckData.found);
        console.log("   Sources:", breaches);
      } else {
        console.log("   ✓ No breaches detected");
      }
    } catch (err) {
      console.log("   ⚠️  LeakCheck API error:", err.message);
    }

    // ---- GitHub API ----
    console.log("📡 Checking GitHub profile...");
    let socialData = {
      followers: 0,
      repos: 0,
      isPublic: false,
      profileUrl: null,
      bio: null,
      location: null,
      createdAt: null,
    };

    if (githubUsername && githubUsername.trim()) {
      try {
        const headers = { "User-Agent": "Digital-Footprint-Analyzer" };
        if (process.env.GITHUB_TOKEN) {
          headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }

        const githubResponse = await fetch(
          `https://api.github.com/users/${githubUsername}`,
          { headers }
        );
        
        if (githubResponse.ok) {
          const githubData = await githubResponse.json();
          socialData = {
            followers: githubData.followers || 0,
            repos: githubData.public_repos || 0,
            isPublic: true,
            profileUrl: githubData.html_url,
            bio: githubData.bio,
            location: githubData.location,
            createdAt: githubData.created_at,
          };
          console.log("   ✓ GitHub profile found");
        } else {
          console.log("   ℹ️  GitHub profile not found or private");
        }
      } catch (err) {
        console.log("   ⚠️  GitHub API error:", err.message);
      }
    } else {
      console.log("   ℹ️  GitHub not provided");
    }

    // ===== USE IMPROVED CALCULATIONS =====
    const improvedRiskScore = calculateRiskScore(breaches, socialData, email);
    const recommendations = generateIntelligentRecommendations(breaches, socialData, email, improvedRiskScore);

    // ---- Response Object ----
    const scanTimestamp = new Date();
    const response = {
      email: email.trim(),
      githubUsername: githubUsername || "",
      breaches,
      riskScore: improvedRiskScore,
      social: socialData,
      recommendations,
      scanTimestamp,
    };

    console.log("📊 Risk Score:", response.riskScore, "| Recommendations:", response.recommendations.length);

    // ---- Save to MongoDB ----
    const isConnected = mongoose.connection.readyState === 1;
    
    if (isConnected) {
      try {
        const scanDoc = new ScanResult(response);
        await scanDoc.save();
        console.log("✅ Saved to database");
      } catch (dbError) {
        console.error("❌ Save failed:", dbError.message);
      }
    }

    res.json(response);

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).json({ 
      error: "Server error: " + err.message 
    });
  }
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message 
  });
});

// ===== Start Server =====
async function startServer() {
  const dbConnected = await connectDB();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("\n🌐 SERVER RUNNING on http://localhost:" + PORT);
    console.log("   MongoDB:", dbConnected ? "✅ Connected" : "❌ NOT CONNECTED");
    console.log("=".repeat(70) + "\n");
  });
}

startServer();