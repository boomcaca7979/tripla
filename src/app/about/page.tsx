import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "What tripla is, how it works, and how it makes money — plain answers about this travel discovery site.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">About</span>
        </nav>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">About tripla</h1>

        <section className="mt-8 space-y-4 text-body leading-[1.7] text-gray-700">
          <p>
            tripla is a travel discovery and trip-planning site. You can browse a world atlas
            of destinations, read destination guides and budget breakdowns, compare climates,
            and organise your own trips in a personal workspace — everything up to the point
            of booking.
          </p>
          <p>
            When you are ready to book, tripla hands you off to established providers: flight
            fare search opens on Aviasales, hotel booking engines open on Wink, and bookable
            tours and tickets open on Viator. Prices are shown by the provider; tripla does
            not sell flights, rooms, or tickets directly.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">How tripla makes money</h2>
          <div className="mt-4 space-y-4 text-body leading-[1.7] text-gray-700">
            <p>
              tripla is free to use and funded by two mechanisms, disclosed here in plain terms:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Affiliate commissions.</strong> Some outbound links to booking
                providers (Aviasales, Hotellook, Wink, Viator) are affiliate links. If you
                book through them, tripla may earn a commission at no extra cost to you.
              </li>
              <li>
                <strong>Advertising.</strong> Some pages carry display advertising served by a
                third-party advertising partner (currently Adsterra). Ads are clearly
                distinguishable from editorial content.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">How the content is produced</h2>
          <div className="mt-4 space-y-4 text-body leading-[1.7] text-gray-700">
            <p>
              Destination facts, monthly climate figures and budget estimates are compiled from
              public datasets — including the NASA POWER climate archive for monthly normals,
              and OpenStreetMap contributor data for place listings. Guides are editorial
              compilations of publicly available destination knowledge, refreshed periodically.
              Numbers shown for flights, hotels and experiences come from the named providers
              at request time; where live data is unavailable, the site shows an honest empty
              state instead of inventing numbers.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">Your data</h2>
          <div className="mt-4 space-y-4 text-body leading-[1.7] text-gray-700">
            <p>
              Trip plans you create while signed out stay in your browser storage. Signed-in
              workspace data is stored under your account and protected by row-level security.
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
      </div>
    </article>
  );
}
