
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

      const { data, error: roleError } =
        await supabase.rpc("dt_is_super_admin");

      if (roleError || data !== true) {
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 to-cyan-700 px-4 py-10">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <h1 className="text-center text-3xl font-bold text-slate-800">
          DoseTrack <span className="text-teal-700">EPI</span>
        </h1>

        <div className="my-6 text-center text-5xl">
          🛡️
        </div>

        <h2 className="text-center text-2xl font-bold text-slate-800">
          Super Administrator Login
        </h2>

        <p className="mt-3 text-center text-sm text-slate-500">
          Secure access to national immunisation programme management.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email address
            </label>

            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 p-3 text-slate-900"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 p-3 pr-16 text-slate-900"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm font-semibold text-teal-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-700 p-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Administrator Sign In"}
          </button>

        </form>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm font-semibold text-teal-700"
          >
            Healthcare Worker Login
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          DoseTrack EPI | Secure Clinical Platform
        </p>

      </div>
    </main>
  );
}
