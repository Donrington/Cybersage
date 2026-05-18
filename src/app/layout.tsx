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

const BASE_URL = "https://cybersage.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Cybersage // Abakwe Carrington — Full Stack Engineer & System Architect",
    template: "%s | Cybersage // Abakwe Carrington",
  },
  description:
    "5+ years of mastery in building high-performance, scalable web applications. Specialist in Go, React, Python, and Microservices. Auditing digital complexity through the lens of Digital Wisdom.",
  keywords: [
    "Full Stack Engineer",
    "Software Architect",
    "React Developer",
    "Go Backend Engineer",
    "Django Expert",
    "System Performance Optimization",
    "Abakwe Carrington",
    "Cybersage Portfolio",
    "Remote Senior Full Stack Engineer",
    "Remote Senior Developer",
    "Next.js Developer",
    "PostgreSQL",
    "Microservices Architecture",
  ],
  authors: [{ name: "Abakwe Carrington ChimaObinna", url: BASE_URL }],
  creator: "Abakwe Carrington ChimaObinna",
  publisher: "Cybersage",
  category: "Technology",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Cybersage",
    title: "Cybersage // The Digital Wisdom of Abakwe Carrington",
    description:
      "Exploring the intersection of high-performance engineering and architectural integrity.",
    images: [
      {
        url: "/og-system-audit.png",
        width: 1200,
        height: 630,
        alt: "Cybersage — System Audit Social Card featuring Electric Emerald and Tiger Flame palette",
        type: "image/png",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cybersage // Abakwe Carrington — Full Stack Engineer",
    description:
      "5+ years building high-performance web systems. Go · React · Django · Microservices. Digital Wisdom, engineered.",
    images: ["/og-system-audit.png"],
    creator: "@CarlSwitch_CHUG",
    site: "@CarlSwitch_CHUG",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: undefined, // add your Search Console token here when available
  },
};

const PERSON_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Abakwe Carrington ChimaObinna",
  alternateName: "Cybersage",
  url: BASE_URL,
  image: `${BASE_URL}/og-system-audit.png`,
  sameAs: [
    "https://www.linkedin.com/in/carrington-abakwe-b0b0a0217",
    "https://github.com/Donrington",
    "https://x.com/CarlSwitch_CHUG",
  ],
  jobTitle: "Full Stack Software Engineer",
  description:
    "Full Stack Software Engineer with 5+ years building high-performance, scalable web applications. Specialist in Go, React, Python, and Microservices.",
  knowsAbout: [
    "Full Stack Development",
    "Microservices Architecture",
    "Cloud Computing",
    "System Optimization",
    "API Design",
    "Python",
    "Go",
    "React",
    "Django",
    "PostgreSQL",
    "Next.js",
    "Redis",
    "Docker",
    "AWS",
  ],
  worksFor: [
    { "@type": "Organization", name: "Recoverderm" },
    { "@type": "Organization", name: "Autoboy Express" },
    { "@type": "Organization", name: "NextGen Robotics" },
    { "@type": "Organization", name: "Axflo Oil & Gas" },
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Federal University of Technology Owerri",
    alternateName: "FUTO",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Remote",
    addressCountry: "NG",
  },
  email: "carryoby@gmail.com",
};

const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Cybersage",
  url: BASE_URL,
  description:
    "Portfolio of Abakwe Carrington — Full Stack Engineer & System Architect",
  author: { "@type": "Person", name: "Abakwe Carrington ChimaObinna" },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
        />
      </head>
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
