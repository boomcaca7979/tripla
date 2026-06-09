import type { ReactNode } from "react";
import AuthArt from "./AuthArt";

// ── Component ─────────────────────────────────────────────────────────
//
// Two-pane split layout used by /login and /signup.
//
//   • Desktop (≥ md): left art is `sticky top-0 h-screen` (50% width),
//     right pane scrolls with the page (50% width).
//   • Mobile:  left art is 40vh and stacks on top, right pane auto-sized.

export default function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white md:flex-row">
      {/* ── Left: art panel ──────────────────────────────── */}
      <aside
        className="relative h-[40vh] w-full flex-shrink-0 overflow-hidden md:sticky md:top-0 md:h-screen md:w-1/2"
        aria-label="Brand illustration"
      >
        <AuthArt />
      </aside>

      {/* ── Right: form panel ────────────────────────────── */}
      <main className="flex w-full flex-1 items-center justify-center bg-white px-6 py-10 sm:px-10 md:min-h-screen md:w-1/2 md:py-0">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}
