import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

import NoiseOverlay from "@/components/NoiseOverlay";

import SystemHUD from "@/components/SystemHUD";
import RestOverlay from "@/components/RestOverlay";
import ShutterOverlay from "@/components/ShutterOverlay";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Boku no Portofolio",
  description: "Im learning shi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} antialiased`}
      >
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
