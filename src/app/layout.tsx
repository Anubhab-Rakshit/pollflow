import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { Toaster } from "react-hot-toast";
import { OfflineBanner } from "@/components/offline-banner";
import { PWARegister } from "@/components/sw-register";
import { Particles } from "@/components/particles";
import { CustomCursor } from "@/components/custom-cursor";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
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
        url: "https://pollflow-theta.vercel.app/og-image.png",
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
  themeColor: "#0f172a", // Deep navy
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
      <body className={`${plusJakarta.variable} font-sans antialiased text-foreground overflow-x-hidden selection:bg-primary/30`}>
        <CustomCursor />
        <div className="fixed inset-0 z-[-1] animate-gradient-slow bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]" />
        <Particles />
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
        <OfflineBanner />
        <PWARegister />
        <Toaster position="top-center" toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
          }
        }} />
      </body>
    </html>
  );
}
