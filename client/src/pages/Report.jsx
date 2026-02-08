import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Report.css";

export default function Report() {
  const navigate = useNavigate();
  const reportRef = useRef();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const scanReport = JSON.parse(localStorage.getItem("scanReport"));
    setSummary(scanReport);
  }, []);

  if (!summary) {
    return (
      <div className="no-report">
        <h1>No report data found</h1>
        <p>Please run a new digital footprint scan to generate a report.</p>
        <button onClick={() => navigate("/scan")}>Run Scan</button>
      </div>
    );
  }

  const { email, breaches, github, scanDate, recommendations, riskScore, riskLevel } = summary;
  const breachFound = breaches?.length > 0;

  const downloadPDF = async () => {
    const original = reportRef.current;

    const clone = original.cloneNode(true);
    clone.classList.add("pdf-mode");
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.width = "900px";
    clone.style.background = "#ffffff";
    clone.style.color = "#000000";
    clone.style.padding = "0";
    clone.style.margin = "0";

    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("Digital_Footprint_Report.pdf");
    } finally {
      document.body.removeChild(clone);
    }
  };

  return (
    <div className="report-page" ref={reportRef}>
      {/* NAVBAR */}
      <div className="report-navbar">
        <div className="nav-center">
          <h1 className="nav-title">Digital Footprint Scan Report</h1>
          <p className="nav-subtitle">
            Official scan summary generated on {scanDate}
          </p>
        </div>
        <button className="nav-download-btn" onClick={downloadPDF}>
          ⬇ Download Report
        </button>
      </div>

      {/* CONTENT */}
      <div className="report-content">
        {/* SCAN OVERVIEW */}
        <section className="report-card">
          <h2 className="report-card-heading">Scan Overview</h2>
          <div className="card-content">
            <div className="info-field">
              <span className="field-label">Scan ID:</span>
              <span className="field-value">DF-{Date.now()}</span>
            </div>
            <div className="info-field">
              <span className="field-label">Scan Date & Time:</span>
              <span className="field-value">{scanDate}</span>
            </div>
            <div className="info-field">
              <span className="field-label">Identifier Scanned:</span>
              <span className="field-value">{email}</span>
            </div>
            <div className="info-field">
              <span className="field-label">Scan Scope:</span>
              <span className="field-value">Public OSINT data only</span>
            </div>
            <p className="card-description">
              This scan evaluates publicly accessible information only. No private or restricted data sources are accessed.
            </p>
          </div>
        </section>

        {/* BREACH ANALYSIS */}
        <section className="report-card">
          <h2 className="report-card-heading">Breach Presence Analysis</h2>
          <div className="card-content">
            {breachFound ? (
              <p className="breach-text">
                ⚠️ Your email has been found in {breaches.length} public data breach(es). We strongly recommend changing your passwords immediately and enabling two-factor authentication on all affected accounts.
              </p>
            ) : (
              <p className="breach-text">
                ✓ Your email was not found in any known public data breaches. Your account credentials remain secure.
              </p>
            )}
            <p className="card-description">
              We only analyze publicly available breach databases. Passwords and credentials are never accessed or stored in our system.
            </p>
          </div>
        </section>

        {/* PUBLIC ACCOUNT EXPOSURE */}
        <section className="report-card">
          <h2 className="report-card-heading">Public Account Exposure</h2>
          <div className="card-content">
            {github.exists ? (
              <div className="exposure-grid">
                <div className="exposure-item">
                  <div className="exposure-number">{github.repos}</div>
                  <div className="exposure-label">Public Repositories Identified</div>
                </div>
                <div className="exposure-item">
                  <div className="exposure-number">{github.followers}</div>
                  <div className="exposure-label">Public Followers Count</div>
                </div>
              </div>
            ) : (
              <p>No public developer accounts detected.</p>
            )}
            <p className="card-description">
              Public repositories may reveal usernames, activity patterns, and technical metadata.
            </p>
          </div>
        </section>

        {/* OVERALL RISK SCORE - TEXT ONLY */}
        <section className="report-card">
          <h2 className="report-card-heading">Overall Risk Assessment</h2>
          <div className="card-content">
            <p className="risk-assessment-text">
              Based on our comprehensive analysis, your digital exposure level is <strong>{riskScore}%</strong>, which is classified as <strong>{riskLevel === "High" ? "high risk" : riskLevel === "Medium" ? "medium risk" : "low risk"}</strong>. 
              {riskLevel === "High" 
                ? " We strongly recommend taking immediate action to secure your accounts and reduce your online exposure."
                : riskLevel === "Medium"
                ? " We recommend implementing the security measures outlined below to further protect your digital presence."
                : " Your digital footprint demonstrates excellent security posture with minimal public exposure."
              }
            </p>
          </div>
        </section>

        {/* PUBLIC EXPOSURE SUMMARY */}
        <section className="report-card">
          <h2 className="report-card-heading">Exposure Summary</h2>
          <div className="card-content">
            <ul className="summary-list">
              <li>Email address publicly visible: <strong>Yes</strong></li>
              <li>Developer platform exposure detected: <strong>{github.exists ? "Yes" : "No"}</strong></li>
              <li>Breach presence: <strong>{breachFound ? "Detected" : "Not detected"}</strong></li>
            </ul>
          </div>
        </section>

        {/* KEY FINDINGS */}
        <section className="report-card">
          <h2 className="report-card-heading">Key Findings</h2>
          <div className="card-content">
            <ul className="findings-list">
              <li>Public developer activity is indexable by search engines</li>
              <li>Email identifiers can appear in public datasets</li>
              <li>Breach exposure increases phishing risk</li>
            </ul>
          </div>
        </section>

        {/* SECURITY RECOMMENDATIONS */}
        <section className="report-card">
          <h2 className="report-card-heading">Security Recommendations</h2>
          <div className="card-content">
            {recommendations?.length > 0 ? (
              <>
                <p className="card-description">
                  Based on your exposure analysis, we recommend implementing the following security measures to protect your digital presence:
                </p>
                <ul className="recommendations-list">
                  {recommendations.map((rec, i) => (
                    <li key={i}>{typeof rec === "object" ? rec.title : rec}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No immediate security actions required at this time.</p>
            )}
          </div>
        </section>

        {/* SYSTEM LIMITATIONS */}
        <section className="report-card">
          <h2 className="report-card-heading">System Limitations</h2>
          <div className="card-content">
            <ul className="limitations-list">
              <li>Only public datasets are analyzed</li>
              <li>Private or protected accounts are excluded</li>
              <li>Results depend on third-party data availability</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}