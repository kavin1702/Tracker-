import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import BottomNavigation from "@/components/BottomNavigation";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Aura Learn - Track Your Learning Path",
  description: "Monitor, track, and log your learning paths day-to-day with ease. Designed for continuous growth.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f19",
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
    <html lang="en" className={`${outfit.variable}`}>
      <body className="flex justify-center min-h-screen bg-[#070a13] antialiased">
        {/* Mobile container centered on larger screens */}
        <div className="relative w-full max-w-md min-h-screen flex flex-col bg-[#0b0f19] text-gray-100 shadow-2xl border-x border-gray-900/50 overflow-x-hidden pb-20">
          {children}
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
