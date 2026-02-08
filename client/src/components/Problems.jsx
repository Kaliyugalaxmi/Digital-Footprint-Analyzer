export default function Problems() {
  return (
    <section id="problems" style={styles.section}>
      <h2 style={styles.heading}>Problems We Solve</h2>
      <p style={styles.subheading}>
        Common digital risks that often go unnoticed — until it's too late.
      </p>

      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.icon}>❌</div>
          <h3 style={styles.title}>Oversharing Online</h3>
          <p style={styles.text}>
            Public posts and profiles expose more personal data than you realize.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>🪪</div>
          <h3 style={styles.title}>Identity Theft</h3>
          <p style={styles.text}>
            Attackers combine public data to impersonate or misuse your identity.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>🕵️</div>
          <h3 style={styles.title}>Fake Profiles</h3>
          <p style={styles.text}>
            Your name and photos can be reused to create fraudulent accounts.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>👔</div>
          <h3 style={styles.title}>Recruiter Red Flags</h3>
          <p style={styles.text}>
            Outdated or unprofessional content can impact job opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    minHeight: "100vh",
    padding: "0 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#050816",
    color: "white",
    textAlign: "center"
  },
  heading: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "700",
    marginBottom: "12px"
  },
  subheading: {
    maxWidth: "600px",
    fontSize: "16px",
    color: "#b5b5ff",
    marginBottom: "50px",
    lineHeight: "1.6"
  },
  cards: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  card: {
    width: "260px",
    padding: "28px",
    background: "#0b1220",
    borderRadius: "16px",
    border: "1px solid #1a1a2e",
    boxShadow: "0 10px 20px rgba(0,0,0,0.35)"
  },
  icon: {
    fontSize: "34px",
    marginBottom: "14px"
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "10px"
  },
  text: {
    fontSize: "14px",
    color: "#d1d1ff",
    lineHeight: "1.5"
  }
};