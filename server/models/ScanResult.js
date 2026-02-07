import mongoose from "mongoose";

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

const ScanResult = mongoose.model("ScanResult", scanResultSchema);

export default ScanResult;
