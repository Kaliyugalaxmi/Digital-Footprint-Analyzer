import React from "react";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      {/* Logo on the left */}
      <div style={styles.logo}>
        <span>🟦</span> Digital Footprint Check
      </div>

      {/* Section links on the right */}
      <div style={styles.links}>
        <a href="#hero" style={styles.link}>Home</a>
        <a href="#problems" style={styles.link}>Problems</a>
        <a href="#features" style={styles.link}>Features</a>
        <a href="#footer" style={styles.link}>Contact</a>
        <button style={styles.button}>Get Started</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    background: "#050816",
    color: "white",
    position: "fixed",
    width: "100%",
    top: 0,
    zIndex: 1000
  },
  logo: {
    fontWeight: "700",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  links: {
    display: "flex",
    gap: "20px",
    alignItems: "center" // ensures button aligns with links
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "500",
    cursor: "pointer"
  },
  button: {
    background: "#1e90ff",
    border: "none",
    padding: "10px 24px",
    borderRadius: "24px",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  }
};
