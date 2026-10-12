import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thoughtlab.studio"),
  title: {
    default: "ThoughtLab® — Software, thoughtfully made.",
    template: "%s — ThoughtLab"
  },
  description:
    "ThoughtLab is an independent software development company building thoughtful digital products, platforms, and experiences.",
  applicationName: "ThoughtLab",
  openGraph: {
    type: "website",
    title: "ThoughtLab® — Software, thoughtfully made.",
    description:
      "ThoughtLab is an independent software development company building thoughtful digital products, platforms, and experiences.",
    siteName: "ThoughtLab",
    url: "https://thoughtlab.studio"
  },
  twitter: {
    card: "summary_large_image",
    title: "ThoughtLab® — Software, thoughtfully made.",
    description:
      "ThoughtLab is an independent software development company building thoughtful digital products, platforms, and experiences."
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://thoughtlab.studio" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f6f3"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareCompany",
    name: "ThoughtLab",
    url: "https://thoughtlab.studio",
    email: "hello@thoughtlab.studio",
    description:
      "An independent software and AI studio building thoughtful digital products and intelligent systems."
  };
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
