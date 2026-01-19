import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

import NoiseOverlay from "@/components/NoiseOverlay";
import ScrollReset from "@/components/ScrollReset";

import SystemHUD from "@/components/SystemHUD";
import RestOverlay from "@/components/RestOverlay";
import ShutterOverlay from "@/components/ShutterOverlay";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jetbrains-mono",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Boku no Portofolio",
  description: "Im learning shi",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents pinch-zoom which can sometimes trigger bounce
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${playfairDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        <ScrollReset />
        <SmoothScroll>
          <RestOverlay />
          <SystemHUD />
          <NoiseOverlay />
          <ShutterOverlay />
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
