
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">

      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">

          <h1 className="text-2xl font-bold text-slate-800">
            DoseTrack{" "}
            <span className="text-teal-600">EPI</span>
          </h1>

          <div className="flex flex-wrap gap-3">

            <Link
              href="/login"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Healthcare Worker Login
            </Link>

            <Link
              href="/admin/login"
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
            >
              Admin Login
            </Link>

          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-teal-800 to-cyan-600 px-6 py-20 text-white">

        <div className="mx-auto max-w-5xl text-center">

          <p className="mb-5 text-sm font-bold uppercase tracking-widest text-teal-100">
            Digital Immunisation Management
          </p>

          <h2 className="text-5xl font-bold md:text-6xl">
            DoseTrack EPI
          </h2>

          <h3 className="mt-5 text-2xl font-semibold">
            Expanded Programme on Immunisation
          </h3>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-teal-50">
            An integrated digital platform for healthcare
            workers to manage immunisation services,
            vaccine inventory and patient follow-ups.
          </p>

          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">

            {/* Healthcare Worker Portal */}

            <div className="rounded-2xl bg-white p-8 text-slate-800 shadow-xl">

              <div className="mb-5 text-5xl">
                🩺
              </div>

              <h3 className="text-2xl font-bold">
                Healthcare Worker
              </h3>

              <p className="mt-3 text-slate-500">
                Patient care and clinical services
              </p>

              <div className="my-6 space-y-3 text-left text-sm text-slate-600">
                <p>✓ Register patients</p>
                <p>✓ Search patient records</p>
                <p>✓ Administer vaccines</p>
                <p>✓ Manage appointments</p>
                <p>✓ Manage vaccine inventory</p>
              </div>

              <Link
                href="/login"
                className="block w-full rounded-xl bg-teal-700 px-5 py-4 font-semibold text-white hover:bg-teal-800"
              >
                Healthcare Worker Login →
              </Link>

            </div>

            {/* Administrator Portal */}

            <div className="rounded-2xl bg-white p-8 text-slate-800 shadow-xl">

              <div className="mb-5 text-5xl">
                🛡️
              </div>

              <h3 className="text-2xl font-bold">
                Administrator
              </h3>

              <p className="mt-3 text-slate-500">
                Programme and system administration
              </p>

              <div className="my-6 space-y-3 text-left text-sm text-slate-600">
                <p>✓ Manage healthcare workers</p>
                <p>✓ Approve staff registration</p>
                <p>✓ Manage clinic register</p>
                <p>✓ Allocate healthcare workers</p>
                <p>✓ Manage roles and permissions</p>
              </div>

              <Link
                href="/admin/login"
                className="block w-full rounded-xl bg-slate-800 px-5 py-4 font-semibold text-white hover:bg-slate-900"
              >
                Administrator Login →
              </Link>

            </div>

          </div>

          <p className="mt-8 text-sm text-teal-100">
            Secure access for authorised personnel.
          </p>

        </div>
      </section>

      <footer className="border-t bg-white px-6 py-6 text-center text-sm text-slate-500">
        DoseTrack EPI | Digital Immunisation Management
      </footer>

    </main>
  );
}
