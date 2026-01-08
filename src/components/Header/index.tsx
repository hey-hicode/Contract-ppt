"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton, SignUpButton } from "@clerk/nextjs";
import { Menu, X, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import menuData from "./menuData";

const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => setNavbarOpen(!navbarOpen);

  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    setSticky(window.scrollY >= 30);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, []);

  const usePathName = usePathname();

  return (
    <>
      <header
        className={`header fixed top-0 left-0 w-full z-40 transition-all duration-300 ${sticky
            ? "bg-white/95 dark:bg-[#1d2430]/95 backdrop-blur-md shadow-md py-3"
            : "bg-transparent py-5"
          }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <Image
                  src="/images/logo/Counselor.png"
                  alt="logo"
                  width={140}
                  height={32}
                  className="w-auto h-8"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-10">
              {menuData.map((item) => (
                <Link
                  key={item.id}
                  href={item.path || "#"}
                  className={`text-base font-semibold transition-colors hover:text-primary ${usePathName === item.path
                      ? "text-primary dark:text-white"
                      : "text-dark dark:text-white/70"
                    }`}
                >
                  {item.title}
                </Link>
              ))}

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="bg-primary hover:bg-primary/90 text-white px-7 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton appearance={{ elements: { avatarBox: "h-9 w-9 shadow-md" } }} />
              </SignedIn>
            </nav>

            {/* Mobile Toggle */}
            <button
              onClick={navbarToggleHandler}
              className="lg:hidden p-2 text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Side Drawer */}
      <AnimatePresence>
        {navbarOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={navbarToggleHandler}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 left-0 h-full w-[280px] bg-white dark:bg-[#1d2430] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-white/10 bg-white dark:bg-[#1d2430]">
                <Image
                  src="/images/logo/Counselor.png"
                  alt="logo"
                  width={120}
                  height={30}
                  className="w-auto h-7"
                />
                <button
                  onClick={navbarToggleHandler}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white dark:bg-[#1d2430]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">
                  Navigation
                </p>
                <div className="space-y-1">
                  {menuData.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.path || "#"}
                        onClick={navbarToggleHandler}
                        className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-medium transition-all ${usePathName === item.path
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                      >
                        {IconComp && <IconComp size={20} />}
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#1d2430]">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                      Get Started Free
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-3xl">
                    <div className="flex items-center gap-3">
                      <UserButton />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold truncate max-w-[120px] dark:text-white">Account</span>
                        <span className="text-[10px] text-gray-500">Premium Plan</span>
                      </div>
                    </div>
                    <Link href="/dashboard" className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm hover:scale-105 transition-transform">
                      <LayoutGrid size={20} className="text-primary" />
                    </Link>
                  </div>
                </SignedIn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
