import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

// ✅ FIX: Explicitly specify collection name as "scanresults"
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
    console.log("   This may take a few seconds...");
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });
    
    console.log("\n✅✅✅ MONGODB CONNECTED SUCCESSFULLY! ✅✅✅");
    console.log("   Database:", mongoose.connection.name);
    console.log("   Host:", mongoose.connection.host);
    console.log("   Port:", mongoose.connection.port);
    console.log("   Connection State:", mongoose.connection.readyState, "(1 = connected)");
    
    // List existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("   Collections:", collections.map(c => c.name).join(", ") || "(none yet)");
    
    return true;
  } catch (err) {
    console.error("\n❌❌❌ MONGODB CONNECTION FAILED! ❌❌❌");
    console.error("   Error:", err.message);
    console.error("   Error Code:", err.code);
    console.error("   Error Name:", err.name);
    console.error("\n🔧 TROUBLESHOOTING:");
    console.error("   1. Check your MONGO_URI in .env file");
    console.error("      → For Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname");
    console.error("      → For Local: mongodb://localhost:27017/dbname");
    console.error("\n   2. If using MongoDB Atlas:");
    console.error("      → Whitelist your IP in Atlas Security Settings");
    console.error("      → Check username/password are correct");
    console.error("      → Ensure database user has proper permissions");
    console.error("\n   3. If using Local MongoDB:");
    console.error("      → Windows: Run 'net start MongoDB' as Admin");
    console.error("      → Mac: Run 'brew services start mongodb-community'");
    console.error("      → Linux: Run 'sudo systemctl start mongod'");
    console.error("\n⚠️  Server will start but WILL NOT SAVE DATA to database!");
    console.error("=".repeat(70) + "\n");
    return false;
  }
}

// ===== Health Check =====
app.get("/", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "Server is running",
    mongodb: isConnected ? "✅ Connected" : "❌ Disconnected",
    database: mongoose.connection.name || "N/A",
    message: isConnected 
      ? "Ready to scan!" 
      : "⚠️ MongoDB not connected - data will not be saved!"
  });
});

// ===== POST: Scan Email =====
app.post("/api/check-email", async (req, res) => {
  const { email, githubUsername } = req.body || {};

  console.log("\n" + "▼".repeat(70));
  console.log("📧 NEW SCAN REQUEST");
  console.log("   Email:", email);
  console.log("   GitHub:", githubUsername || "(not provided)");
  console.log("   Time:", new Date().toLocaleString());

  if (!email) {
    console.log("❌ Rejected: No email provided");
    return res.status(400).json({ error: "Email is required" });
  }

  let breaches = [];
  let baseRiskScore = 20;

  // ---- LeakCheck API ----
  console.log("\n📡 Checking for breaches...");
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
      breaches = leakCheckData.sources.map((src) => `${src} (breach detected)`);
      baseRiskScore = Math.min(90, 20 + leakCheckData.found * 15);
      console.log("   ⚠️  Breaches found:", leakCheckData.found);
    } else {
      console.log("   ✓ No breaches detected");
    }
  } catch (err) {
    console.log("   ⚠️  LeakCheck API error:", err.message);
  }

  // ---- GitHub API ----
  console.log("\n📡 Checking GitHub profile...");
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
        console.log("   ✓ Profile found:", githubData.login);
        console.log("     Repos:", socialData.repos, "| Followers:", socialData.followers);
        
        if (githubData.public_repos > 10) baseRiskScore += 5;
        if (githubData.public_repos > 20) baseRiskScore += 5;
      } else {
        console.log("   ℹ️  Profile not found or private");
      }
    } catch (err) {
      console.log("   ⚠️  GitHub API error:", err.message);
    }
  } else {
    console.log("   ℹ️  Skipped (no username provided)");
  }

  // ---- Generate Recommendations ----
  const recommendations = generateRecommendations(
    breaches.length,
    socialData.isPublic,
    baseRiskScore
  );

  // ---- Response Object ----
  const scanTimestamp = new Date();
  const response = {
    email: email.trim(),
    githubUsername: githubUsername || "",
    breaches,
    riskScore: Math.min(100, baseRiskScore),
    social: socialData,
    recommendations,
    scanTimestamp,
  };

  console.log("\n📊 Analysis complete - Risk Score:", response.riskScore);

  // ---- Save to MongoDB ====
  console.log("\n💾 SAVING TO DATABASE...");
  
  const isConnected = mongoose.connection.readyState === 1;
  
  if (!isConnected) {
    console.log("❌❌❌ CANNOT SAVE - MONGODB NOT CONNECTED! ❌❌❌");
    console.log("   Connection State:", mongoose.connection.readyState);
    console.log("   (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)");
    console.log("\n⚠️  Data will be sent to frontend but NOT saved to database!");
    console.log("⚠️  Please check MongoDB connection and restart server.");
  } else {
    try {
      console.log("   ✓ MongoDB is connected");
      console.log("   ✓ Creating document...");
      
      // VALIDATE DATA BEFORE SAVING
      const scanDoc = new ScanResult(response);
      const validationError = scanDoc.validateSync();
      
      if (validationError) {
        console.error("\n❌ VALIDATION ERROR!");
        console.error("   ", validationError.message);
        throw validationError;
      }
      
      console.log("   ✓ Data validated successfully");
      console.log("   ✓ Saving to collection:", ScanResult.collection.name);
      
      // SAVE WITH ERROR HANDLING
      const savedDoc = await scanDoc.save();
      
      console.log("\n✅✅✅ SAVED TO DATABASE! ✅✅✅");
      console.log("   Document ID:", savedDoc._id);
      console.log("   Email:", savedDoc.email);
      console.log("   Risk Score:", savedDoc.riskScore);
      console.log("   GitHub:", savedDoc.githubUsername || "(none)");
      console.log("   Collection:", ScanResult.collection.name);
      console.log("   Database:", mongoose.connection.name);
      
      // VERIFY IT WAS SAVED
      const count = await ScanResult.countDocuments();
      console.log("   Total documents in database:", count);
      
      // VERIFY WE CAN RETRIEVE IT
      const retrievedDoc = await ScanResult.findById(savedDoc._id);
      if (retrievedDoc) {
        console.log("   ✓ Document verified - found in database!");
      } else {
        console.log("   ⚠️  Warning: Document saved but cannot be retrieved!");
      }
      
    } catch (dbError) {
      console.error("\n❌ SAVE FAILED!");
      console.error("   Error:", dbError.message);
      console.error("   Error Code:", dbError.code);
      console.error("   Error Name:", dbError.name);
      
      if (dbError.name === "ValidationError") {
        console.error("   Validation Details:", dbError.errors);
      }
      
      if (dbError.message.includes("E11000")) {
        console.error("   This is a duplicate key error - check unique fields");
      }
      
      console.error("   Full error:", dbError);
    }
  }

  console.log("▲".repeat(70) + "\n");
  res.json(response);
});

// ===== Recommendations Generator =====
function generateRecommendations(breachCount, isPublic, riskScore) {
  const recommendations = [];

  if (breachCount > 0)
    recommendations.push({
      title: "Change compromised passwords immediately",
      desc: `Your email was found in ${breachCount} breach(es). Update passwords.`,
      level: "high",
    });

  recommendations.push({
    title: "Enable two-factor authentication (2FA)",
    desc: "Add extra security layer.",
    level: "medium",
  });

  recommendations.push({
    title: "Use a password manager",
    desc: "Generate and store strong passwords.",
    level: "low",
  });

  if (isPublic)
    recommendations.push({
      title: "Review GitHub repository visibility",
      desc: "Ensure no sensitive data is exposed.",
      level: "medium",
    });

  if (riskScore > 60)
    recommendations.push({
      title: "Monitor your credit",
      desc: "Detect suspicious activity.",
      level: "medium",
    });

  recommendations.push({
    title: "Update recovery information",
    desc: "Keep recovery email and phone current.",
    level: "low",
  });

  recommendations.push({
    title: "Check account activity logs",
    desc: "Review login history regularly.",
    level: "low",
  });

  return recommendations;
}

// ===== Start Server =====
async function startServer() {
  const dbConnected = await connectDB();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("\n" + "=".repeat(70));
    console.log("🌐 SERVER IS RUNNING");
    console.log("=".repeat(70));
    console.log("   URL: http://localhost:" + PORT);
    console.log("   MongoDB:", dbConnected ? "✅ Connected" : "❌ NOT CONNECTED");
    console.log("   Status: Open http://localhost:" + PORT + " in browser");
    
    if (!dbConnected) {
      console.log("\n   ⚠️⚠️⚠️  WARNING  ⚠️⚠️⚠️");
      console.log("   Data will NOT be saved to database!");
      console.log("   Please check your MONGO_URI and restart this server.");
    }
    
    console.log("=".repeat(70) + "\n");
  });
}

startServer();