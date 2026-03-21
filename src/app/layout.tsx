import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { GrainOverlay } from "@/components/GrainOverlay";
import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cybersage - Digital Wisdom",
  description: "Full Stack Software Engineer Portfolio | Ultra-modern creative development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased lenis`}
    >
      <body className="min-h-full flex flex-col bg-cybersage-charcoal">
        <SmoothScroll>
          <Navbar />
          {children}
          <ScrollToTop />
          <GrainOverlay />
        </SmoothScroll>
      </body>
    </html>
  );
}
