import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

export const metadata: Metadata = {
  title: "Forgot Password · tripla",
  description: "Reset your tripla account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout>
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}
