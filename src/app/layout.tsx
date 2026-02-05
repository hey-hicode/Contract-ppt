import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppChrome from "~/components/layout/app-chrome";
import { Analytics } from "@vercel/analytics/react";


export const metadata: Metadata = {
  title: "Counselr· AI contract review for creators",
  description:
    "Upload and analyze label, brand, and sponsorship contracts with creator-focused AI insights.",
  icons: {
    icon: "/icons/counselr/favicon.ico",
    shortcut: "/icons/counselr/favicon-16x16.png",
    apple: "/icons/counselr/apple-touch-icon.png",
  },
  manifest: "/icons/counselr/site.webmanifest",
  openGraph: {
    images: "/icons/counselr/android-chrome-512x512.png",
  },
  twitter: {
    card: "summary",
    images: "/icons/counselr/android-chrome-512x512.png",
  },
};

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

        <body className={`bg-[#FCFCFC] dark:bg-black`}>
          <Toaster
            position="top-right"

            toastOptions={{
              className:
                "border  bg-white z-[9999] text-sm t  ",
            }}
          />
          <Analytics />

          <AppChrome>{children}</AppChrome>
        </body>
      </html>
    </ClerkProvider>
  );
}
