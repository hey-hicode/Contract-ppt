import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SiteHeader } from "~/components/layout/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContractPPT · AI contract review for creators",
  description:
    "Upload and analyze label, brand, and sponsorship contracts with creator-focused AI insights.",
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
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background antialiased flex flex-col`}
        >
          <Toaster
            position="top-center"
            toastOptions={{
              className:
                "border border-sky-200 bg-white text-sky-900 shadow-lg shadow-sky-100",
            }}
          />
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
