import type { Metadata } from "next";
import localFont from "next/font/local";
import { LanguageProvider } from "@/lib/i18n";
import PageWrapper from "@/components/layout/PageWrapper";
import "./globals.css";

const geistSans = localFont({
  variable: "--font-geist-sans",
  src: [
    { path: "../../public/fonts/Geist-Light.ttf", weight: "300" },
    { path: "../../public/fonts/Geist-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Geist-Medium.ttf", weight: "500" },
    { path: "../../public/fonts/Geist-SemiBold.ttf", weight: "600" },
    { path: "../../public/fonts/Geist-Bold.ttf", weight: "700" },
  ],
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: [
    { path: "../../public/fonts/GeistMono-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/GeistMono-Medium.ttf", weight: "500" },
    { path: "../../public/fonts/GeistMono-Bold.ttf", weight: "700" },
  ],
});

const SITE_URL = "https://travel-planner-two-livid.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "tripla - AI-Powered Travel Planner",
    template: "%s | tripla",
  },
  description:
    "Plan smarter. Travel better. AI-powered trip planning with real-time flights, weather, and personalized itineraries.",
  keywords: [
    "travel planner",
    "AI itinerary",
    "trip planning",
    "flights",
    "weather",
    "travel guide",
  ],
  icons: {
    icon: "/logo-icon.svg",
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "tripla - AI-Powered Travel Planner",
    description:
      "Plan smarter. Travel better. AI-powered trip planning with real-time flights, weather, and personalized itineraries.",
    url: SITE_URL,
    siteName: "tripla",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tripla - AI-Powered Travel Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tripla - AI-Powered Travel Planner",
    description:
      "Plan smarter. Travel better. AI-powered trip planning with real-time flights, weather, and personalized itineraries.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LanguageProvider>
          <PageWrapper>{children}</PageWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
