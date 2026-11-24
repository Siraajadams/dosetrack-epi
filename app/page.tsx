export default function Home() {
  const features = [
    {
      icon: "👶",
      title: "Patient Registration",
      description:
        "Register children and manage patient and caregiver information.",
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
        "Track opened vials, available doses and wastage.",
    },
    {
      icon: "📅",
      title: "Appointments",
      description:
        "Manage immunisation follow-up appointments.",
    },
    {
      icon: "📊",
      title: "Clinical Reporting",
      description:
        "Monitor immunisation activity and vaccine utilisation.",
    },
  ];

  return (
    <main>
      <header className="header">
        <div className="brand">
          DoseTrack <span>EPI</span>
        </div>

        <div className="secure">
          Secure Clinical Access
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">
          DIGITAL IMMUNISATION MANAGEMENT
        </div>

        <h1>DoseTrack EPI</h1>

        <h2>Expanded Programme on Immunisation</h2>

        <p>
          An integrated platform for healthcare
          workers to manage immunisation services,
          vaccine inventory and patient follow-ups.
        </p>

        <button className="primary" disabled>
          Healthcare Worker Login — Coming Soon
        </button>

        <p className="notice">
          Authorised healthcare personnel only.
        </p>
      </section>

      <section className="features">
        <h2>Platform capabilities</h2>

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
        DoseTrack EPI | Immunisation Management
        <br />
        © {new Date().getFullYear()} DoseTrack
      </footer>
    </main>
  );
}
