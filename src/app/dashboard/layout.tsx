"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutGrid,
  UploadCloud,
  FileText,
  MessageSquare,
  BookOpen,
  Settings,
} from "lucide-react";
import { Input } from "~/components/ui/input";

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
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-black text-black dark:text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 w-[260px] shrink-0 h-screen overflow-y-auto border-r border-white/10 bg-white dark:bg-gray-dark pt-10 p-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-white">
                <LayoutGrid size={18} />
              </div>
              <span className="font-semibold">Counselr</span>
            </div>
          </div>

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
            <h2 className="text-2xl font-semibold">{currentTitle}</h2>

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
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
