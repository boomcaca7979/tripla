import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "About reaching the tripla team — what channels exist today for feedback, data corrections and privacy requests.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Contact</span>
        </nav>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Contact</h1>

        <section className="mt-8 space-y-4 text-body leading-[1.7] text-gray-700">
          <p>
            tripla is an independent project without a support hotline or public office at this
            stage, so this page states plainly which channels exist and which do not — rather
            than pointing at an inbox nobody watches.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">Feedback &amp; data corrections</h2>
          <div className="mt-4 space-y-4 text-body leading-[1.7] text-gray-700">
            <p>
              There is no public feedback inbox yet. Destination facts, budgets and climate
              figures on this site are compiled from public datasets — NASA POWER climate
              normals, OpenStreetMap place data and provider listings — and refreshed in
              periodic content passes; known inaccuracies are corrected in those passes.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">Your account &amp; data</h2>
          <div className="mt-4 space-y-4 text-body leading-[1.7] text-gray-700">
            <p>
              Requests connected to your workspace data are handled through your account page.
              Trip plans created while signed out are stored only in your browser and never
              leave your device — clearing your browser storage removes them permanently.
              Details in the{" "}
              <Link href="/privacy" className="font-medium text-blue-700 underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="font-medium text-blue-700 underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-10 mb-16">
          <h2 className="text-2xl font-bold text-gray-900">Site information</h2>
          <div className="mt-4 space-y-4 text-body leading-[1.7] text-gray-700">
            <p>
              What tripla is and how it makes money is described on the{" "}
              <Link href="/about" className="font-medium text-blue-700 underline">
                About page
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
