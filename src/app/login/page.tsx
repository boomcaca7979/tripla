import type { Metadata } from "next";
import AuthScreen from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to tripla to reach your trips, saved places, expenses and inbox.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <AuthScreen initialMode="login" />;
}
