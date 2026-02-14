import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "react-hot-toast";
import { OfflineBanner } from "@/components/offline-banner";
import { PWARegister } from "@/components/sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pollflow - Real-time Polls",
  description: "Create and share real-time polls instantly.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pollflow",
  },
  openGraph: {
    title: "Pollflow | Next-Gen Voting",
    description: "Instant real-time polls for everyone. Create a poll in seconds.",
    url: "https://pollflow-theta.vercel.app",
    siteName: "Pollflow",
    images: [
      {
        url: "https://pollflow-theta.vercel.app/og-image.png", // specific image optimization not requested but good placeholder
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pollflow | Real-time Voting",
    description: "Instant real-time polls for everyone.",
    creator: "@pollflow",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PWARegister />
        <OfflineBanner />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
