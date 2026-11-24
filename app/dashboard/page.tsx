"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./dashboard.module.css";

type Clinic = {
  id: string;
  site_name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  facility_type: string | null;
  district: string | null;
  mhfl_number: string | null;
  demander_number: string | null;
};

type HealthcareWorker = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  professional_category: string | null;
  approval_status: string;
  is_super_admin: boolean;
};

type DashboardContext = {
  status: string;
  message?: string;
  user?: HealthcareWorker;
  sites?: Clinic[];
};

const clinicalModules = [
  {
    icon: "👶",
    title: "Register Patient",
    description:
      "Register patients and caregiver information",
  },
  {
    icon: "🔍",
    title: "Search Patients",
    description:
      "Find patients and immunisation records",
  },
  {
    icon: "💉",
    title: "Administer Vaccine",
    description:
      "Record vaccine administration",
  },
  {
    icon: "📅",
    title: "Appointments",
    description:
      "Manage immunisation follow-up visits",
  },
];

const inventoryModules = [
  {
    icon: "📦",
    title: "Stock Received",
    description:
      "Receive vaccines and consumables",
  },
  {
    icon: "📊",
    title: "Stock Balance",
    description:
      "View available stock and batch balances",
  },
  {
    icon: "🧪",
    title: "Open Vials",
    description:
      "Manage multi-dose vaccine vials",
  },
  {
    icon: "🗑️",
    title: "Stock Wastage",
    description:
      "Record expired or wasted stock",
  },
  {
    icon: "📋",
    title: "Stock Reorder",
    description:
      "Prepare vaccine stock orders",
  },
  {
    icon: "🔄",
    title: "Stock Transfers",
    description:
      "Transfer stock between clinics",
  },
  {
    icon: "🌡️",
    title: "Cold Chain",
    description:
      "Monitor vaccine storage temperatures",
  },
  {
    icon: "📈",
    title: "KESS Reporting",
    description:
      "Vaccine usage and reconciliation reports",
  },
];

const adminModules = [
  {
    icon: "🏥",
    title: "Clinic Management",
    description:
      "Manage participating immunisation clinics",
  },
  {
    icon: "👥",
    title: "Healthcare Workers",
    description:
      "View healthcare worker allocations",
  },
  {
    icon: "💉",
    title: "Vaccine Catalogue",
    description:
      "Manage EPI vaccine and product catalogue",
  },
  {
    icon: "📊",
    title: "National Reporting",
    description:
      "Monitor immunisation services across clinics",
  },
];

function ModuleCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className={styles.moduleCard}>

      <div className={styles.moduleIcon}>
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <span className={styles.comingSoon}>
        Coming soon
      </span>

    </article>
  );
}

export default function DashboardPage() {

  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [user, setUser] =
    useState<HealthcareWorker | null>(null);

  const [clinics, setClinics] =
    useState<Clinic[]>([]);

  const [selectedClinicId, setSelectedClinicId] =
    useState("");

  const [signingOut, setSigningOut] =
    useState(false);

  useEffect(() => {

    let cancelled = false;

    async function loadDashboard() {

      try {

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !authUser) {

          router.replace("/login");

          return;

        }

        const {
          data,
          error: contextError,
        } = await supabase.rpc(
          "epi_get_dashboard_context"
        );

        if (cancelled) return;

        if (contextError) {

          throw new Error(
            "Unable to retrieve your clinic allocation."
          );

        }

        const context =
          data as DashboardContext;

        if (
          !context ||
          context.status !== "SUCCESS" ||
          !context.user
        ) {

          setError(
            context?.message ||
            "Clinical access is not authorised."
          );

          return;

        }

        const availableClinics =
          context.sites || [];

        setUser(context.user);

        setClinics(availableClinics);

        if (availableClinics.length === 1) {

          setSelectedClinicId(
            availableClinics[0].id
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

        if (!cancelled) {

          setLoading(false);

        }

      }

    }

    loadDashboard();

    return () => {
      cancelled = true;
    };

  }, [router]);

  const selectedClinic =
    clinics.find(
      (clinic) =>
        clinic.id === selectedClinicId
    );

  async function handleLogout() {

    setSigningOut(true);

    try {

      const { error: logoutError } =
        await supabase.auth.signOut({
          scope: "local",
        });

      if (logoutError) {

        throw logoutError;

      }

      router.replace("/login");

      router.refresh();

    } catch {

      alert(
        "Unable to sign out. Please try again."
      );

    } finally {

      setSigningOut(false);

    }

  }

  if (loading) {

    return (
      <main className={styles.loadingScreen}>

        <h2>DoseTrack EPI</h2>

        <p>
          Retrieving your healthcare worker
          profile and clinic allocation...
        </p>

      </main>
    );

  }

  if (error || !user) {

    return (
      <main className={styles.loadingScreen}>

        <div className={styles.errorCard}>

          <h2>Clinical Access Unavailable</h2>

          <p>
            {error || "Access denied."}
          </p>

          <button
            onClick={handleLogout}
            className={styles.logoutButton}
            disabled={signingOut}
          >
            Sign Out
          </button>

        </div>

      </main>
    );

  }

  return (

    <main className={styles.dashboard}>

      <header className={styles.header}>

        <div className={styles.brand}>
          DoseTrack <span>EPI</span>
        </div>

        <button
          onClick={handleLogout}
          className={styles.logoutButton}
          disabled={signingOut}
        >
          {signingOut
            ? "Signing out..."
            : "Sign Out"}
        </button>

      </header>

      <div className={styles.container}>

        <section className={styles.welcome}>

          <div>

            <div className={styles.eyebrow}>
              EXPANDED PROGRAMME ON IMMUNISATION
            </div>

            <h1>
              {user.is_super_admin
                ? "Super Administrator Dashboard"
                : "Healthcare Worker Dashboard"}
            </h1>

            <p className={styles.welcomeName}>
              Welcome, {user.full_name}
            </p>

            <p className={styles.profession}>
              {user.professional_category ||
                (user.is_super_admin
                  ? "Super Administrator"
                  : "Healthcare Worker")}
            </p>

          </div>

          <span className={styles.approved}>
            ✓ Approved Account
          </span>

        </section>

        <section className={styles.clinicCard}>

          <div className={styles.clinicHeading}>

            <div className={styles.clinicIcon}>
              🏥
            </div>

            <div>

              <h2>Clinic Allocation</h2>

              <p>
                Select your current service clinic.
              </p>

            </div>

          </div>

          {clinics.length === 0 ? (

            <div className={styles.warning}>

              No active clinics are available
              for your account. Please contact
              the administrator.

            </div>

          ) : (

            <>

              <label htmlFor="clinic">
                Selected Clinic
              </label>

              <select
                id="clinic"
                value={selectedClinicId}
                onChange={(event) =>
                  setSelectedClinicId(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select a clinic
                </option>

                {clinics.map((clinic) => (

                  <option
                    key={clinic.id}
                    value={clinic.id}
                  >

                    {clinic.site_name}

                    {clinic.city
                      ? ` — ${clinic.city}`
                      : ""}

                  </option>

                ))}

              </select>

              {selectedClinic && (

                <div
                  className={styles.clinicDetails}
                >

                  <div>

                    <span>Clinic Name</span>

                    <strong>
                      {selectedClinic.site_name}
                    </strong>

                  </div>

                  <div>

                    <span>Province</span>

                    <strong>
                      {selectedClinic.province ||
                        "Not recorded"}
                    </strong>

                  </div>

                  <div>

                    <span>City</span>

                    <strong>
                      {selectedClinic.city ||
                        "Not recorded"}
                    </strong>

                  </div>

                  <div>

                    <span>Facility Type</span>

                    <strong>
                      {selectedClinic.facility_type ||
                        "Not recorded"}
                    </strong>

                  </div>

                  <div>

                    <span>Demander Number</span>

                    <strong>
                      {selectedClinic.demander_number ||
                        "Not recorded"}
                    </strong>

                  </div>

                  <div>

                    <span>MHFL Number</span>

                    <strong>
                      {selectedClinic.mhfl_number ||
                        "Not recorded"}
                    </strong>

                  </div>

                </div>

              )}

            </>

          )}

        </section>

        <section className={styles.statsGrid}>

          <article className={styles.statCard}>

            <span>Accessible Clinics</span>

            <strong>{clinics.length}</strong>

            <small>
              Active authorised facilities
            </small>

          </article>

          <article className={styles.statCard}>

            <span>Account Status</span>

            <strong
              className={styles.greenText}
            >
              Approved
            </strong>

            <small>
              Active healthcare account
            </small>

          </article>

          <article className={styles.statCard}>

            <span>Access Level</span>

            <strong>
              {user.is_super_admin
                ? "Administrator"
                : "Clinical"}
            </strong>

            <small>
              Role-based access
            </small>

          </article>

        </section>

        {!selectedClinic && (

          <div className={styles.warning}>

            Please select an authorised clinic
            before accessing clinical services.

          </div>

        )}

        <section className={styles.moduleSection}>

          <h2>Patient and Clinical Services</h2>

          <p>
            Patient registration and
            immunisation management
          </p>

          <div className={styles.moduleGrid}>

            {clinicalModules.map((module) => (

              <ModuleCard
                key={module.title}
                {...module}
              />

            ))}

          </div>

        </section>

        <section className={styles.moduleSection}>

          <h2>Vaccine Inventory Management</h2>

          <p>
            Vaccine stock, batch management,
            usage and reconciliation
          </p>

          <div className={styles.moduleGrid}>

            {inventoryModules.map((module) => (

              <ModuleCard
                key={module.title}
                {...module}
              />

            ))}

          </div>

        </section>

        {user.is_super_admin && (

          <section
            className={styles.adminSection}
          >

            <h2>Super Administrator Services</h2>

            <p>
              National EPI programme management
            </p>

            <div className={styles.moduleGrid}>

              {adminModules.map((module) => (

                <ModuleCard
                  key={module.title}
                  {...module}
                />

              ))}

            </div>

          </section>

        )}

      </div>

      <footer className={styles.footer}>

        DoseTrack EPI |
        Expanded Programme on Immunisation

        <br />

        Development environment —
        Not for live clinical use

      </footer>

    </main>

  );

}
