import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: "👶",
      title: "Patient Registration",
      description:
        "Register patients and manage caregiver information.",
    },
    {
      icon: "💉",
      title: "Immunisation Management",
      description:
        "Record vaccine administration and immunisation history.",
    },
    {
      icon: "📦",
      title: "Vaccine Inventory",
      description:
        "Manage vaccine stock, batch numbers and expiry dates.",
    },
    {
      icon: "🧪",
      title: "Multi-dose Vials",
      description:
        "Manage opened vials, available doses and wastage.",
    },
    {
      icon: "📅",
      title: "Appointments",
      description:
        "Manage patient immunisation follow-up appointments.",
    },
    {
      icon: "🌡️",
      title: "Cold Chain Management",
      description:
        "Planned monitoring of vaccine storage and temperature records.",
    },
    {
      icon: "📊",
      title: "Clinical Reporting",
      description:
        "Monitor immunisation activity and vaccine utilisation.",
    },
    {
      icon: "🏥",
      title: "Clinic Management",
      description:
        "Manage immunisation services across participating clinics.",
    },
    {
      icon: "🔄",
      title: "Stock Reconciliation",
      description:
        "Monitor stock received, administered and wasted.",
    },
  ];

  return (
    <main>
      <header className="header">
        <Link href="/" className="brand">
          DoseTrack <span>EPI</span>
        </Link>

        <Link
          href="/login"
          className="nav-login"
        >
          Login
        </Link>
      </header>

      <section className="hero">
        <div className="eyebrow">
          DIGITAL IMMUNISATION MANAGEMENT
        </div>

        <h1>DoseTrack EPI</h1>

        <h2>
          Expanded Programme on Immunisation
        </h2>

        <p>
          An integrated digital platform for
          healthcare workers to manage
          immunisation services, vaccine
          inventory and patient follow-ups.
        </p>

        <Link
          href="/login"
          className="primary"
        >
          Healthcare Worker Login →
        </Link>

        <p className="notice">
          Secure clinical access for authorised
          healthcare personnel.
        </p>
      </section>

      <section className="features">
        <h2>Platform Capabilities</h2>

        <div className="feature-grid">
          {features.map((feature) => (
            <article
              className="feature-card"
              key={feature.title}
            >
              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        DoseTrack EPI
        <br />
        Immunisation Management Platform
        <br />
        © {new Date().getFullYear()} DoseTrack
      </footer>
    </main>
  );
}
