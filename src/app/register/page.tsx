import type { Metadata } from "next";
import AuthScreen from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a free tripla account to plan trips, save places and keep your travel notes in one place.",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return <AuthScreen initialMode="register" />;
}
