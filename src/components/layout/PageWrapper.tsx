import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

// ── Props ────────────────────────────────────────────────────────────

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

// ── Component ────────────────────────────────────────────────────────

export default function PageWrapper({
  children,
  className = "",
}: PageWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
     <Header />
      <main className={`flex-1 pt-20 ${className}`}>{children}</main>
     <Footer />
    </div>
  );
}
