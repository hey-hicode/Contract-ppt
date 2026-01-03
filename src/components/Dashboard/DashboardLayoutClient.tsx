"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
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
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";


type UserPlanData = {
    plan: "free" | "premium";
    free_quota: number;
    used_quota: number;
    remainingCredits: number;
};

export default function DashboardLayoutClient({
    children,
    userPlan,
}: {
    children: React.ReactNode;
    userPlan: UserPlanData;
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

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
        { href: "/dashboard/contracts", label: "My Contracts", icon: FileText },
        { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
        { href: "/dashboard/glossary", label: "Glossary", icon: BookOpen },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const { user } = useUser();

    const PlanCard = () => (
        <div className="mt-auto  mb-6">
            <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4">
                <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {userPlan.plan === "premium" ? "Current Plan" : "Remaining Credits"}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {userPlan.plan === "premium"
                            ? ""
                            : `${userPlan.remainingCredits} / ${userPlan.free_quota}`}
                    </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "h-8 w-8",
                            },
                        }}
                    />
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {user?.fullName || "User"}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            {userPlan.plan === "free" ? "Free plan" : "Premium plan"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F7F9FC] dark:bg-black text-black dark:text-white">
            <div className="flex">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:sticky lg:top-0 lg:flex lg:flex-col lg:w-[15%] lg:shrink-0 lg:h-screen border-r border-white/10 bg-white dark:bg-gray-dark px-4">
                    <Image
                        src="/images/logo/Counselor.png"
                        alt="logo"
                        className="w-full h-auto rounded-full mt-1"
                        unoptimized
                        width={200}
                        height={200}
                    />

                    <Link
                        href="/dashboard/analyze"
                        className="my-4 inline-flex w-full items-center gap-2 rounded-md bg-primary px-3 py-3 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                        <UploadCloud size={16} /> Upload Contract
                    </Link>

                    <nav className="space-y-2 text-body-color text-base leading-relaxed! flex-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-4 rounded-md px-3 py-3 hover:bg-black/5 dark:hover:bg-white/10 ${pathname === link.href
                                    ? "text-primary font-medium bg-primary/5"
                                    : ""
                                    }`}
                            >
                                <link.icon size={20} /> {link.label}
                            </Link>
                        ))}
                    </nav>

                    <PlanCard />
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Top Nav */}
                    <header className="sticky top-0 z-20 flex h-[80px] items-center justify-between border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-gray-dark/80 backdrop-blur-md px-6 py-4 shadow-none transition-all duration-300">
                        <div className="flex items-center gap-4">
                            <button
                                aria-label={
                                    mobileNavOpen ? "Close navigation" : "Open navigation"
                                }
                                aria-expanded={mobileNavOpen}
                                aria-controls="mobile-nav"
                                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition-all active:scale-95"
                                onClick={() => setMobileNavOpen((v) => !v)}
                            >
                                {mobileNavOpen ? (
                                    <X
                                        size={20}
                                        className="transition-transform duration-300 rotate-90"
                                    />
                                ) : (
                                    <Menu
                                        size={20}
                                        className="transition-transform duration-300"
                                    />
                                )}
                            </button>
                            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                                {currentTitle}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/analyze"
                                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all active:scale-95"
                            >
                                <UploadCloud size={18} />
                                <span>Upload Contract</span>
                            </Link>
                            <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10 hidden sm:block" />
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox:
                                            "h-9 w-9 ring-2 ring-white dark:ring-white/10 shadow-md",
                                    },
                                }}
                            />
                        </div>
                    </header>

                    {/* Mobile Nav Overlay (Framer Motion) */}
                    <AnimatePresence>
                        {mobileNavOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setMobileNavOpen(false)}
                                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                                />

                                {/* Sidebar Drawer */}
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "-100%" }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="fixed top-0 left-0 z-50 h-full w-[280px] bg-white dark:bg-gray-dark shadow-2xl lg:hidden flex flex-col"
                                >
                                    <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-white/10">
                                        <span className="text-xl font-bold ">Menu</span>
                                        <button
                                            onClick={() => setMobileNavOpen(false)}
                                            className="p-2 rounded-full border hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-2 flex flex-col">
                                        {navLinks.map((link, i) => (
                                            <motion.div
                                                key={link.href}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 + 0.1 }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setMobileNavOpen(false)}
                                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${pathname === link.href
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                                                        }`}
                                                >
                                                    <link.icon size={20} />
                                                    {link.label}
                                                </Link>
                                            </motion.div>
                                        ))}

                                        <div className="mt-auto pt-4">
                                            <PlanCard />
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="pt-4 mt-4 border-t border-gray-100 dark:border-white/10"
                                        >
                                            <Link
                                                href="/dashboard/analyze"
                                                onClick={() => setMobileNavOpen(false)}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                                            >
                                                <UploadCloud size={18} /> Upload Contract
                                            </Link>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    <div className={`${pathname === "/dashboard" || pathname === "/dashboard/contracts" ? "" : "px-3 sm:px-6 py-6 sm:py-8"} w-full max-w-full overflow-hidden`}>{children}</div>
                </main>
            </div>
        </div>
    );
}
