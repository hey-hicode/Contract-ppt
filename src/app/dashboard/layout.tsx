"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutGrid,
  UploadCloud,
  FileText,
  MessageSquare,
  BookOpen,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "~/components/ui/sheet";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/glossary": "Glossary",
    "/dashboard/contracts": "My Contracts",
    "/dashboard/chat": "AI Chat",
    "/dashboard/settings": "Settings",
  };
  const currentTitle = titleMap[pathname] ?? "Dashboard";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-black text-black dark:text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:sticky lg:top-0 lg:block lg:w-[260px] lg:shrink-0 lg:h-screen lg:overflow-y-auto border-r border-white/10 bg-white dark:bg-gray-dark px-4">
    

                <Image src="/images/couns.jpeg" alt="logo" className="w-full h-auto rounded-full mt-1" unoptimized width={200} height={200} />

          <Link
            href="/dashboard/analyze"
            className="my-4 inline-flex w-full items-center gap-2 rounded-md  bg-primary px-3 py-3 text-sm font-semibold text-white hover:bg-primary/90"
          >
            <UploadCloud size={16} /> Upload Contract
          </Link>

          <nav className="space-y-2  text-body-color text-base leading-relaxed!">
            <Link
              href="/dashboard"
              className="flex items-center gap-4 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <LayoutGrid size={20} /> Dashboard
            </Link>
            <Link
              href="/dashboard/contracts"
              className="flex items-center gap-4 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <FileText size={20} /> My Contracts
            </Link>
            <Link
              href="/dashboard/chat"
              className="flex items-center gap-4 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <MessageSquare size={20} /> AI Chat
            </Link>
            <Link
              href="/dashboard/glossary"
              className="flex items-center gap-4 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <BookOpen size={20} /> Glossary
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-4 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Settings size={20} /> Settings
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top Nav */}
          <header className="sticky top-0 z-20 flex h-[80px] items-center justify-between border-b border-white/10 bg-white dark:bg-gray-dark px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-nav"
                className="lg:hidden inline-flex items-center gap-2 rounded-md px-3 py-2 "
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                {mobileNavOpen ? (
                  <X size={18} className="transition-transform duration-300 rotate-90" />
                ) : (
                  <Menu size={18} className="transition-transform duration-300" />
                )}
             
              </button>
              <h2 className="text-2xl font-semibold">{currentTitle}</h2>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/analyze"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                <UploadCloud size={16} /> Upload Contract
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "shadow" } }} />
            </div>
          </header>
          {/* Mobile Nav Drawer */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent side="left" id="mobile-nav" className="w-full sm:max-w-xs flex flex-col max-h-[100vh] overflow-hidden">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="absolute right-4 top-4">
                <SheetClose asChild>
                  <button
                    aria-label="Close navigation"
                    className="inline-flex items-center gap-2 rounded-md bg-black/5 dark:bg-white/10 px-3 py-2 transition-colors hover:bg-black/10 dark:hover:bg-white/20"
                  >
                    <X size={16} className="transition-transform duration-300" /> Close
                  </button>
                </SheetClose>
              </div>
              <div className="mt-4 space-y-2 flex-1 overflow-y-auto">
                <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10">
                  <LayoutGrid size={20} /> Dashboard
                </Link>
                <Link href="/dashboard/contracts" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10">
                  <FileText size={20} /> My Contracts
                </Link>
                <Link href="/dashboard/chat" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10">
                  <MessageSquare size={20} /> AI Chat
                </Link>
                <Link href="/dashboard/glossary" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10">
                  <BookOpen size={20} /> Glossary
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10">
                  <Settings size={20} /> Settings
                </Link>
                <Link
                  href="/dashboard/analyze"
                  className="mt-2 inline-flex w-full items-center gap-2 rounded-md bg-primary px-3 py-3 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  <UploadCloud size={16} /> Upload Contract
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <div className="px-3 sm:px-6 py-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
