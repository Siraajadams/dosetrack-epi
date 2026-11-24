
"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const modules = [
  {
    icon: "👥",
    title: "Healthcare Worker Register",
    description: "Manage registered healthcare workers",
  },
  {
    icon: "✅",
    title: "Healthcare Worker Approval",
    description: "Approve or reject staff registrations",
  },
  {
    icon: "🏥",
    title: "Clinic Register",
    description: "Register and manage participating clinics",
  },
  {
    icon: "🔗",
    title: "Clinic Allocation",
    description: "Allocate healthcare workers to clinics",
  },
  {
    icon: "🛡️",
    title: "Roles and Permissions",
    description: "Manage healthcare worker access levels",
  },
  {
    icon: "💉",
    title: "Vaccine Catalogue",
    description: "Manage vaccine master data",
  },
  {
    icon: "📅",
    title: "EPI Schedule",
    description: "Manage immunisation schedules",
  },
  {
    icon: "📊",
    title: "National Reports",
    description: "Monitor immunisation programme performance",
  },
  {
    icon: "📦",
    title: "National Stock Overview",
    description: "Monitor vaccine stock across clinics",
  },
  {
    icon: "⚙️",
    title: "System Settings",
    description: "Manage programme configuration",
  },
];

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#f5f8fa",
    fontFamily: "Arial, sans-serif",
    color: "#183646",
  },

  header: {
    background: "#ffffff",
    padding: "20px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    borderBottom: "1px solid #e2e8f0",
  },

  logo: {
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "1px",
    margin: 0,
    color: "#183646",
  },

  button: {
    background: "#075762",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 600,
  },

  container: {
    maxWidth: "1400px",
    margin: "auto",
    padding: "30px 24px",
  },

  banner: {
    background:
      "linear-gradient(135deg, #075762, #1599a7)",
    borderRadius: "18px",
    padding: "35px",
    color: "#ffffff",
    marginBottom: "35px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
    gap: "20px",
    marginTop: "20px",
    marginBottom: "35px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
  },

  icon: {
    fontSize: "28px",
    background: "#e5f5f5",
    width: "58px",
    height: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    marginBottom: "18px",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "10px",
    color: "#183646",
  },

  description: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#64748b",
  },

  status: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "20px",
  },

  sectionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#183646",
  },
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorised, setAuthorised] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !data.user) {
          router.replace("/admin/login");
          return;
        }

        const {
          data: isAdmin,
          error: adminError,
        } = await supabase.rpc(
          "dt_is_super_admin"
        );

        if (cancelled) return;

        if (adminError) {
          throw new Error(
            "Unable to verify administrator permissions."
          );
        }

        if (isAdmin !== true) {
          router.replace("/dashboard");
          return;
        }

        setEmail(data.user.email || "");
        setAuthorised(true);

      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to verify access."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthorised(false);
      setError("Unable to sign out. Please try again.");
      return;
    }

    localStorage.removeItem(
      "epi_selected_site_id"
    );

    router.replace("/admin/login");
  }

  function renderModules(
    items: typeof modules
  ) {
    return (
      <div style={styles.grid}>
        {items.map((item) => (
          <div
            key={item.title}
            style={styles.card}
          >
            <div style={styles.icon}>
              {item.icon}
            </div>

            <h3 style={styles.cardTitle}>
              {item.title}
            </h3>

            <p style={styles.description}>
              {item.description}
            </p>

            <p style={styles.status}>
              Module awaiting connection
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Verifying administrator access...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Access unavailable</h2>
        <p>{error}</p>

        <button
          style={styles.button}
          onClick={signOut}
        >
          Return to login
        </button>
      </div>
    );
  }

  if (!authorised) return null;

  return (
    <main style={styles.main}>

      <header style={styles.header}>

        <h1 style={styles.logo}>
          DoseTrack{" "}
          <span style={{ color: "#087e89" }}>
            EPI
          </span>
        </h1>

        <button
          onClick={signOut}
          style={styles.button}
        >
          Sign Out
        </button>

      </header>

      <div style={styles.container}>

        <section style={styles.banner}>

          <p style={{
            fontSize: "13px",
            letterSpacing: "2px",
            fontWeight: 700,
          }}>
            EXPANDED PROGRAMME ON IMMUNISATION
          </p>

          <h1 style={{
            fontSize: "32px",
            color: "#ffffff",
          }}>
            Super Administrator Dashboard
          </h1>

          <p>{email}</p>

          <p style={{ color: "#d8f5f5" }}>
            National programme administration
          </p>

        </section>

        <section>

          <h2 style={styles.sectionTitle}>
            Healthcare Worker and Clinic Management
          </h2>

          <p style={styles.description}>
            Manage staff registrations, approvals,
            clinic allocations and permissions.
          </p>

          {renderModules(modules.slice(0, 5))}

        </section>

        <section>

          <h2 style={styles.sectionTitle}>
            Programme Administration
          </h2>

          <p style={styles.description}>
            National immunisation programme
            oversight and configuration.
          </p>

          {renderModules(modules.slice(5))}

        </section>

        <footer style={{
          textAlign: "center",
          color: "#64748b",
          padding: "25px",
          fontSize: "13px",
        }}>
          DoseTrack EPI | National Administration
        </footer>

      </div>

    </main>
  );
}
