"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton, SignUpButton } from "@clerk/nextjs";
import { Menu, X, LayoutGrid, Zap, DollarSign, Users, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";

const Header = () => {
  const lenis = useLenis();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => setNavbarOpen(!navbarOpen);

  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    setSticky(window.scrollY >= 30);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    lenis?.scrollTo(`#${id.toLowerCase()}`, {
      offset: -100,
      duration: 1.5,
    });
    if (navbarOpen) setNavbarOpen(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => window.removeEventListener("scroll", handleStickyNavbar);
  }, []);

  const usePathName = usePathname();

  return (
    <>
      <header
        className={`header fixed top-6 left-1/2 -translate-x-1/2 w-[95%]  max-w-[1000px] z-50 transition-all duration-300 ${sticky
          ? "py-2"
          : "py-4"
          }`}
      >
        <div className={`mx-auto px-6 py-2 md:py-3 md:h-20 rounded-full transition-all backdrop-blur-sm duration-300 true-glass ${sticky ? "shadow-xl" : "shadow-lg"}`}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <Image
                  src="/images/logo/Counselor.png"
                  alt="logo"
                  width={140}
                  height={40}
                  className=" "
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {["Features", "Pricing", "Testimonials"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => scrollToSection(e, item)}
                  scroll={false}
                  className="text-sm font-medium transition-all hover:text-primary text-dark dark:text-white/80"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center gap-6">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-2xl font-bold transition-all active:scale-95 text-sm shadow-md shadow-primary/20">
                    Get Started
                  </button>

                </SignUpButton>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox:
                        "h-9 w-9 ring-2 ring-white dark:ring-white/10 shadow-md",
                    },
                  }}
                />
              </SignedOut>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={navbarToggleHandler}
              className="lg:hidden p-2 text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <Menu size={24} />
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
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[300px] bg-white/90 dark:bg-black/90 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden border-l border-white/20"
            >
              {/* Drawer Header */}
              <div className="p-8 flex items-center justify-between border-b border-gray-100 dark:border-white/10">
                <Link href="/" className="block">
                  <Image
                    src="/images/logo/Counselor.png"
                    alt="logo"
                    width={120}
                    height={30}
                    className=""
                  />
                </Link>
                <button
                  onClick={navbarToggleHandler}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-3">
                  {[
                    { name: "Features", icon: Zap },
                    { name: "Video", icon: MessageSquare },
                    { name: "Brands", icon: LayoutGrid },
                    { name: "About", icon: Users },
                    { name: "Testimonials", icon: MessageSquare },
                    { name: "Pricing", icon: DollarSign },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                      >
                        <Link
                          href={`#${item.name.toLowerCase()}`}
                          onClick={(e) => scrollToSection(e, item.name)}
                          scroll={false}
                          className="flex items-center gap-4 px-5 py-4 rounded-3xl font-semibold transition-all text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary group"
                        >
                          <div className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 group-hover:bg-primary/20 transition-colors">
                            <Icon size={18} />
                          </div>
                          <span className="text-base">{item.name}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#1d2430]">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                      Get Started
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
