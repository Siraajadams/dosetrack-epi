"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw loginError;
      }

      router.replace("/dashboard");
      router.refresh();

    } catch {
      setError(
        "Unable to sign in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-screen">

      <div className="login-card">

        <Link href="/" className="login-brand">
          DoseTrack <span>EPI</span>
        </Link>

        <div className="login-icon">
          💉
        </div>

        <h1>Healthcare Worker Login</h1>

        <p className="login-description">
          Sign in using your existing DoseTrack
          healthcare worker account.
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-wrapper">
              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                aria-pressed={showPassword}
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

        <div className="login-security">
          🔒 Authorised healthcare personnel only.
        </div>

        <Link href="/" className="back-link">
          ← Return to homepage
        </Link>

      </div>

      <div className="login-footer">
        DoseTrack EPI | Secure Clinical Access
      </div>

    </main>
  );
}
