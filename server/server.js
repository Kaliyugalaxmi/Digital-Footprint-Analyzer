const express = require("express");
const fetch = require("node-fetch"); // npm install node-fetch
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// API endpoint to check email breaches
app.post("/api/check-breach", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const response = await fetch(
      `https://leakcheck.net/api/public?check=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch breach info" });
    }

    const data = await response.json();
    // Make sure the response has consistent fields
    const formatted = {
      pwned: data.pwned || false,
      breaches: Array.isArray(data.breaches)
        ? data.breaches.map((b) => ({
            source: b.source || b.site || "Unknown",
            domain: b.domain || "Unknown",
            breach_date: b.breach_date || b.date || "Unknown",
            data_exposed: b.data_exposed || b.fields || [],
            description: b.description || b.details || "",
          }))
        : [],
    };

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
