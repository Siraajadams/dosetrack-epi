
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ClinicalDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verifyAccess() {
      try {
        const { data, error: authError } =
          await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !data.user) {
          router.replace("/login");
          return;
        }

        const {
          data: isAdmin,
          error: roleError,
        } = await supabase.rpc(
          "dt_is_super_admin"
        );

        if (cancelled) return;

        if (roleError) {
          throw new Error(
            "Unable to verify account permissions."
          );
        }

        if (isAdmin === true) {
          router.replace("/admin/dashboard");
          return;
        }

        if (isAdmin !== false) {
          throw new Error(
            "Account permissions could not be verified."
          );
        }

        setAllowed(true);

      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Access unavailable."
          );
        }
      }
    }

    verifyAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
      }}>
        <h2>Access unavailable</h2>
        <p>{error}</p>
        <a href="/login">Return to login</a>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
      }}>
        Verifying healthcare worker access...
      </div>
    );
  }

  return <>{children}</>;
}
