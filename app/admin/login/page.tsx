
"use client";

import { useState, type FormEvent, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #075762, #1599a7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 20px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "36px",
    boxSizing: "border-box",
    boxShadow: "0 15px 45px rgba(0,0,0,0.18)",
  },

  logo: {
    textAlign: "center",
    fontSize: "30px",
    fontWeight: 800,
    letterSpacing: "1px",
    color: "#183646",
    margin: "0 0 25px",
  },

  icon: {
    width: "75px",
    height: "75px",
    borderRadius: "50%",
    background: "#e5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    margin: "0 auto 25px",
  },

  title: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#183646",
    textAlign: "center",
    marginBottom: "12px",
  },

  description: {
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#64748b",
    textAlign: "center",
    marginBottom: "30px",
  },

  field: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#334155",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    background: "#ffffff",
    color: "#183646",
    boxSizing: "border-box",
  },

  passwordContainer: {
    position: "relative",
  },

  showButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    color: "#087e89",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "13px",
  },

  signInButton: {
    width: "100%",
    padding: "15px",
    background: "#087e89",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "5px",
  },

  error: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "18px",
    fontSize: "14px",
  },

  links: {
    textAlign: "center",
    marginTop: "25px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
  },

  link: {
    display: "block",
    color: "#087e89",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    marginBottom: "14px",
  },

  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "12px",
    marginTop: "25px",
  },
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw new Error(loginError.message);
      }

      const {
        data: isAdmin,
        error: adminError,
      } = await supabase.rpc("dt_is_super_admin");

      if (adminError) {
        await supabase.auth.signOut();

        throw new Error(
          "Unable to verify administrator permissions."
        );
      }

      if (isAdmin !== true) {
        await supabase.auth.signOut();

        throw new Error(
          "Access denied. Super Administrator privileges are required."
        );
      }

      router.replace("/admin/dashboard");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>

      <div style={styles.card}>

        <h1 style={styles.logo}>
          DoseTrack{" "}
          <span style={{ color: "#087e89" }}>
            EPI
          </span>
        </h1>

        <div style={styles.icon}>
          🛡️
        </div>

        <h2 style={styles.title}>
          Super Administrator Login
        </h2>

        <p style={styles.description}>
          Manage healthcare workers, clinic allocations
          and national immunisation programmes.
        </p>

        <form onSubmit={handleLogin}>

          <div style={styles.field}>

            <label
              htmlFor="admin-email"
              style={styles.label}
            >
              Email address
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="Enter your email address"
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              style={styles.input}
            />

          </div>

          <div style={styles.field}>

            <label
              htmlFor="admin-password"
              style={styles.label}
            >
              Password
            </label>

            <div style={styles.passwordContainer}>

              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                style={{
                  ...styles.input,
                  paddingRight: "65px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={styles.showButton}
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

          </div>

          {error && (
            <div
              role="alert"
              style={styles.error}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.signInButton,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Verifying administrator access..."
              : "Administrator Sign In"}
          </button>

        </form>

        <div style={styles.links}>

          <Link
            href="/login"
            style={styles.link}
          >
            Healthcare Worker Login
          </Link>

          <Link
            href="/"
            style={styles.link}
          >
            Return to Home
          </Link>

        </div>

        <p style={styles.footer}>
          DoseTrack EPI | Secure Administration
        </p>

      </div>

    </main>
  );
}
