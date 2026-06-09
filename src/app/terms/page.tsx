import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · tripla",
  description: "Terms of Service for tripla.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: June 9, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using tripla (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. Description of Service</h2>
            <p className="mt-2">
              tripla provides AI-powered travel planning tools, including itinerary generation, flight search, weather forecasts, and currency conversion. The Service is provided &quot;as is&quot; and is intended for informational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. User Accounts</h2>
            <p className="mt-2">
              You may need to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Acceptable Use</h2>
            <p className="mt-2">
              You agree not to misuse the Service, including but not limited to: attempting to gain unauthorized access, using the Service for unlawful purposes, or interfering with the Service&apos;s operation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Intellectual Property</h2>
            <p className="mt-2">
              All content, features, and functionality of the Service are owned by tripla and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Limitation of Liability</h2>
            <p className="mt-2">
              tripla shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Travel information provided by the Service should be independently verified.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Changes to Terms</h2>
            <p className="mt-2">
              We may update these Terms from time to time. We will notify you of any material changes by posting the updated Terms on this page with a new &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Contact</h2>
            <p className="mt-2">
              If you have questions about these Terms, please contact us at support@tripla.app.
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-500">
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
