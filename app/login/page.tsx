"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        "Unable to sign in. Please check your credentials."
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

        <h1>Healthcare Worker Login</h1>

        <p className="login-description">
          Sign in using your existing DoseTrack
          healthcare worker account.
        </p>

        <form onSubmit={handleLogin}>

          <label htmlFor="email">
            Email address
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            required
          />

          {error && (
            <div className="login-error" role="alert">
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

        <p className="login-description">
          Authorised healthcare personnel only.
        </p>

        <Link href="/" className="back-link">
          Return to homepage
        </Link>

      </div>

    </main>
  );
}
