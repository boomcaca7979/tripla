import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  // 标题不带后缀：root layout 的 template 会追加 "| tripla"，
  // 否则渲染成 "Privacy Policy · tripla | tripla"。
  title: "Privacy Policy",
  description: "Privacy Policy for tripla.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500">Last updated: June 9, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Information We Collect</h2>
            <p className="mt-2">
              We collect information you provide directly, such as your name, email address, and travel preferences. We also collect usage data automatically, including pages visited and features used.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h2>
            <p className="mt-2">
              We use your information to provide and improve the Service, personalize your travel recommendations, and ensure the security of our platform. Browsing the Service does not require an account, and all content is anonymously accessible. If you choose to create one, your email address is stored with our authentication provider so you can sign in again. Preferences you choose (such as temperature unit or currency) are stored only on your own device.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. Information Sharing</h2>
            <p className="mt-2">
              We do not sell your personal information. We may share your data with third-party service providers who assist in operating the Service (e.g., weather APIs, flight data providers) only as necessary to deliver the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Data Security</h2>
            <p className="mt-2">
              We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Cookies</h2>
            <p className="mt-2">
              We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Your Rights</h2>
            <p className="mt-2">
              You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, contact us at support@tripla.app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Data Retention</h2>
            <p className="mt-2">
              We retain your personal information only for as long as needed to provide the Service. Data stored on your device (such as saved preferences or locally saved itineraries) never leaves your device and can be removed at any time by clearing your browser storage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">8. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a new &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">9. Contact</h2>
            <p className="mt-2">
              If you have questions about this Privacy Policy, please contact us at support@tripla.app.
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-500">
          <Link href="/terms" className="text-blue-600 hover:text-blue-700">
            Terms of Service
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
