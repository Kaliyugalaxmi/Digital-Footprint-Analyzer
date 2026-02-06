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
  const [expandedProfile, setExpandedProfile] = useState(null);
  const [socialFilter, setSocialFilter] = useState("all");

  // Social media platform config with icons and colors
  const socialPlatforms = {
    github: {
      name: "GitHub",
      icon: "🐙",
      color: "#333333",
      bgGradient: "linear-gradient(135deg, #333333 0%, #555555 100%)",
      fields: ["followers", "repos", "bio", "profileUrl"],
      category: "developer",
    },
    twitter: {
      name: "Twitter/X",
      icon: "𝕏",
      color: "#000000",
      bgGradient: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
      fields: ["followers", "following", "tweets", "profileUrl"],
      category: "social",
    },
    linkedin: {
      name: "LinkedIn",
      icon: "💼",
      color: "#0A66C2",
      bgGradient: "linear-gradient(135deg, #0A66C2 0%, #0D5DB8 100%)",
      fields: ["connections", "headline", "bio", "profileUrl"],
      category: "professional",
    },
    facebook: {
      name: "Facebook",
      icon: "f",
      color: "#1877F2",
      bgGradient: "linear-gradient(135deg, #1877F2 0%, #0A66C2 100%)",
      fields: ["friends", "bio", "profileUrl"],
      category: "social",
    },
    instagram: {
      name: "Instagram",
      icon: "📷",
      color: "#E4405F",
      bgGradient: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 100%)",
      fields: ["followers", "posts", "bio", "profileUrl"],
      category: "social",
    },
    reddit: {
      name: "Reddit",
      icon: "🤖",
      color: "#FF4500",
      bgGradient: "linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)",
      fields: ["karma", "postCount", "bio", "profileUrl"],
      category: "community",
    },
    stackoverflow: {
      name: "Stack Overflow",
      icon: "◻️",
      color: "#F48024",
      bgGradient: "linear-gradient(135deg, #F48024 0%, #FF7A00 100%)",
      fields: ["reputation", "answers", "profileUrl"],
      category: "developer",
    },
    tiktok: {
      name: "TikTok",
      icon: "♪",
      color: "#000000",
      bgGradient: "linear-gradient(135deg, #000000 0%, #25F4EE 100%)",
      fields: ["followers", "videos", "bio", "profileUrl"],
      category: "social",
    },
    youtube: {
      name: "YouTube",
      icon: "▶️",
      color: "#FF0000",
      bgGradient: "linear-gradient(135deg, #FF0000 0%, #CC0000 100%)",
      fields: ["subscribers", "videos", "bio", "profileUrl"],
      category: "social",
    },
    pinterest: {
      name: "Pinterest",
      icon: "📌",
      color: "#E60023",
      bgGradient: "linear-gradient(135deg, #E60023 0%, #AD081B 100%)",
      fields: ["followers", "pins", "bio", "profileUrl"],
      category: "social",
    },
  };

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
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
        console.log("API Response:", data);

        if (!response.ok) {
          throw new Error(data.error || "Analysis failed");
        }

        setTimeout(() => {
          setResults(data);
          setIsScanning(false);
        }, 3000);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
        setIsScanning(false);
      }
    };

    fetchAnalysis();
  }, [email, githubUsername]);

  /* Filter discovered social profiles */
  const getDiscoveredProfiles = () => {
    if (!results?.socialMedia) return [];
    return Object.entries(results.socialMedia)
      .filter(([_, profile]) => profile && profile.found)
      .map(([platform, profile]) => ({
        platform,
        ...profile,
      }));
  };

  const discoveredProfiles = getDiscoveredProfiles();

  /* Filter profiles by category */
  const getFilteredProfiles = () => {
    if (socialFilter === "all") return discoveredProfiles;
    return discoveredProfiles.filter(
      (p) => socialPlatforms[p.platform]?.category === socialFilter
    );
  };

  const filteredProfiles = getFilteredProfiles();

  /* Calculate social exposure score */
  const calculateSocialExposure = () => {
    let exposureScore = 0;
    discoveredProfiles.forEach(({ ...profile }) => {
      if (profile.isPublic) exposureScore += 20;
      if (profile.followers && profile.followers > 100) exposureScore += 15;
      if (profile.verified) exposureScore += 10;
    });
    return Math.min(exposureScore, 100);
  };

  const socialExposure = calculateSocialExposure();

  /* Get platform statistics */
  const getPlatformStats = () => {
    const stats = {
      total: discoveredProfiles.length,
      public: discoveredProfiles.filter((p) => p.isPublic).length,
      verified: discoveredProfiles.filter((p) => p.verified).length,
      totalFollowers: discoveredProfiles.reduce(
        (sum, p) => sum + (p.followers || 0),
        0
      ),
    };
    return stats;
  };

  const platformStats = getPlatformStats();

  /* Social Profile Card Component */
  const SocialProfileCard = ({ profile, platform, config }) => {
    const isExpanded = expandedProfile === platform;

    return (
      <div
        key={platform}
        className={`social-profile-card ${isExpanded ? "expanded" : ""}`}
        style={{
          backgroundImage: config.bgGradient,
        }}
        onClick={() =>
          setExpandedProfile(isExpanded ? null : platform)
        }
      >
        {/* Card Header */}
        <div className="social-card-header">
          <div className="social-icon">{config.icon}</div>
          <div className="social-info">
            <h3>{config.name}</h3>
            {profile.profileUrl && (
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                onClick={(e) => e.stopPropagation()}
              >
                View Profile →
              </a>
            )}
          </div>
          <div className="expand-indicator">
            {isExpanded ? "−" : "+"}
          </div>
        </div>

        {/* Card Details (Collapsible) */}
        {isExpanded && (
          <div className="social-card-details">
            {/* Stats Grid */}
            <div className="stats-grid">
              {profile.followers !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">👥</span>
                  <div>
                    <span className="stat-value">
                      {profile.followers.toLocaleString()}
                    </span>
                    <span className="stat-label">Followers</span>
                  </div>
                </div>
              )}
              {profile.following !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">➡️</span>
                  <div>
                    <span className="stat-value">
                      {profile.following.toLocaleString()}
                    </span>
                    <span className="stat-label">Following</span>
                  </div>
                </div>
              )}
              {profile.repos !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">📦</span>
                  <div>
                    <span className="stat-value">
                      {profile.repos.toLocaleString()}
                    </span>
                    <span className="stat-label">Repos</span>
                  </div>
                </div>
              )}
              {profile.tweets !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">📝</span>
                  <div>
                    <span className="stat-value">
                      {profile.tweets.toLocaleString()}
                    </span>
                    <span className="stat-label">Tweets</span>
                  </div>
                </div>
              )}
              {profile.posts !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">📸</span>
                  <div>
                    <span className="stat-value">
                      {profile.posts.toLocaleString()}
                    </span>
                    <span className="stat-label">Posts</span>
                  </div>
                </div>
              )}
              {profile.connections !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">🔗</span>
                  <div>
                    <span className="stat-value">
                      {profile.connections.toLocaleString()}
                    </span>
                    <span className="stat-label">Connections</span>
                  </div>
                </div>
              )}
              {profile.karma !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">⭐</span>
                  <div>
                    <span className="stat-value">
                      {profile.karma.toLocaleString()}
                    </span>
                    <span className="stat-label">Karma</span>
                  </div>
                </div>
              )}
              {profile.reputation !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">🏆</span>
                  <div>
                    <span className="stat-value">
                      {profile.reputation.toLocaleString()}
                    </span>
                    <span className="stat-label">Reputation</span>
                  </div>
                </div>
              )}
              {profile.videos !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">🎬</span>
                  <div>
                    <span className="stat-value">
                      {profile.videos.toLocaleString()}
                    </span>
                    <span className="stat-label">Videos</span>
                  </div>
                </div>
              )}
              {profile.subscribers !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">📺</span>
                  <div>
                    <span className="stat-value">
                      {profile.subscribers.toLocaleString()}
                    </span>
                    <span className="stat-label">Subscribers</span>
                  </div>
                </div>
              )}
              {profile.pins !== undefined && (
                <div className="stat-item">
                  <span className="stat-icon">📍</span>
                  <div>
                    <span className="stat-value">
                      {profile.pins.toLocaleString()}
                    </span>
                    <span className="stat-label">Pins</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="profile-bio">
                <p>
                  <strong>Bio:</strong> {profile.bio}
                </p>
              </div>
            )}

            {/* Headline */}
            {profile.headline && (
              <div className="profile-bio">
                <p>
                  <strong>Headline:</strong> {profile.headline}
                </p>
              </div>
            )}

            {/* Details */}
            <div className="profile-details">
              {profile.location && (
                <div className="profile-detail">
                  <span className="detail-label">📍 Location:</span>
                  <span>{profile.location}</span>
                </div>
              )}

              {profile.joined && (
                <div className="profile-detail">
                  <span className="detail-label">📅 Joined:</span>
                  <span>{profile.joined}</span>
                </div>
              )}

              {profile.isPublic !== undefined && (
                <div className="profile-detail">
                  <span className="detail-label">🔓 Privacy:</span>
                  <span>
                    {profile.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              )}
            </div>

            {/* Verified Badge */}
            {profile.verified && (
              <div className="verified-badge">✓ Verified Account</div>
            )}

            {/* Privacy Status */}
            {profile.isPublic && (
              <div className="privacy-status public">
                🔓 This profile is publicly visible
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* Social Media Grid */
  const getSocialMediaMap = () => {
    if (filteredProfiles.length === 0) {
      return (
        <div className="no-profiles-placeholder">
          <p className="muted">
            {socialFilter === "all"
              ? "No social profiles detected"
              : `No ${socialFilter} profiles detected`}
          </p>
        </div>
      );
    }

    return (
      <div className="social-profiles-container">
        {filteredProfiles.map(({ platform, ...profile }) => (
          <SocialProfileCard
            key={platform}
            profile={profile}
            platform={platform}
            config={socialPlatforms[platform] || {
              name: platform,
              icon: "🔗",
              color: "#666",
              bgGradient: "linear-gradient(135deg, #666 0%, #888 100%)",
            }}
          />
        ))}
      </div>
    );
  };

  /* Category Filter Buttons */
  const getCategoryButtons = () => {
    const categories = [
      { value: "all", label: "All Platforms" },
      { value: "social", label: "Social Media" },
      { value: "professional", label: "Professional" },
      { value: "developer", label: "Developer" },
      { value: "community", label: "Community" },
    ];

    return categories.map((cat) => (
      <button
        key={cat.value}
        className={`filter-btn ${socialFilter === cat.value ? "active" : ""}`}
        onClick={() => setSocialFilter(cat.value)}
      >
        {cat.label}
      </button>
    ));
  };

  /* Exposure Risk Indicator */
  const ExposureIndicator = () => {
    let riskLevel = "low";
    let riskColor = "#44FF44";

    if (socialExposure > 60) {
      riskLevel = "high";
      riskColor = "#FF4444";
    } else if (socialExposure > 30) {
      riskLevel = "medium";
      riskColor = "#FFA500";
    }

    return (
      <div className="exposure-meter-card">
        <div className="exposure-header">
          <h3>Digital Exposure Risk</h3>
          <span className={`exposure-level ${riskLevel}`}>
            {riskLevel === "high"
              ? "🔴 High"
              : riskLevel === "medium"
              ? "🟡 Moderate"
              : "🟢 Low"}
          </span>
        </div>
        <div className="exposure-bar">
          <div
            className="exposure-fill"
            style={{
              width: `${socialExposure}%`,
              backgroundColor: riskColor,
            }}
          ></div>
        </div>
        <p className="exposure-text">
          {socialExposure}% exposure across {discoveredProfiles.length}{" "}
          discovered profiles
        </p>
      </div>
    );
  };

  /* Platform Overview Stats */
  const PlatformOverview = () => {
    return (
      <div className="platform-overview">
        <div className="overview-stat">
          <div className="stat-icon-large">🌐</div>
          <div className="stat-info">
            <span className="stat-value">{platformStats.total}</span>
            <span className="stat-label">Profiles Found</span>
          </div>
        </div>
        <div className="overview-stat">
          <div className="stat-icon-large">🔓</div>
          <div className="stat-info">
            <span className="stat-value">{platformStats.public}</span>
            <span className="stat-label">Public Profiles</span>
          </div>
        </div>
        <div className="overview-stat">
          <div className="stat-icon-large">✓</div>
          <div className="stat-info">
            <span className="stat-value">{platformStats.verified}</span>
            <span className="stat-label">Verified Accounts</span>
          </div>
        </div>
        <div className="overview-stat">
          <div className="stat-icon-large">👥</div>
          <div className="stat-info">
            <span className="stat-value">
              {(platformStats.totalFollowers / 1000).toFixed(1)}K
            </span>
            <span className="stat-label">Total Followers</span>
          </div>
        </div>
      </div>
    );
  };

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
            <span>✔ Mapping social presence</span>
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

  /* RESULTS UI */
  return (
    <div className="scan-screen">
      <div className="analysis-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="title">Analysis Results</h1>
          <p className="muted">Scanned: {results?.email || "Unknown"}</p>
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

        {/* SOCIAL MEDIA MAPPING SECTION */}
        {discoveredProfiles.length > 0 && (
          <div className="social-mapping-section">
            {/* Section Header */}
            <div className="section-header">
              <h2>Social Media Mapping</h2>
              <p className="muted">
                {discoveredProfiles.length} profile(s) discovered across the
                web
              </p>
            </div>

            {/* Platform Overview Stats */}
            <PlatformOverview />

            {/* Exposure Meter */}
            <ExposureIndicator />

            {/* Filter Buttons */}
            <div className="filter-controls">
              <span className="filter-label">Filter by:</span>
              {getCategoryButtons()}
            </div>

            {/* Social Profiles Grid */}
            {getSocialMediaMap()}
          </div>
        )}

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