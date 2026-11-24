
import Link from "next/link";
import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#f5f8fa",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    background: "#ffffff",
    padding: "22px 6%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },

  logo: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#183646",
    letterSpacing: "1px",
    margin: 0,
  },

  navigation: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },

  clinicalButton: {
    display: "block",
    background: "#087e89",
    color: "#ffffff",
    padding: "14px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 600,
    textAlign: "center",
  },

  adminButton: {
    display: "block",
    background: "#183646",
    color: "#ffffff",
    padding: "14px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 600,
    textAlign: "center",
  },

  hero: {
    background:
      "linear-gradient(135deg, #075762, #1599a7)",
    padding: "65px 20px",
    color: "#ffffff",
    textAlign: "center",
  },

  eyebrow: {
    fontSize: "13px",
    letterSpacing: "3px",
    fontWeight: 700,
    marginBottom: "20px",
  },

  heading: {
    fontSize: "clamp(38px, 6vw, 60px)",
    fontWeight: 800,
    margin: "10px 0",
    color: "#ffffff",
  },

  subtitle: {
    fontSize: "24px",
    fontWeight: 600,
    margin: "15px 0",
    color: "#ffffff",
  },

  description: {
    fontSize: "17px",
    lineHeight: 1.7,
    maxWidth: "750px",
    margin: "20px auto",
    color: "#e0f5f7",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
    gap: "25px",
    maxWidth: "900px",
    margin: "40px auto 0",
  },

  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "32px",
    color: "#183646",
    boxShadow: "0 12px 35px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
  },

  icon: {
    fontSize: "45px",
    marginBottom: "18px",
  },

  cardTitle: {
    fontSize: "25px",
    fontWeight: 700,
    margin: "0 0 12px",
    color: "#183646",
  },

  cardDescription: {
    color: "#64748b",
    fontSize: "15px",
    marginBottom: "15px",
  },

  features: {
    textAlign: "left",
    lineHeight: 2.2,
    fontSize: "15px",
    color: "#475569",
    margin: "12px 0 25px",
    flex: 1,
  },

  security: {
    fontSize: "13px",
    color: "#e0f5f7",
    marginTop: "35px",
  },

  footer: {
    padding: "25px",
    background: "#ffffff",
    color: "#64748b",
    textAlign: "center",
    fontSize: "14px",
  },
};

export default function HomePage() {
  return (
    <main style={styles.main}>

      <header style={styles.header}>

        <h1 style={styles.logo}>
          DoseTrack{" "}
          <span style={{ color: "#087e89" }}>
            EPI
          </span>
        </h1>

        <nav style={styles.navigation}>

          <Link
            href="/login"
            style={styles.clinicalButton}
          >
            Healthcare Worker Login
          </Link>

          <Link
            href="/admin/login"
            style={styles.adminButton}
          >
            Admin Login
          </Link>

        </nav>

      </header>

      <section style={styles.hero}>

        <p style={styles.eyebrow}>
          DIGITAL IMMUNISATION MANAGEMENT
        </p>

        <h2 style={styles.heading}>
          DoseTrack EPI
        </h2>

        <h3 style={styles.subtitle}>
          Expanded Programme on Immunisation
        </h3>

        <p style={styles.description}>
          An integrated digital platform for healthcare
          workers to manage immunisation services,
          vaccine inventory and patient follow-ups.
        </p>

        <div style={styles.grid}>

          {/* HEALTHCARE WORKER PORTAL */}

          <div style={styles.card}>

            <div style={styles.icon}>
              🩺
            </div>

            <h3 style={styles.cardTitle}>
              Healthcare Worker
            </h3>

            <p style={styles.cardDescription}>
              Patient care and clinical services
            </p>

            <div style={styles.features}>

              <div>✓ Register patients</div>

              <div>✓ Search patient records</div>

              <div>✓ Administer vaccine doses</div>

              <div>✓ Manage appointments</div>

              <div>✓ Review immunisation history</div>

              <div>✓ Manage vaccine inventory</div>

            </div>

            <Link
              href="/login"
              style={styles.clinicalButton}
            >
              Healthcare Worker Login →
            </Link>

          </div>

          {/* ADMINISTRATOR PORTAL */}

          <div style={styles.card}>

            <div style={styles.icon}>
              🛡️
            </div>

            <h3 style={styles.cardTitle}>
              Administrator
            </h3>

            <p style={styles.cardDescription}>
              Programme and system administration
            </p>

            <div style={styles.features}>

              <div>✓ Manage healthcare workers</div>

              <div>✓ Approve staff registration</div>

              <div>✓ Manage clinic register</div>

              <div>✓ Allocate healthcare workers</div>

              <div>✓ Manage roles and permissions</div>

              <div>✓ National programme reporting</div>

            </div>

            <Link
              href="/admin/login"
              style={styles.adminButton}
            >
              Administrator Login →
            </Link>

          </div>

        </div>

        <p style={styles.security}>
          🔒 Secure access for authorised personnel.
        </p>

      </section>

      <footer style={styles.footer}>
        DoseTrack EPI | Digital Immunisation Management
      </footer>

    </main>
  );
}
