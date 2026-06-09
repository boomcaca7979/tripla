import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up · tripla",
  description: "Create a tripla account to save and share your itineraries.",
};

export default function SignupPage() {
  return <SignupForm />;
}
