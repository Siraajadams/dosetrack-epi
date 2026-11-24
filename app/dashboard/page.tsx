"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email || "");
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Unable to sign out. Please try again.");
      return;
    }

    router.replace("/login");
  }

  if (loading) {
    return <main>Checking authentication...</main>;
  }

  return (
    <main>
      <header className="header">

        <div className="brand">
          DoseTrack <span>EPI</span>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Sign Out
        </button>

      </header>

      <section className="features">

        <h1>Healthcare Worker Dashboard</h1>

        <p>Signed in as: {email}</p>

        <article className="feature-card">

          <h3>Authentication successful</h3>

          <p>
            Your DoseTrack account has been
            authenticated.
          </p>

          <p>
            Clinic allocation and professional
            authorisation will be configured
            in the next development phase.
          </p>

        </article>

      </section>

    </main>
  );
}
