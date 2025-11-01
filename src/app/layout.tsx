import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AppChrome from "~/components/layout/app-chrome";


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

      <body className={`bg-[#FCFCFC] dark:bg-black`}>
          <Toaster
            position="top-right"
            toastOptions={{
              className:
                "border border-sky-200 bg-white text-sky-900 shadow-lg shadow-sky-100",
            }}
          />
          <AppChrome>{children}</AppChrome>
        </body>
      </html>
    </ClerkProvider>
  );
}
