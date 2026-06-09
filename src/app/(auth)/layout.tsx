import type { ReactNode } from "react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

// ── Auth route group layout ───────────────────────────────────────────
//
// Strips the global Header / Footer and gives the auth screens a clean,
// edge-to-edge split layout (dark art on the left, white form on the right).

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}
