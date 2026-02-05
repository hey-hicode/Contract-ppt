import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppChrome from "~/components/layout/app-chrome";


export const metadata: Metadata = {
  metadataBase: new URL("https://www.counselr.io"),
  title: {
    default: "Counselr — AI Contract Analyzer for Freelancers",
    template: "%s | Counselr",
  },
  description:
    "Counselr is an AI contract analyzer for freelancers. Review contracts fast, uncover hidden clauses, and understand risks without legal fees.",
  keywords: [
    "AI contract analyzer",
    "contract analysis",
    "freelancer contracts",
    "hidden clauses",
    "contract review",
    "legal review without a lawyer",
    "contract risk",
  ],
  icons: {
    icon: "/icons/counselr/favicon.ico",
    shortcut: "/icons/counselr/favicon-16x16.png",
    apple: "/icons/counselr/apple-touch-icon.png",
  },
  manifest: "/icons/counselr/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Counselr — AI Contract Analyzer for Freelancers",
    description:
      "Review contracts fast, uncover hidden clauses, and understand risks without legal fees.",
    url: "https://www.counselr.io",
    siteName: "Counselr",
    type: "website",
    images: "/icons/counselr/android-chrome-512x512.png",
  },
  twitter: {
    card: "summary_large_image",
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
          <AppChrome>{children}</AppChrome>
        </body>
      </html>
    </ClerkProvider>
  );
}
