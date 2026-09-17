import type { ReactNode } from "react";
import Header from "./Header";
import FooterGate from "./FooterGate";

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
    <div className="flex min-h-screen flex-col bg-ut-bg text-ut-text">
     <Header />
      <main className={`flex-1 pt-16 ${className}`}>{children}</main>
     <FooterGate />
    </div>
  );
}
