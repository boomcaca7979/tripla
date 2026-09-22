import type { ReactNode } from "react";
import HeaderGate from "./HeaderGate";
import FooterGate from "./FooterGate";

// ── Props ────────────────────────────────────────────────────────────

interface PageWrapperProps {
  children: ReactNode;
}

// ── Component ────────────────────────────────────────────────────────

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="flex min-h-screen flex-col bg-ut-bg text-ut-text">
      {/* Header 与它等高的占位块（原 pt-16）统一由 HeaderGate 管理：
          认证页豁免整站 chrome，其余路由与原行为等价。 */}
      <HeaderGate />
      <main className="flex-1">{children}</main>
      <FooterGate />
    </div>
  );
}
