import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { LanguageProvider } from "@/lib/i18n";
import PageWrapper from "@/components/layout/PageWrapper";
import { Analytics } from "@vercel/analytics/next";
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

// Display 衬线（编辑感标题）：单字重 400，构建时自托管，浏览器不请求 Google。
// Hero H1 的 <em class="italic"> 需要真实 italic face —— 本项目 next/font 的 API
// （node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts）支持
// style 为数组，这里同时声明 normal + italic，浏览器不再做 synthetic oblique。
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const SITE_URL = "https://www.utripla.xyz";

export const metadata: Metadata = {
  title: {
    default: "tripla — Interactive Travel Discovery",
    template: "%s | tripla",
  },
  description:
    "Wander a living atlas of destinations, stolen routes and field notes. No sign-up wall, no search box in your face — open it and see what pulls you in.",
  keywords: [
    "travel discovery",
    "travel guides",
    "destinations",
    "trip routes",
    "flights",
    "weather",
    "field notes",
  ],
  icons: {
    icon: "/logo-icon.svg",
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "tripla — Interactive Travel Discovery",
    description:
      "Wander a living atlas of destinations, stolen routes and field notes — no sign-up wall, no search box in your face.",
    url: SITE_URL,
    siteName: "tripla",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tripla — Interactive Travel Discovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tripla — Interactive Travel Discovery",
    description:
      "Wander a living atlas of destinations, stolen routes and field notes — no sign-up wall, no search box in your face.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "6NfzV4jDrn7EmYOo2xrEBg-hA2YnOu3ewbRhMrj_3Ro",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4267926791604017"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <LanguageProvider>
          <Analytics />
          <PageWrapper>{children}</PageWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}
