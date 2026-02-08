import { useEffect, useRef, useState } from "react";

export default function Features() {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={ref}
      style={{
        ...styles.section,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(50px)",
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out"
      }}
    >
      <h2 style={styles.heading}>How We Protect Your Identity</h2>

      <p style={styles.subheading}>
        Scan, analyze, and secure your digital presence in three simple steps.
      </p>

      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.icon}>🔍</div>
          <h3 style={styles.cardTitle}>Scan</h3>
          <p style={styles.cardText}>
            Analyze social platforms, public records and data brokers.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>📊</div>
          <h3 style={styles.cardTitle}>Analyze</h3>
          <p style={styles.cardText}>
            Identify exposure risks and sensitive data leaks.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>🔐</div>
          <h3 style={styles.cardTitle}>Secure</h3>
          <p style={styles.cardText}>
            Reduce visibility and strengthen online privacy.
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
    textAlign: "center",
    background: "linear-gradient(135deg, #050816, #0f1c2f)",
    color: "white"
  },
  heading: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "700",
    marginBottom: "12px"
  },
  subheading: {
    maxWidth: "640px",
    fontSize: "16px",
    color: "#b8c0ff",
    marginBottom: "50px",
    lineHeight: "1.6"
  },
  cards: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  card: {
    width: "260px",
    padding: "30px",
    background: "#0b1220",
    borderRadius: "16px",
    border: "1px solid #1a1a2e",
    boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
    transition: "transform 0.3s, box-shadow 0.3s",
    cursor: "pointer"
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "15px 0 10px 0"
  },
  cardText: {
    fontSize: "15px",
    color: "#ccc",
    lineHeight: "1.5"
  },
  icon: {
    fontSize: "36px",
    background: "#1e90ff",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    color: "white"
  }
};