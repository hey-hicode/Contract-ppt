import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppChrome from "~/components/layout/app-chrome";
import { Analytics } from "@vercel/analytics/react";


export const metadata: Metadata = {
  metadataBase: new URL("https://counselr.io"),
  title: {
    default: "Counselr | AI Contract Review for Creators & Freelancers ",
    template: "%s | Counselr"
  },
  description:
    "Protect your creative business with Counselr. Shield yourself from bad clauses in label, brand, and sponsorship deals with instant, expert insights.",
  keywords: [
    "AI contract review",
    "creator contracts",
    "influencer legal help",
    "sponsorship contract analysis",
    "freelance lawyer AI",
    "Counselr AI",
    "contract risk assessment"
  ],
  authors: [{ name: "Counselr Team" }],
  creator: "Counselr",
  publisher: "Counselr",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/counselr/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/counselr/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/counselr/favicon.ico" },
    ],
    apple: "/icons/counselr/apple-touch-icon.png",
  },
  manifest: "/icons/counselr/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://counselr.io",
    siteName: "Counselr",
    title: "Counselr | AI Contract Review for Creators",
    description: "Analyze contracts with AI and negotiate like a pro.",
    images: [
      {
        url: "/icons/counselr/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Counselr AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Counselr | AI Contract Review for Creators",
    description: "Analyze contracts with AI and negotiate like a pro.",
    images: ["/icons/counselr/android-chrome-512x512.png"],
    creator: "@counselr_io",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import SmoothScroll from "~/components/shared/SmoothScroll";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-200",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <Script
            id="schema-org"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Counselr",
                "url": "https://counselr.io",
                "logo": "https://counselr.io/icons/counselr/android-chrome-512x512.png",
                "sameAs": [
                  "https://twitter.com/counselr_io"
                ]
              })
            }}
          />
        </head>
        <body className={`bg-[#FCFCFC] dark:bg-black`}>
          <Toaster
            position="top-right"

            toastOptions={{
              className:
                "border  bg-white z-[9999] text-sm t  ",
            }}
          />
          <Analytics />

          <SmoothScroll>
            <AppChrome>{children}</AppChrome>
          </SmoothScroll>
        </body>
      </html>
    </ClerkProvider>
  );
}
