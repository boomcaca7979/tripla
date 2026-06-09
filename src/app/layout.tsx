import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "tripla",
  description: "AI-powered travel planner",
  icons: {
    icon: "/logo-icon.svg",
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
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}
