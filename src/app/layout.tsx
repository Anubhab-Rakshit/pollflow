import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/components/providers/socket-provider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pollflow | Real-time Voting Platform",
  description: "Create, share, and vote on polls instantly with real-time updates. No signup required.",
  openGraph: {
    title: "Pollflow | Next-Gen Voting",
    description: "Instant real-time polls for everyone. Create a poll in seconds.",
    url: "https://pollflow.vercel.app",
    siteName: "Pollflow",
    images: [
      {
        url: "https://pollflow.vercel.app/og-image.png", // specific image optimization not requested but good placeholder
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
    icon: "/favicon.ico",
  },
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
        <SocketProvider>
          {children}
          <Toaster position="bottom-right" />
        </SocketProvider>
      </body>
    </html>
  );
}
