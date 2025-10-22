"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { cn } from "~/lib/utils";

const navLinks = [
  { href: "/", label: "Overview" },
  { href: "/analyze", label: "Analyzer" },
  { href: "#integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-white/10 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-950/80 text-white backdrop-blur-xl">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(89,152,255,0.35),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(220,20,140,0.25),_transparent_60%)]" />
      </div>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-white"
        >
          <span className="relative inline-flex items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 via-purple-500 to-rose-500 blur-md opacity-80" />
            <span className="relative flex size-8 items-center justify-center rounded-full bg-slate-900 text-xs uppercase tracking-[0.3em]">
              CP
            </span>
          </span>
          ContractPPT
        </Link>

        <nav className="hidden items-center gap-1 text-sm text-slate-200 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href.startsWith("#")
                ? pathname === "/"
                : pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 transition-colors hover:bg-white/10",
                  isActive && "bg-white/10 text-white"
                )}
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 rounded-full border border-white/10 opacity-40" />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-sky-500/10 transition hover:border-white/40 hover:bg-white/20"
              >
                Sign in
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <SignOutButton>
              <button
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:border-white/30 hover:bg-white/20"
              >
                Sign out
              </button>
            </SignOutButton>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { avatarBox: "size-9 border border-white/20 rounded-full" },
              }}
            />
          </SignedIn>
        </div>

        <button
          className="flex items-center justify-center rounded-full border border-white/20 bg-white/10 p-2 text-white md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="px-6 pb-6 md:hidden">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-sky-500/10">
            <div className="flex flex-col gap-2 text-sm text-slate-100">
              {navLinks.map((link) => {
                const isActive =
                  link.href.startsWith("#")
                    ? pathname === "/"
                    : pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 transition hover:bg-white/10",
                      isActive && "bg-white/15 text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/20">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <SignOutButton>
                  <button className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/15">
                    Sign out
                  </button>
                </SignOutButton>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
