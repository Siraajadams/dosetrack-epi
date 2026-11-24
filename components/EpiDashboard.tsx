
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Mode = "route" | "admin" | "nurse";

type Site = {
  id: string;
  site_name: string;
  province?: string;
  city?: string;
};

type DashboardContext = {
  status: string;
  message?: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_super_admin: boolean;
  };
  sites: Site[];
};

const clinicalModules = [
  {
    icon: "👶",
    title: "Register Patient",
    description: "Register patients and caregivers",
    href: "/nurse/patients/new",
  },
  {
    icon: "🔍",
    title: "Search Patients",
    description: "Find patients and immunisation records",
    href: "/nurse/patients",
  },
  {
    icon: "💉",
    title: "Administer Vaccine",
    description: "Select a patient to administer a vaccine",
    href: "/nurse/patients",
  },
  {
    icon: "📅",
    title: "Appointments",
    description: "Manage upcoming and overdue appointments",
    href: "/nurse/appointments",
  },
];

const inventoryModules = [
  {
    icon: "📦",
    title: "Stock Received",
    description: "Receive vaccines and consumables",
    href: "/nurse/stock/received",
  },
  {
    icon: "📊",
    title: "Stock Balance",
    description: "View stock and batch balances",
    href: "/nurse/stock/balance",
  },
  {
    icon: "🧪",
    title: "Open Vials",
    description: "Manage multi-dose vaccine vials",
    href: "/nurse/stock/open-vials",
  },
  {
    icon: "🗑️",
    title: "Stock Wasted",
    description: "Record expired and wasted vaccines",
    href: "/nurse/stock/wasted",
  },
];

const adminModules = [
  {
    icon: "👥",
    title: "Healthcare Workers",
    description: "Manage and approve healthcare workers",
    href: "/admin/healthcare-workers",
  },
  {
    icon: "🏥",
    title: "Clinic Register",
    description: "Manage participating clinics",
    href: "/admin/clinics",
  },
  {
    icon: "🔗",
    title: "Clinic Allocation",
    description: "Assign healthcare workers to clinics",
    href: "/admin/assign-clinic",
  },
  {
    icon: "💉",
    title: "Vaccine Catalogue",
    description: "Manage EPI vaccine products",
    href: "/admin/products",
  },
  {
    icon: "📈",
    title: "National Reports",
    description: "Monitor immunisation programme performance",
    href: "/admin/reports",
  },
];

export default function EpiDashboard({
  mode = "route",
}: {
  mode?: Mode;
}) {
  const router = useRouter();

  const [context, setContext] =
    useState<DashboardContext | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [siteId, setSiteId] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !authData.user) {
          router.replace(
            mode === "admin" ? "/admin/login" : "/login"
          );
          return;
        }

        const { data, error: rpcError } =
          await supabase.rpc(
            "epi_get_dashboard_context"
          );

        if (cancelled) return;

        if (rpcError) {
          throw new Error(rpcError.message);
        }

        if (data?.status !== "SUCCESS") {
          throw new Error(
            data?.message || "Access denied."
          );
        }

        const result = data as DashboardContext;
        const isAdmin = result.user.is_super_admin;

        const destination = isAdmin
          ? "/admin/dashboard"
          : "/nurse/dashboard";

        if (
          mode === "route" ||
          (mode === "admin" && !isAdmin) ||
          (mode === "nurse" && isAdmin)
        ) {
          router.replace(destination);
          return;
        }

        const sites = result.sites || [];

        setContext(result);

        if (!isAdmin && sites.length === 0) {
          throw new Error(
            "No active clinic has been assigned to your account. Please contact your administrator."
          );
        }

        const savedSite =
          localStorage.getItem("epi_selected_site_id");

        const selectedSite = sites.find(
          (site) => site.id === savedSite
        ) || sites[0];

        if (selectedSite) {
          setSiteId(selectedSite.id);

          localStorage.setItem(
            "epi_selected_site_id",
            selectedSite.id
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [mode, router]);

  async function signOut() {
    await supabase.auth.signOut();

    localStorage.removeItem(
      "epi_selected_site_id"
    );

    router.replace(
      mode === "admin" ? "/admin/login" : "/login"
    );
  }

  function changeClinic(id: string) {
    setSiteId(id);

    localStorage.setItem(
      "epi_selected_site_id",
      id
    );
  }

  function renderModules(
    modules: typeof clinicalModules,
    clinical = false
  ) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) => (
          <Link
            key={module.title}
            href={
              clinical
                ? `${module.href}?site_id=${encodeURIComponent(siteId)}`
                : module.href
            }
            className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-500 hover:shadow-md"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 text-3xl">
              {module.icon}
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              {module.title}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {module.description}
            </p>

            <p className="mt-5 text-sm font-semibold text-teal-700">
              Open module →
            </p>
          </Link>
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading DoseTrack EPI...
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border bg-white p-8">
          <h2 className="text-xl font-bold text-red-700">
            Access unavailable
          </h2>

          <p className="mt-4 text-slate-600">
            {error}
          </p>

          <button
            onClick={signOut}
            className="mt-6 rounded-xl bg-teal-700 px-5 py-3 text-white"
          >
            Return to login
          </button>
        </div>
      </main>
    );
  }

  if (!context || mode === "route") {
    return null;
  }

  const isAdmin = context.user.is_super_admin;

  if (
    (mode === "admin" && !isAdmin) ||
    (mode === "nurse" && isAdmin)
  ) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="bg-teal-900 px-6 py-6 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold">
              DoseTrack EPI
            </h1>

            <p className="mt-1 text-teal-100">
              {isAdmin
                ? "Super Administrator Portal"
                : "Healthcare Worker Portal"}
            </p>
          </div>

          <button
            onClick={signOut}
            className="rounded-xl border border-teal-300 px-5 py-2"
          >
            Sign Out
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-8 p-6">

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Welcome, {context.user.full_name}
          </h2>

          <p className="mt-1 text-slate-500">
            {isAdmin
              ? "National immunisation programme administration"
              : "Patient care and vaccine administration"}
          </p>
        </div>

        {isAdmin ? (
          <section>
            <h2 className="mb-4 text-2xl font-bold text-slate-800">
              Administration & Clinic Management
            </h2>

            {renderModules(adminModules)}
          </section>
        ) : (
          <>
            <section className="rounded-2xl border bg-white p-5">

              <label className="mb-2 block font-semibold text-slate-700">
                Selected Clinic
              </label>

              <select
                value={siteId}
                onChange={(e) =>
                  changeClinic(e.target.value)
                }
                className="w-full rounded-xl border p-3 text-slate-800"
              >
                {context.sites.map((site) => (
                  <option
                    key={site.id}
                    value={site.id}
                  >
                    {site.site_name}
                  </option>
                ))}
              </select>

            </section>

            {siteId && (
              <>
                <section>
                  <h2 className="mb-4 text-2xl font-bold text-slate-800">
                    Patient Management
                  </h2>

                  {renderModules(
                    clinicalModules,
                    true
                  )}
                </section>

                <section>
                  <h2 className="mb-2 text-2xl font-bold text-slate-800">
                    Vaccine Inventory Management
                  </h2>

                  <p className="mb-5 text-slate-500">
                    Vaccine stock, batch management,
                    usage and reconciliation
                  </p>

                  {renderModules(
                    inventoryModules,
                    true
                  )}
                </section>
              </>
            )}
          </>
        )}

      </div>
    </main>
  );
}
