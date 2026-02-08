import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section id="hero" style={styles.hero}>
      <span style={styles.badge}>NEW · Digital Exposure Monitoring</span>

      <h1 style={styles.heading}>
        Take Control of Your <br />
        <span style={styles.highlight}>Digital Shadow</span>
      </h1>

      <p style={styles.subheading}>
        Analyze your online presence and reclaim your privacy.
        Identify risks, exposures, and take action instantly.
      </p>

      <div style={styles.buttons}>
        <button
          style={styles.primary}
          onClick={() => navigate("/scan")}
        >
          Start Free Scan
        </button>

        <button style={styles.secondary}>View Demo</button>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    paddingLeft: "40px",
    paddingRight: "40px",
    background: "linear-gradient(135deg, #050816, #0f1c2f)",
    color: "white",
    position: "relative",
    overflow: "hidden"
  },
  badge: {
    fontSize: "12px",
    padding: "6px 14px",
    borderRadius: "20px",
    background: "#0f1c2f",
    marginBottom: "20px",
    letterSpacing: "0.5px",
    fontWeight: "500"
  },
  heading: {
    fontSize: "clamp(42px, 7vw, 68px)",
    fontWeight: "780",
    lineHeight: "1.2",
    margin: "20px 0",
    maxWidth: "700px"
  },
  highlight: {
    color: "#4f8cff"
  },
  subheading: {
    fontSize: "18px",
    lineHeight: "1.6",
    maxWidth: "600px",
    marginTop: "10px",
    color: "#ccc"
  },
  buttons: {
    marginTop: "30px",
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  primary: {
    padding: "14px 36px",
    borderRadius: "30px",
    background: "#1e90ff",
    border: "none",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 5px 15px rgba(30,144,255,0.3)"
  },
  secondary: {
    padding: "14px 36px",
    borderRadius: "30px",
    background: "transparent",
    border: "1px solid #4f8cff",
    color: "#4f8cff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s"
  }
};