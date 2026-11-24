
"use client";

import { useState, type FormEvent, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const styles: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #075762, #1599a7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "25px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "35px",
    boxSizing: "border-box",
    boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
  },
  logo: {
    textAlign: "center",
    color: "#183646",
    fontSize: "30px",
    fontWeight: 800,
  },
  title: {
    textAlign: "center",
    color: "#183646",
    fontSize: "24px",
  },
  description: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.7,
    marginBottom: "25px",
  },
  label: {
    display: "block",
    fontWeight: 600,
    fontSize: "14px",
    color: "#334155",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    boxSizing: "border-box",
    fontSize: "15px",
    background: "#ffffff",
    color: "#183646",
  },
  button: {
    width: "100%",
    padding: "15px",
    background: "#087e89",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "20px",
  },
  link: {
    display: "block",
    textAlign: "center",
    color: "#087e89",
    fontWeight: 600,
    fontSize: "14px",
    marginTop: "18px",
    textDecoration: "none",
  },
};

export default function LoginPage() {
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

    let signedIn = false;

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw new Error(loginError.message);
      }

      signedIn = true;

      // Verify administrator membership

      const {
        data: isAdmin,
        error: adminError,
      } = await supabase.rpc("dt_is_super_admin");

      if (adminError || typeof isAdmin !== "boolean") {
        throw new Error(
          "Unable to verify account permissions."
        );
      }

      if (isAdmin === true) {
        throw new Error(
          "This account is registered as a Super Administrator. Please use the Administrator Login."
        );
      }

      // Verify clinical access

      const {
        data: context,
        error: contextError,
      } = await supabase.rpc(
        "epi_get_dashboard_context"
      );

      if (contextError) {
        throw new Error(contextError.message);
      }

      if (context?.status !== "SUCCESS") {
        throw new Error(
          context?.message ||
          "Your healthcare worker account is not authorised."
        );
      }

      if (context.user?.is_super_admin !== false) {
        throw new Error(
          "Clinical permissions could not be verified."
        );
      }

      if (!context.sites?.length) {
        throw new Error(
          "No active clinic has been allocated to your account. Please contact the administrator."
        );
      }

      localStorage.removeItem(
        "epi_selected_site_id"
      );

      router.replace("/dashboard");

    } catch (err) {
      if (signedIn) {
        await supabase.auth.signOut({
          scope: "local",
        });

        localStorage.removeItem(
          "epi_selected_site_id"
        );
      }

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

        <div style={{
          textAlign: "center",
          fontSize: "45px",
          margin: "25px",
        }}>
          💉
        </div>

        <h2 style={styles.title}>
          Healthcare Worker Login
        </h2>

        <p style={styles.description}>
          Secure access to patient registration,
          immunisation services, appointments
          and vaccine inventory.
        </p>

        <form onSubmit={handleLogin}>

          <label
            htmlFor="email"
            style={styles.label}
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
            placeholder="Enter your email address"
            required
            style={styles.input}
          />

          <div style={{ marginTop: "20px" }}>

            <label
              htmlFor="password"
              style={styles.label}
            >
              Password
            </label>

            <div style={{ position: "relative" }}>

              <input
                id="password"
                type={
                  showPassword ? "text" : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                placeholder="Enter your password"
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
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "15px",
                  border: "none",
                  background: "transparent",
                  color: "#087e89",
                  cursor: "pointer",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>
          </div>

          {error && (
            <div role="alert" style={{
              marginTop: "20px",
              background: "#fef2f2",
              color: "#b91c1c",
              padding: "14px",
              borderRadius: "10px",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? "Verifying clinical access..."
              : "Sign In"}
          </button>

        </form>

        <Link
          href="/admin/login"
          style={styles.link}
        >
          Super Administrator Login
        </Link>

        <Link
          href="/"
          style={styles.link}
        >
          ← Return to homepage
        </Link>

        <p style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#64748b",
          marginTop: "25px",
        }}>
          DoseTrack EPI | Secure Clinical Access
        </p>

      </div>

    </main>
  );
}
