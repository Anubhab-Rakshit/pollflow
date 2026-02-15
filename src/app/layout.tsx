import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google"; // Mixed typography for premium feel
import "./globals.css";

import { Toaster } from "react-hot-toast";
import { OfflineBanner } from "@/components/offline-banner";
import { PWARegister } from "@/components/sw-register";
import MeshBackground from "@/components/mesh-background";
import { CustomCursor } from "@/components/custom-cursor";
import { ThemeTransition } from "@/components/theme-transition";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background overflow-x-hidden selection:bg-white/30`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CustomCursor />
          <ThemeTransition />
          <MeshBackground />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
