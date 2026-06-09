import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in · tripla",
  description: "Sign in to continue planning your trips with tripla.",
};

export default function LoginPage() {
  return <LoginForm />;
}
