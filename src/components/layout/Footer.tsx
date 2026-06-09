// ── Component ────────────────────────────────────────────────────────

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between sm:gap-0">
        {/* Copyright */}
        <p className="text-xs text-gray-500">&copy; {year} tripla. All rights reserved.</p>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-xs" aria-label="Footer navigation">
          <Link href="/" className="font-medium text-gray-700 underline-offset-2 hover:underline">
            Home
          </Link>
          <Link href="/pricing" className="font-medium text-gray-700 underline-offset-2 hover:underline">
            Pricing
          </Link>
        </nav>

        {/* Credits */}
        <p className="text-xs text-gray-400">
          Powered by{" "}
          <a
            href="https://aviationstack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-500 underline-offset-2 hover:underline"
          >
            Aviationstack
          </a>
          ,{" "}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-500 underline-offset-2 hover:underline"
          >
            Open-Meteo
          </a>
          ,{" "}
          <a
            href="https://anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-500 underline-offset-2 hover:underline"
          >
            Anthropic
          </a>
        </p>
      </div>
    </footer>
  );
}
