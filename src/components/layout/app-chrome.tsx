"use client";

import { usePathname } from "next/navigation";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import ScrollUp from "~/components/shared/ScrollUp";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/dashboard");

  return (
    <>
      {!hideChrome && <Header />}
      <main className="flex-1">{children}</main>
      {/* {!hideChrome && <Footer />} */}
      {!hideChrome && <ScrollUp />}
    </>
  );
}
